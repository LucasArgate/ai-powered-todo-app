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
    const { prompt, listName, provider = 'huggingface' } = dto;
    
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
        model: (user as any).aiModel || dto.model, // Priorizar modelo do usuário
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      };
      
      this.langChainService.validateConfig(config);
      
      // Criar TaskList se listName foi fornecido
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
      
      // Gerar tarefas usando LangChain
      const tasks = await this.langChainService.generateTasks(prompt, config);
      
      // Save generated tasks to database
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: taskListId,
          title: taskData.title,
          position: i,
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
    const { prompt, listName, provider = 'huggingface' } = dto;
    
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
        model: (user as any).aiModel || dto.model, // Priorizar modelo do usuário
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      };
      
      this.langChainService.validateConfig(config);
      
      // Usar listName fornecido ou gerar título e descrição da lista usando IA
      const listTitle = listName || await this.generateListTitle(prompt, config);
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
    try {
      return await this.langChainService.generateListTitle(prompt, config);
    } catch (error) {
      this.logger.warn('Failed to generate list title, using fallback');
      return `Tarefas: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
    }
  }

  private async generateListDescription(prompt: string, config: any): Promise<string> {
    try {
      return await this.langChainService.generateListDescription(prompt, config);
    } catch (error) {
      this.logger.warn('Failed to generate list description, using fallback');
      return `Lista de tarefas gerada para: ${prompt}`;
    }
  }

  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return this.langChainService.getAvailableProviders();
  }

  /**
   * Testa se a API key do usuário logado está funcionando corretamente
   */
  async testUserApiKey(userId: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing user API key for provider: ${provider}, userId: ${userId}`);
      
      // Buscar dados do usuário (incluindo API key)
      const user = await this.usersService.findOne(userId);
      
      // Verificar se o usuário tem API key configurada
      if (!user.aiToken) {
        return {
          valid: false,
          message: 'Usuário não possui API key configurada. Configure sua integração de IA primeiro.',
          provider: provider,
          model: model,
        };
      }
      
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Criar configuração de teste - usar modelo do usuário se disponível
      const config = {
        provider: llmProvider,
        apiKey: user.aiToken,
        model: (user as any).aiModel || model, // Priorizar modelo do usuário
        temperature: 0.1,
        maxTokens: 50,
      };
      
      // Testar usando LangChainService
      const result = await this.langChainService.testApiKey(config);
      
      this.logger.log(`User API key test completed for ${provider}: ${result.valid ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Error testing user API key:', error.message);
      
      // Retornar erro genérico se algo der errado
      return {
        valid: false,
        message: 'Erro interno ao testar API key do usuário',
        provider: provider,
        model: model,
      };
    }
  }

  /**
   * Testa se uma API key está funcionando corretamente (método público)
   */
  async testApiKey(apiKey: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing API key for provider: ${provider}`);
      
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Criar configuração de teste
      const config = {
        provider: llmProvider,
        apiKey: apiKey,
        model: model,
        temperature: 0.1,
        maxTokens: 50,
      };
      
      // Testar usando LangChainService
      const result = await this.langChainService.testApiKey(config);
      
      this.logger.log(`API key test completed for ${provider}: ${result.valid ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Error testing API key:', error.message);
      
      // Retornar erro genérico se algo der errado
      return {
        valid: false,
        message: 'Erro interno ao testar API key',
        provider: provider,
        model: model,
      };
    }
  }

  /**
   * Debug method to generate simple text using AI
   */
  async debugGenerateText(userId: string, prompt: string, provider: string, model?: string): Promise<{ text: string; provider: string; model?: string }> {
    try {
      this.logger.log(`=== DEBUG TEXT GENERATION ===`);
      this.logger.log(`User ID: ${userId}`);
      this.logger.log(`Prompt: "${prompt}"`);
      this.logger.log(`Provider: ${provider}`);
      this.logger.log(`Model: ${model || 'default'}`);
      
      // Buscar dados do usuário (incluindo API key)
      const user = await this.usersService.findOne(userId);
      
      // Verificar se o usuário tem API key configurada
      if (!user.aiToken) {
        throw new BadRequestException('User has no AI API key configured. Please configure your AI integration first.');
      }
      
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Criar configuração
      const config = {
        provider: llmProvider,
        apiKey: user.aiToken,
        model: (user as any).aiModel || model,
        temperature: 0.7,
        maxTokens: 200,
      };
      
      this.logger.log(`Using config:`, config);
      
      // Gerar texto usando LangChainService
      const generatedText = await this.langChainService.generateText(prompt, config);
      
      this.logger.log(`=== DEBUG GENERATION RESULT ===`);
      this.logger.log(`Generated text: "${generatedText}"`);
      this.logger.log(`=== END DEBUG RESULT ===`);
      
      return {
        text: generatedText,
        provider: provider,
        model: model,
      };
    } catch (error) {
      this.logger.error('Error in debug text generation:', error.message);
      this.logger.error('Full error:', error);
      throw new BadRequestException(`Failed to generate debug text: ${error.message}`);
    }
  }
}
