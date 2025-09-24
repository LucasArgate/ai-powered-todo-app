import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
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
   * Gera tarefas a partir de um prompt usando LangChain
   */
  async generateTasks(goal: string, config: LLMConfig): Promise<TaskSuggestion[]> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
    };

    try {
      return await this.executeWithRetry(
        async () => {
          // Normalizar configuração do modelo (mesma lógica do testApiKey)
          const normalizedConfig = this.normalizeModelConfig(config);
          
          this.logger.log(`=== STARTING TASK GENERATION ===`);
          this.logger.log(`Goal: "${goal}"`);
          this.logger.log(`Provider: ${normalizedConfig.provider}`);
          this.logger.log(`Model: ${normalizedConfig.model}`);
          this.logger.log(`API Key: ${normalizedConfig.apiKey ? normalizedConfig.apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);

          const model = this.createLLMModel(normalizedConfig);
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
          
          // Para Hugging Face, usar método direto para evitar problemas de auto-seleção
          if (normalizedConfig.provider === 'huggingface') {
            this.logger.log(`Using Hugging Face direct method for task generation`);
            const rawResponse = await this.generateTextWithHfDirect(fullPrompt, normalizedConfig);
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
          }

          // Criar chain: prompt -> model -> parser
          const chain = RunnableSequence.from([
            prompt,
            model,
            taskParser,
          ]);

          this.logger.log(`Executing chain with model: ${normalizedConfig.provider}`);
          
          // Executar chain
          const result = await chain.invoke({
            goal,
            format_instructions: formatInstructions,
          }) as TaskSuggestion[];

          this.logger.log(`=== CHAIN RESULT ===`);
          this.logger.log(JSON.stringify(result, null, 2));
          this.logger.log(`=== END CHAIN RESULT ===`);
          this.logger.log(`Generated ${result.length} tasks using ${normalizedConfig.provider}`);
          return result;
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
   * Cria modelo Hugging Face usando a integração oficial do LangChain
   */
  private createHuggingFaceModel(config: LLMConfig) {
    try {
      // A configuração já vem normalizada, então usar diretamente
      return new HuggingFaceInference({
        model: config.model!,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 500,
      });
    } catch (error) {
      this.logger.error(`Failed to create HuggingFace model:`, error.message);
      throw new BadRequestException(`Failed to initialize HuggingFace model: ${error.message}`);
    }
  }

  /**
   * Método alternativo usando diretamente a API do Hugging Face para evitar problemas de auto-seleção
   */
  private async generateTextWithHfDirect(prompt: string, config: LLMConfig): Promise<string> {
    try {
      this.logger.log(`=== HF DIRECT API CALL ===`);
      this.logger.log(`Creating HfInference with model: ${config.model}`);
      this.logger.log(`API Key: ${config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);
      this.logger.log(`Max Tokens: ${config.maxTokens ?? 100}`);
      this.logger.log(`Temperature: ${config.temperature ?? 0.7}`);
      
      const hf = new HfInference(config.apiKey);
      const model = config.model ?? 'microsoft/DialoGPT-medium';

      // Try text generation first, fallback to conversational if needed
      try {
        this.logger.log(`Calling textGeneration with model: ${model}`);
        this.logger.log(`Input prompt length: ${prompt.length} characters`);
        
        const response = await hf.textGeneration({
          model: model,
          inputs: prompt,
          parameters: {
            max_new_tokens: config.maxTokens ?? 100,
            temperature: config.temperature ?? 0.7,
            return_full_text: false,
          },
        });

        this.logger.log(`=== HF TEXT GENERATION RESPONSE ===`);
        this.logger.log(`Response: ${JSON.stringify(response, null, 2)}`);
        this.logger.log(`Generated text: "${response.generated_text || ''}"`);
        this.logger.log(`=== END HF RESPONSE ===`);

        return response.generated_text || '';
      } catch (textGenError) {
        this.logger.error(`Text generation failed: ${textGenError.message}`);
        
        // If text generation fails, try conversational
        if (textGenError.message.includes('not supported for task text-generation')) {
          this.logger.log(`Text generation not supported, trying conversational for model: ${model}`);
          try {
            const response = await hf.chatCompletion({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              max_tokens: config.maxTokens ?? 100,
              temperature: config.temperature ?? 0.7,
            });

            this.logger.log(`=== HF CHAT COMPLETION RESPONSE ===`);
            this.logger.log(`Response: ${JSON.stringify(response, null, 2)}`);
            this.logger.log(`Message content: "${response.choices?.[0]?.message?.content || ''}"`);
            this.logger.log(`=== END HF CHAT RESPONSE ===`);

            return response.choices?.[0]?.message?.content || '';
          } catch (convError) {
            this.logger.error(`Both text generation and conversational failed for model: ${model}`);
            this.logger.error(`Conversational error: ${convError.message}`);
            throw convError; // Throw the original error
          }
        } else {
          throw textGenError; // Re-throw if it's not a task support error
        }
      }
    } catch (error) {
      this.logger.error(`=== HF DIRECT API ERROR ===`);
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      this.logger.error(`Model: ${config.model ?? 'gpt2'}`);
      this.logger.error(`Prompt preview: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}`);
      this.logger.error(`=== END HF ERROR ===`);
      throw error;
    }
  }

  /**
   * Retorna os provedores disponíveis
   */
  getAvailableProviders(): { name: LLMProvider; description: string; free: boolean; models: string[] }[] {
    return [
      {
        name: 'huggingface',
        description: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
        free: true,
        models: ['microsoft/DialoGPT-medium', 'microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill', 'mistralai/Mistral-7B-Instruct-v0.2'],
      },
      {
        name: 'openrouter',
        description: 'OpenRouter - Acesso a múltiplos modelos de IA',
        free: false,
        models: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'],
      },
    ];
  }

  /**
   * Gera texto simples a partir de um prompt
   */
  async generateText(prompt: string, config: LLMConfig): Promise<string> {
    try {
      // Normalizar configuração do modelo
      const normalizedConfig = this.normalizeModelConfig(config);
      
      this.logger.log(`Generating text with provider: ${normalizedConfig.provider}, model: ${normalizedConfig.model}`);
      
      // Para Hugging Face, usar método direto para evitar problemas de auto-seleção
      if (normalizedConfig.provider === 'huggingface') {
        this.logger.log(`Using Hugging Face direct method for model: ${normalizedConfig.model}`);
        return await this.generateTextWithHfDirect(prompt, normalizedConfig);
      }

      const model = this.createLLMModel(normalizedConfig);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Request took too long')), 15000); // 15 segundos
      });
      
      // Race between the model call and timeout
      const response = await Promise.race([
        model.invoke(prompt),
        timeoutPromise
      ]);
      
      // Extract text from response
      if (typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object' && 'content' in response) {
        return (response as any).content;
      } else {
        return JSON.stringify(response);
      }
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
   * Testa se uma API key está funcionando corretamente
   */
  async testApiKey(config: LLMConfig): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing API key for provider: ${config.provider}`);
      this.logger.log(`Model being tested: ${config.model || 'default'}`);
      this.logger.log(`API key prefix: ${config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);
      
      // Validar configuração básica primeiro
      this.validateConfig(config);

      // Normalizar configuração do modelo (mesma lógica do generateTasks)
      const normalizedConfig = this.normalizeModelConfig(config);
      
      // Criar configuração de teste com parâmetros mínimos
      const testConfig: LLMConfig = {
        ...normalizedConfig,
        temperature: 0.1, // Baixa temperatura para resposta mais consistente
        maxTokens: 50, // Poucos tokens para teste rápido
      };

      // Teste simples: gerar uma resposta curta
      const testPrompt = 'Hello, how are you?';
      this.logger.log(`Attempting to generate text with model: ${testConfig.model || 'default'}`);
      const response = await this.generateText(testPrompt, testConfig);

      // Verificar se recebemos uma resposta válida
      if (response && response.trim().length > 0) {
        this.logger.log(`API key test successful for ${config.provider}`);
        return {
          valid: true,
          message: 'API key está funcionando corretamente',
          provider: config.provider,
          model: config.model,
        };
      } else {
        this.logger.warn(`API key test failed for ${config.provider}: Empty response`);
        return {
          valid: false,
          message: 'API key retornou resposta vazia',
          provider: config.provider,
          model: config.model,
        };
      }
    } catch (error) {
      this.logger.error(`API key test failed for ${config.provider}:`, error.message);
      this.logger.error(`Full error details:`, {
        message: error.message,
        stack: error.stack,
        model: config.model,
        provider: config.provider
      });
      
      // Mapear erros específicos para mensagens amigáveis
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
        // Extrair a mensagem real do BadRequestException
        const match = error.message.match(/BadRequestException: (.+)/);
        errorMessage = match ? match[1] : error.message;
      } else {
        // Para outros erros, mostrar a mensagem real ao invés de genérica
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
