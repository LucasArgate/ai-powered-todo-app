import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { taskParser, TASK_GENERATION_PROMPT, TaskSuggestion } from '../parsers/task.parser';
import { AiProviderFactory, ProviderType } from '../providers/ai-provider.factory';
import { IAiProvider } from '../providers/ai-provider.interface';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

export type LLMProvider = ProviderType;

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

  constructor(private readonly aiProviderFactory: AiProviderFactory) {}

  /**
   * Função abstrata para normalizar configuração do modelo
   * Usada tanto no testApiKey quanto no generateTasks
   */
  private normalizeModelConfig(config: LLMConfig): LLMConfig {
    const provider = config.provider;
    const requestedModel = config.model;
    
    this.logger.log(`=== MODEL RESOLUTION ===`);
    this.logger.log(`Provider: ${provider}`);
    this.logger.log(`Requested model: ${requestedModel || 'default'}`);
    
    // Se não tem modelo solicitado, usar fallback padrão
    if (!requestedModel) {
      const fallbackModel = provider === 'huggingface' ? 'microsoft/DialoGPT-medium' : 'openai/gpt-3.5-turbo';
      this.logger.log(`Using fallback model: ${fallbackModel}`);
      
      return {
        ...config,
        model: fallbackModel,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 1000,
      };
    }
    
    this.logger.log(`Using requested model: ${requestedModel}`);
    
    return {
      ...config,
      model: requestedModel,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1000,
    };
  }

  /**
   * Generates tasks from a prompt using AI providers
   */
  async generateTasks(goal: string, config: LLMConfig): Promise<TaskSuggestion[]> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
    };

    try {
      return await this.executeWithRetry(
        async () => {
          // Normalize model configuration
          const normalizedConfig = this.normalizeModelConfig(config);
          
          this.logger.log(`=== STARTING TASK GENERATION ===`);
          this.logger.log(`Goal: "${goal}"`);
          this.logger.log(`Provider: ${normalizedConfig.provider}`);
          this.logger.log(`Model: ${normalizedConfig.model}`);
          this.logger.log(`API Key: ${normalizedConfig.apiKey ? normalizedConfig.apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);

          // Get the appropriate provider using factory
          const provider = this.aiProviderFactory.getProvider(normalizedConfig.provider);
          const prompt = this.createPromptTemplate();
          
          // Get format instructions
          const formatInstructions = taskParser.getFormatInstructions();
          this.logger.log(`Format Instructions: ${formatInstructions}`);
          
          // Prepare the full prompt
          const fullPrompt = await prompt.format({
            goal,
            format_instructions: formatInstructions,
          });
          
          this.logger.log(`=== FULL PROMPT TO AI ===`);
          this.logger.log(fullPrompt);
          this.logger.log(`=== END PROMPT ===`);
          
          // Generate response using the provider
          const rawResponse = await provider.generate(
            fullPrompt,
            normalizedConfig.model,
            normalizedConfig.apiKey,
            {
              temperature: normalizedConfig.temperature,
              maxTokens: normalizedConfig.maxTokens,
            }
          );
          
          this.logger.log(`=== RAW AI RESPONSE ===`);
          this.logger.log(rawResponse);
          this.logger.log(`=== END RAW RESPONSE ===`);
          
          // Try to parse the response
          try {
            const result = await taskParser.parse(rawResponse) as TaskSuggestion[];
            this.logger.log(`=== PARSED TASKS ===`);
            this.logger.log(JSON.stringify(result, null, 2));
            this.logger.log(`=== END PARSED TASKS ===`);
            this.logger.log(`Generated ${result.length} tasks using ${normalizedConfig.provider}`);
            return result;
          } catch (parseError) {
            this.logger.error(`Failed to parse AI response: ${parseError.message}`);
            this.logger.error(`Raw response that failed to parse: ${rawResponse}`);
            throw new BadRequestException('AI retornou resposta em formato inválido. Tente novamente.');
          }
        },
        retryConfig,
        `generateTasks with ${config.provider}`
      );
    } catch (error) {
      this.logger.error(`=== TASK GENERATION ERROR ===`);
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      this.logger.error(`=== END ERROR ===`);
      
      // Enhanced error handling for task generation
      if (error.message.includes('No Inference Provider available')) {
        throw new BadRequestException(`Modelo "${config.model}" não possui provedor de inferência disponível. Verifique se o modelo está disponível no Hugging Face Hub.`);
      } else if (error.message.includes('Modelo de IA não disponível')) {
        throw new BadRequestException('Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.');
      } else if (error.message.includes('API key inválida')) {
        throw new BadRequestException('Configuração de API inválida. Verifique suas credenciais.');
      } else if (error.message.includes('Limite de requisições excedido')) {
        throw new BadRequestException('Muitas requisições. Aguarde alguns minutos antes de tentar novamente.');
      } else if (error.message.includes('Model not found')) {
        throw new BadRequestException('Modelo de IA não encontrado. Verifique a configuração do modelo.');
      } else if (error.message.includes('InputError')) {
        throw new BadRequestException(`Erro de entrada: ${error.message}`);
      } else {
        // Para outros erros, mostrar a mensagem real ao invés de genérica
        throw new BadRequestException(`Falha ao gerar tarefas usando IA: ${error.message}`);
      }
    }
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

        // Don't retry for certain types of errors
        if (error.message.includes('API key inválida') || 
            error.message.includes('Model not found') ||
            error.message.includes('Modelo de IA não disponível')) {
          throw error; // Re-throw immediately for these errors
        }

        if (attempt < retryConfig.maxRetries) {
          await this.delay(retryConfig.retryDelay * attempt);
        }
      }
    }

    this.logger.error(`${operationName} failed after ${retryConfig.maxRetries} attempts:`, lastError.message);
    throw lastError; // Re-throw the original error to be handled by the caller
  }

  /**
   * Delay helper para retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Cria o template de prompt estruturado
   */
  private createPromptTemplate(): PromptTemplate {

    return PromptTemplate.fromTemplate(TASK_GENERATION_PROMPT);
  }


  /**
   * Returns available providers using the factory
   */
  getAvailableProviders(): { name: LLMProvider; description: string; free: boolean; models: string[] }[] {
    return this.aiProviderFactory.getProvidersInfo();
  }

  /**
   * Generates simple text from a prompt using AI providers
   */
  async generateText(prompt: string, config: LLMConfig): Promise<string> {
    try {
      // Normalize model configuration
      const normalizedConfig = this.normalizeModelConfig(config);
      
      this.logger.log(`Generating text with provider: ${normalizedConfig.provider}, model: ${normalizedConfig.model}`);
      
      // Get the appropriate provider using factory
      const provider = this.aiProviderFactory.getProvider(normalizedConfig.provider);
      
      // Generate response using the provider
      const response = await provider.generate(
        prompt,
        normalizedConfig.model,
        normalizedConfig.apiKey,
        {
          temperature: normalizedConfig.temperature,
          maxTokens: normalizedConfig.maxTokens,
          timeout: 15000, // 15 seconds timeout
        }
      );
      
      return response;
    } catch (error) {
      this.logger.error('Error generating text:', error);
      
      // Provide more specific error messages based on the error type
      if (error.message.includes('Timeout: Request took too long')) {
        throw new BadRequestException('Timeout: A requisição demorou muito para responder. Tente novamente.');
      } else if (error.message.includes('No Inference Provider available')) {
        throw new BadRequestException(`Modelo "${config.model}" não possui provedor de inferência disponível. Verifique se o modelo está disponível no Hugging Face Hub.`);
      } else if (error.message.includes('Modelo de IA não disponível')) {
        throw new BadRequestException('Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.');
      } else if (error.message.includes('API key inválida') || error.message.includes('Invalid API key')) {
        throw new BadRequestException('Configuração de API inválida. Verifique suas credenciais.');
      } else if (error.message.includes('Limite de requisições excedido') || error.message.includes('Rate limit')) {
        throw new BadRequestException('Muitas requisições. Aguarde alguns minutos antes de tentar novamente.');
      } else if (error.message.includes('Model not found')) {
        throw new BadRequestException('Modelo de IA não encontrado. Verifique a configuração do modelo.');
      } else if (error.message.includes('InputError')) {
        throw new BadRequestException(`Erro de entrada: ${error.message}`);
      } else {
        // Para outros erros, mostrar a mensagem real ao invés de genérica
        throw new BadRequestException(`Falha ao gerar texto usando IA: ${error.message}`);
      }
    }
  }

  /**
   * Gera um título otimizado para lista de tarefas
   */
  async generateListTitle(goal: string, config: LLMConfig): Promise<string> {
    const titlePrompt = `You are a task management assistant specialized in organizing tasks.

Based on this goal: "${goal}"

Generate a concise and descriptive title for a task list (maximum 50 characters).
The title should be:
- Clear and direct
- Capture the essence of the goal
- Be suitable for a task list
- In Brazilian Portuguese

Return ONLY the title, no quotes or additional text.`;

    try {
      const response = await this.generateText(titlePrompt, config);
      const cleanTitle = response.trim().replace(/['"]/g, '').substring(0, 50);
      
      // Fallback se a resposta estiver vazia ou muito curta
      if (cleanTitle.length < 3) {
        return `Tarefas: ${goal.substring(0, 40)}${goal.length > 40 ? '...' : ''}`;
      }
      
      return cleanTitle;
    } catch (error) {
      this.logger.warn('Failed to generate list title, using fallback');
      return `Tarefas: ${goal.substring(0, 40)}${goal.length > 40 ? '...' : ''}`;
    }
  }

  /**
   * Gera uma descrição otimizada para lista de tarefas
   */
  async generateListDescription(goal: string, config: LLMConfig): Promise<string> {
    const descriptionPrompt = `You are a task management assistant specialized in organizing tasks.

Based on this goal: "${goal}"

Generate a brief and useful description for a task list (maximum 100 characters).
The description should:
- Explain the purpose of the list
- Be informative but concise
- Help the user understand the context
- Be in Brazilian Portuguese

Return ONLY the description, no quotes or additional text.`;

    try {
      const response = await this.generateText(descriptionPrompt, config);
      const cleanDescription = response.trim().replace(/['"]/g, '').substring(0, 100);
      
      // Fallback se a resposta estiver vazia ou muito curta
      if (cleanDescription.length < 5) {
        return `Lista de tarefas gerada para: ${goal}`;
      }
      
      return cleanDescription;
    } catch (error) {
      this.logger.warn('Failed to generate list description, using fallback');
      return `Lista de tarefas gerada para: ${goal}`;
    }
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

  /**
   * Tests if an API key is working correctly using AI providers
   */
  async testApiKey(config: LLMConfig): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing API key for provider: ${config.provider}`);
      this.logger.log(`Model being tested: ${config.model || 'default'}`);
      this.logger.log(`API key prefix: ${config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);
      
      // Validate basic configuration first
      this.validateConfig(config);

      // Normalize model configuration
      const normalizedConfig = this.normalizeModelConfig(config);
      
      // Get the appropriate provider using factory
      const provider = this.aiProviderFactory.getProvider(normalizedConfig.provider);
      
      // Test using the provider's testApiKey method
      const result = await provider.testApiKey(
        normalizedConfig.apiKey,
        normalizedConfig.model
      );

      this.logger.log(`API key test completed for ${config.provider}: ${result.valid ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error(`API key test failed for ${config.provider}:`, error.message);
      this.logger.error(`Full error details:`, {
        message: error.message,
        stack: error.stack,
        model: config.model,
        provider: config.provider
      });
      
      // Map specific errors to friendly messages
      let errorMessage = 'Erro desconhecido ao testar API key';
      
      if (error.message.includes('API key inválida') || error.message.includes('Invalid API key')) {
        errorMessage = 'API key inválida ou expirada';
      } else if (error.message.includes('Modelo de IA não disponível') || error.message.includes('Model not found')) {
        errorMessage = 'Modelo não disponível ou não encontrado';
      } else if (error.message.includes('Limite de requisições excedido') || error.message.includes('Rate limit')) {
        errorMessage = 'Limite de requisições excedido';
      } else if (error.message.includes('API key is required')) {
        errorMessage = 'API key é obrigatória';
      } else if (error.message.includes('Unsupported provider')) {
        errorMessage = 'Provedor não suportado';
      } else if (error.message.includes('No Inference Provider available')) {
        errorMessage = `Modelo "${config.model}" não possui provedor de inferência disponível. Verifique se o modelo está disponível no Hugging Face Hub.`;
      } else if (error.message.includes('InputError')) {
        errorMessage = `Erro de entrada: ${error.message}`;
      } else if (error.message.includes('Serviço de IA temporariamente indisponível')) {
        errorMessage = 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.';
      } else if (error.message.includes('Timeout')) {
        errorMessage = 'Timeout: A requisição demorou muito para responder. Tente novamente.';
      } else if (error.message.includes('BadRequestException')) {
        // Extract the real message from BadRequestException
        const match = error.message.match(/BadRequestException: (.+)/);
        errorMessage = match ? match[1] : error.message;
      } else {
        // For other errors, show the real message instead of generic
        errorMessage = error.message || 'Erro desconhecido ao testar API key';
      }

      return {
        valid: false,
        message: errorMessage,
        provider: config.provider,
        model: config.model,
      };
    }
  }
}
