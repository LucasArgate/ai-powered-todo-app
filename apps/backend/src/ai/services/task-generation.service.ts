import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { TasksService } from '../../tasks/tasks.service';
import { UsersService } from '../../users/users.service';
import { TaskListsService, TaskListWithTasksAndCounts } from '../../task-lists/task-lists.service';
import { LangChainService, LLMProvider, LLMConfig } from './langchain.service';
import { GenerateTasksDto } from '../dto/ai.dto';
import { TaskSuggestion } from '../parsers/task.parser';

@Injectable()
export class TaskGenerationService {
  private readonly logger = new Logger(TaskGenerationService.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly taskListsService: TaskListsService,
    private readonly langChainService: LangChainService,
  ) {}

  /**
   * Generates tasks from a prompt and saves them to the database
   */
  async generateTasksFromPrompt(userId: string, dto: GenerateTasksDto): Promise<any[]> {
    const { prompt, listName, provider = 'huggingface' } = dto;
    
    try {
      // Get user data (including API key)
      const user = await this.usersService.findOne(userId);
      
      // Check if user has API key configured
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Check if user's provider matches the requested one
      if (user.aiIntegrationType && user.aiIntegrationType !== provider) {
        this.logger.warn(`User ${userId} has ${user.aiIntegrationType} configured but requested ${provider}`);
      }
      
      // Map provider to LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validate configuration
      const config = this.createLLMConfig(user, dto, llmProvider);
      this.langChainService.validateConfig(config);
      
      // Create TaskList if listName was provided
      let taskListId = 'default-list';
      if (listName) {
        const taskList = await this.taskListsService.create({
          userId,
          name: listName,
          description: `Lista de tarefas gerada para: ${prompt}`,
          iaPrompt: prompt
        });
        taskListId = taskList.id;
      }
      
      // Generate tasks using LangChain
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      // Save generated tasks to database
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: taskListId,
          title: taskData.title,
          description: taskData.description,
          position: i,
          priority: taskData.priority,
          category: taskData.category,
        }, userId);
        savedTasks.push(task);
      }

      this.logger.log(`Generated ${savedTasks.length} tasks from prompt: "${prompt}" for user ${userId}${listName ? ` in list "${listName}"` : ''}`);
      return savedTasks;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error generating tasks:', error.message);
      throw new BadRequestException('Failed to generate tasks from AI service');
    }
  }

  /**
   * Generates a complete task list from a prompt
   */
  async generateTaskListFromPrompt(userId: string, dto: GenerateTasksDto): Promise<TaskListWithTasksAndCounts> {
    const { prompt, listName, provider = 'huggingface' } = dto;
    
    try {
      // Get user data (including API key)
      const user = await this.usersService.findOne(userId);
      
      // Check if user has API key configured
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Check if user's provider matches the requested one
      if (user.aiIntegrationType && user.aiIntegrationType !== provider) {
        this.logger.warn(`User ${userId} has ${user.aiIntegrationType} configured but requested ${provider}`);
      }
      
      // Map provider to LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validate configuration
      const config = this.createLLMConfig(user, dto, llmProvider);
      this.langChainService.validateConfig(config);
      
      // Use provided listName/description or generate using AI
      const listTitle = listName || await this.generateListTitle(prompt, config);
      const listDescription = dto.description || await this.generateListDescription(prompt, config);
      
      // Create the TaskList
      const taskList = await this.taskListsService.create({
        userId,
        name: listTitle,
        description: listDescription,
        iaPrompt: prompt
      });
      
      // Generate tasks using LangChain
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      // Save tasks to the created list
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: taskList.id, // Use the created list ID
          title: taskData.title,
          description: taskData.description,
          position: i,
          priority: taskData.priority,
          category: taskData.category,
        }, userId);
        savedTasks.push(task);
      }
      
      // Return complete list with tasks
      const taskListsWithTasks = await this.taskListsService.findByUserIdWithTasksAndCounts(userId);
      const result = taskListsWithTasks.find(list => list.id === taskList.id);
      
      this.logger.log(`Generated TaskList "${listTitle}" with ${savedTasks.length} tasks from prompt: "${prompt}" for user ${userId}`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error generating task list:', error.message);
      throw new BadRequestException('Failed to generate task list from AI service');
    }
  }

  /**
   * Maps old providers to new LLMProviders
   */
  private mapProvider(provider: string): LLMProvider {
    const providerMap: Record<string, LLMProvider> = {
      'huggingface': 'huggingface',
      'openrouter': 'openrouter',
    };
    
    return providerMap[provider] || 'huggingface';
  }

  /**
   * Creates LLM configuration from user data and DTO
   */
  private createLLMConfig(user: any, dto: GenerateTasksDto, provider: LLMProvider): LLMConfig {
    return {
      provider,
      apiKey: user.aiToken,
      model: (user as any).aiModel || dto.model, // Prioritize user's model
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
    };
  }

  /**
   * Generates a list title using AI
   */
  private async generateListTitle(prompt: string, config: LLMConfig): Promise<string> {
    try {
      return await this.langChainService.generateListTitle(prompt, config);
    } catch (error) {
      this.logger.warn('Failed to generate list title, using fallback');
      return `Tarefas: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
    }
  }

  /**
   * Generates a list description using AI
   */
  private async generateListDescription(prompt: string, config: LLMConfig): Promise<string> {
    try {
      return await this.langChainService.generateListDescription(prompt, config);
    } catch (error) {
      this.logger.warn('Failed to generate list description, using fallback');
      return `Lista de tarefas gerada para: ${prompt}`;
    }
  }

  /**
   * Generates a task list preview without saving to database
   */
  async generateTaskListPreview(userId: string, dto: GenerateTasksDto): Promise<{ name: string; description: string; tasks: any[] }> {
    const { prompt, listName, provider = 'huggingface' } = dto;
    
    try {
      // Get user data (including API key)
      const user = await this.usersService.findOne(userId);
      
      // Check if user has API key configured
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Check if user's provider matches the requested one
      if (user.aiIntegrationType && user.aiIntegrationType !== provider) {
        this.logger.warn(`User ${userId} has ${user.aiIntegrationType} configured but requested ${provider}`);
      }
      
      // Map provider to LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validate configuration
      const config = this.createLLMConfig(user, dto, llmProvider);
      this.langChainService.validateConfig(config);
      
      // Use provided listName/description or generate using AI
      const listTitle = listName || await this.generateListTitle(prompt, config);
      const listDescription = dto.description || await this.generateListDescription(prompt, config);
      
      // Generate tasks using LangChain (without saving to database)
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      this.logger.log(`Generated TaskList preview "${listTitle}" with ${tasks.length} tasks from prompt: "${prompt}" for user ${userId}`);
      
      return {
        name: listTitle,
        description: listDescription,
        tasks: tasks
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error generating task list preview:', error.message);
      throw new BadRequestException('Failed to generate task list preview from AI service');
    }
  }
}
