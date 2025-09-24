import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from '../tasks/tasks.service';
import { GenerateTasksDto } from './dto/ai.dto';
import { LangChainService, LLMProvider } from './services/langchain.service';
import { TaskSuggestion } from './parsers/task.parser';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tasksService: TasksService,
    private readonly langChainService: LangChainService,
  ) {}

  async generateTasksFromPrompt(dto: GenerateTasksDto): Promise<any[]> {
    const { prompt, apiKey, provider = 'openrouter' } = dto;
    
    try {
      // Mapear provider para LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Validar configuração
      const config = {
        provider: llmProvider,
        apiKey,
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
          description: taskData.description,
        });
        savedTasks.push(task);
      }

      this.logger.log(`Generated ${savedTasks.length} tasks from prompt: "${prompt}"`);
      return savedTasks;
    } catch (error) {
      this.logger.error('Error generating tasks:', error.message);
      throw new BadRequestException('Failed to generate tasks from AI service');
    }
  }

  /**
   * Mapeia providers antigos para novos LLMProviders
   */
  private mapProvider(provider: string): LLMProvider {
    const providerMap: Record<string, LLMProvider> = {
      'huggingface': 'openrouter', // Migrar HuggingFace para OpenRouter
      'openrouter': 'openrouter',
      'openai': 'openai',
      'anthropic': 'anthropic',
    };
    
    return providerMap[provider] || 'openrouter';
  }


  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return this.langChainService.getAvailableProviders();
  }
}
