import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HfInference } from '@huggingface/inference';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { taskParser, TASK_GENERATION_PROMPT, TaskSuggestion } from '../parsers/task.parser';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

export type LLMProvider = 'huggingface' | 'openrouter';

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
        }) as TaskSuggestion[];

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
        case 'huggingface':
          // Para Hugging Face, vamos usar uma abordagem híbrida
          return this.createHuggingFaceModel(config);

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
   * Cria um wrapper para Hugging Face que simula a interface do LangChain
   */
  private createHuggingFaceModel(config: LLMConfig) {
    const hf = new HfInference(config.apiKey);
    const model = config.model ?? 'microsoft/DialoGPT-medium';

    return {
      async invoke(input: { goal: string; format_instructions: string }): Promise<{ content: string }> {
        try {
          const prompt = `You are a task management assistant. Given a high-level goal or objective, break it down into specific, actionable tasks.

${input.format_instructions}

Goal: ${input.goal}

Return ONLY the JSON array of tasks as specified in the format instructions.`;

          const response = await hf.textGeneration({
            model,
            inputs: prompt,
            parameters: {
              max_new_tokens: config.maxTokens ?? 500,
              temperature: config.temperature ?? 0.7,
              return_full_text: false,
            },
          });

          return { content: response.generated_text || '' };
        } catch (error) {
          throw new Error(`Hugging Face API error: ${error.message}`);
        }
      },
    };
  }

  /**
   * Retorna os provedores disponíveis
   */
  getAvailableProviders(): { name: LLMProvider; description: string; free: boolean }[] {
    return [
      {
        name: 'huggingface',
        description: 'Hugging Face Inference API - Free tier available',
        free: true,
      },
      {
        name: 'openrouter',
        description: 'OpenRouter - Some free models available',
        free: true,
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
