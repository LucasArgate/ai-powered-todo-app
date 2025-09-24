import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { taskParser, TASK_GENERATION_PROMPT, TaskSuggestion } from '../parsers/task.parser';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

export type LLMProvider = 'openai' | 'anthropic' | 'openrouter';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class LangChainService {
  private readonly logger = new Logger(LangChainService.name);

  /**
   * Gera tarefas a partir de um prompt usando LangChain
   */
  async generateTasks(goal: string, config: LLMConfig): Promise<TaskSuggestion[]> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
    };

    return this.executeWithRetry(
      async () => {
        const model = this.createLLMModel(config);
        const prompt = this.createPromptTemplate();
        
        // Criar chain: prompt -> model -> parser
        const chain = RunnableSequence.from([
          prompt,
          model,
          taskParser,
        ]);

        // Executar chain
        const result = await chain.invoke({
          goal,
          format_instructions: taskParser.getFormatInstructions(),
        });

        this.logger.log(`Generated ${result.length} tasks using ${config.provider}`);
        return result;
      },
      retryConfig,
      `generateTasks with ${config.provider}`
    );
  }

  /**
   * Executa uma operação com retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig: RetryConfig,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `${operationName} failed (attempt ${attempt}/${retryConfig.maxRetries}): ${error.message}`
        );

        if (attempt < retryConfig.maxRetries) {
          await this.delay(retryConfig.retryDelay * attempt);
        }
      }
    }

    this.logger.error(`${operationName} failed after ${retryConfig.maxRetries} attempts:`, lastError.message);
    throw new BadRequestException(`${operationName} failed: ${lastError.message}`);
  }

  /**
   * Delay helper para retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cria o modelo LLM baseado no provedor
   */
  private createLLMModel(config: LLMConfig) {
    try {
      const baseConfig = {
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 1000,
        timeout: 30000, // 30 segundos timeout
      };

      switch (config.provider) {
        case 'openai':
          return new ChatOpenAI({
            ...baseConfig,
            model: config.model ?? 'gpt-3.5-turbo',
          });

        case 'anthropic':
          return new ChatAnthropic({
            ...baseConfig,
            model: config.model ?? 'claude-3-haiku-20240307',
          });

        case 'openrouter':
          // OpenRouter usa API compatível com OpenAI
          return new ChatOpenAI({
            ...baseConfig,
            model: config.model ?? 'openai/gpt-3.5-turbo',
            configuration: {
              baseURL: 'https://openrouter.ai/api/v1',
              defaultHeaders: {
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'AI Todo App',
              },
            },
          });

        default:
          throw new BadRequestException(`Unsupported provider: ${config.provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create LLM model for ${config.provider}:`, error.message);
      throw new BadRequestException(`Failed to initialize ${config.provider} model: ${error.message}`);
    }
  }

  /**
   * Cria o template de prompt estruturado
   */
  private createPromptTemplate(): PromptTemplate {
    return PromptTemplate.fromTemplate(TASK_GENERATION_PROMPT);
  }

  /**
   * Retorna os provedores disponíveis
   */
  getAvailableProviders(): { name: LLMProvider; description: string; free: boolean }[] {
    return [
      {
        name: 'openai',
        description: 'OpenAI GPT models - Paid service',
        free: false,
      },
      {
        name: 'anthropic',
        description: 'Anthropic Claude models - Paid service',
        free: false,
      },
      {
        name: 'openrouter',
        description: 'OpenRouter - Access to multiple LLMs',
        free: false,
      },
    ];
  }

  /**
   * Valida a configuração do provedor
   */
  validateConfig(config: LLMConfig): boolean {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new BadRequestException('API key is required');
    }

    const supportedProviders = this.getAvailableProviders().map(p => p.name);
    if (!supportedProviders.includes(config.provider)) {
      throw new BadRequestException(`Unsupported provider: ${config.provider}`);
    }

    return true;
  }
}
