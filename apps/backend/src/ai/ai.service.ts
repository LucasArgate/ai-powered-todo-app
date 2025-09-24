import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { TaskListsService, TaskListWithTasksAndCounts } from '../task-lists/task-lists.service';
import { GenerateTasksDto } from './dto/ai.dto';
import { LangChainService, LLMProvider } from './services/langchain.service';
import { TaskSuggestion } from './parsers/task.parser';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly taskListsService: TaskListsService,
    private readonly langChainService: LangChainService,
  ) {}

  async generateTasksFromPrompt(userId: string, dto: GenerateTasksDto): Promise<any[]> {
    const { prompt, provider = 'huggingface' } = dto;
    
    try {
      // Buscar dados do usuário (incluindo API key)
      const user = await this.usersService.findOne(userId);
      
      // Verificar se o usuário tem API key configurada
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Verificar se o provider do usuário corresponde ao solicitado
      if (user.aiIntegrationType && user.aiIntegrationType !== provider) {
        this.logger.warn(`User ${userId} has ${user.aiIntegrationType} configured but requested ${provider}`);
      }
      
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validar configuração
      const config = {
        provider: llmProvider,
        apiKey: user.aiToken,
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      };
      
      this.langChainService.validateConfig(config);
      
      // Gerar tarefas usando LangChain
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      // Save generated tasks to database
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: 'default-list', // TODO: Implement proper list management
          title: taskData.title,
          position: i,
        }, userId);
        savedTasks.push(task);
      }

      this.logger.log(`Generated ${savedTasks.length} tasks from prompt: "${prompt}" for user ${userId}`);
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
   * Mapeia providers antigos para novos LLMProviders
   */
  private mapProvider(provider: string): LLMProvider {
    const providerMap: Record<string, LLMProvider> = {
      'huggingface': 'huggingface',
      'openrouter': 'openrouter',
    };
    
    return providerMap[provider] || 'huggingface';
  }


  async generateTaskListFromPrompt(userId: string, dto: GenerateTasksDto): Promise<TaskListWithTasksAndCounts> {
    const { prompt, provider = 'huggingface' } = dto;
    
    try {
      // Buscar dados do usuário (incluindo API key)
      const user = await this.usersService.findOne(userId);
      
      // Verificar se o usuário tem API key configurada
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Verificar se o provider do usuário corresponde ao solicitado
      if (user.aiIntegrationType && user.aiIntegrationType !== provider) {
        this.logger.warn(`User ${userId} has ${user.aiIntegrationType} configured but requested ${provider}`);
      }
      
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validar configuração
      const config = {
        provider: llmProvider,
        apiKey: user.aiToken,
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      };
      
      this.langChainService.validateConfig(config);
      
      // Gerar título e descrição da lista usando IA
      const listTitle = await this.generateListTitle(prompt, config);
      const listDescription = await this.generateListDescription(prompt, config);
      
      // Criar a TaskList
      const taskList = await this.taskListsService.create({
        userId,
        name: listTitle,
        description: listDescription,
        iaPrompt: prompt
      });
      
      // Gerar tarefas usando LangChain
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      // Salvar tasks na lista criada
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: taskList.id, // Usar o ID da lista criada
          title: taskData.title,
          position: i,
        }, userId);
        savedTasks.push(task);
      }
      
      // Retornar lista completa com tasks
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

  private async generateListTitle(prompt: string, config: any): Promise<string> {
    const titlePrompt = `Based on this goal: "${prompt}", generate a concise and descriptive title for a task list (maximum 50 characters). Return only the title, no quotes or extra text.`;
    
    try {
      const response = await this.langChainService.generateText(titlePrompt, config);
      return response.trim().replace(/['"]/g, ''); // Remove quotes if present
    } catch (error) {
      this.logger.warn('Failed to generate list title, using fallback');
      return `Tasks for: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
    }
  }

  private async generateListDescription(prompt: string, config: any): Promise<string> {
    const descriptionPrompt = `Based on this goal: "${prompt}", generate a brief description for a task list (maximum 100 characters). Return only the description, no quotes or extra text.`;
    
    try {
      const response = await this.langChainService.generateText(descriptionPrompt, config);
      return response.trim().replace(/['"]/g, ''); // Remove quotes if present
    } catch (error) {
      this.logger.warn('Failed to generate list description, using fallback');
      return `Task list generated from: ${prompt}`;
    }
  }

  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return this.langChainService.getAvailableProviders();
  }
}
