import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { InferenceClient } from '@huggingface/inference';
import { IAiProvider } from './ai-provider.interface';

@Injectable()
export class HuggingFaceProvider implements IAiProvider {
  private readonly logger = new Logger(HuggingFaceProvider.name);
  private readonly providerName = 'huggingface';
  private readonly availableModels = [
    'microsoft/DialoGPT-medium',
    'microsoft/DialoGPT-large', 
    'facebook/blenderbot-400M-distill',
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/flan-t5-large',
    'microsoft/DialoGPT-small',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'meta-llama/llama-2-70b-chat',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'microsoft/DialoGPT-xl'
  ];

  /**
   * Determines if a model requires conversational task instead of text-generation
   */
  private requiresConversationalTask(model: string): boolean {
    const conversationalModels = [
      'meta-llama/Meta-Llama-3-8B-Instruct',
      'meta-llama/llama-2-70b-chat',
      'meta-llama/llama-3.1-8b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'microsoft/DialoGPT-medium',
      'microsoft/DialoGPT-large',
      'microsoft/DialoGPT-small',
      'facebook/blenderbot-400M-distill',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'mistralai/Mistral-7B-Instruct-v0.1'
    ];
    
    return conversationalModels.some(convModel => model.includes(convModel.split('/')[1]));
  }

  /**
   * Uses ConversationChain with HuggingFaceHub for conversational models (like Llama)
   */
  private async useConversationChain(
    model: string,
    prompt: string,
    apiKey: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    this.logger.log(`Using ConversationChain for model: ${model}`);
    
    // Initialize HuggingFaceInference LLM (equivalent to HuggingFaceHub in Python)
    const llm = new HuggingFaceInference({
      model: model,
      apiKey: apiKey,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 500,
    });

    // Create conversation memory
    const memory = new BufferMemory();

    // Create conversation chain
    const conversation = new ConversationChain({
      llm: llm,
      memory: memory,
    });

    // Use the chain to predict response
    const response = await conversation.predict({ input: prompt });
    
    return response;
  }

  /**
   * Método usando a nova API InferenceClient do Hugging Face
   * Mais moderna e específica para tarefas de geração de texto
   */
  private async generateTextWithHfDirect(
    prompt: string, 
    model: string, 
    apiKey: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      this.logger.log(`=== HF INFERENCE CLIENT API CALL ===`);
      this.logger.log(`Creating InferenceClient with model: ${model}`);
      this.logger.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);
      this.logger.log(`Max Tokens: ${options?.maxTokens ?? 250}`);
      this.logger.log(`Temperature: ${options?.temperature ?? 0.7}`);
      
      // Initialize InferenceClient with API key
      const hf = new InferenceClient(apiKey);

      // Try text generation first, fallback to conversational if needed
      try {
        this.logger.log(`Calling textGeneration with model: ${model}`);
        this.logger.log(`Input prompt length: ${prompt.length} characters`);
        
        const response = await hf.textGeneration({
          model: model,
          inputs: prompt,
          parameters: {
            max_new_tokens: options?.maxTokens ?? 250,
            temperature: options?.temperature ?? 0.7,
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
        if (textGenError.message.includes('not supported for task text-generation') || 
            textGenError.message.includes('Task not supported')) {
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
              max_tokens: options?.maxTokens ?? 250,
              temperature: options?.temperature ?? 0.7,
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
      this.logger.error(`=== HF INFERENCE CLIENT ERROR ===`);
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      this.logger.error(`Model: ${model}`);
      this.logger.error(`Prompt preview: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}`);
      this.logger.error(`=== END HF ERROR ===`);
      throw error;
    }
  }

  /**
   * Makes a direct API call to HuggingFace for conversational models
   */
  private async callHuggingFaceAPI(
    model: string,
    prompt: string,
    apiKey: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options?.temperature ?? 0.7,
          max_new_tokens: options?.maxTokens ?? 500,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || data[0].text || JSON.stringify(data[0]);
    } else if (data.generated_text) {
      return data.generated_text;
    } else if (data.text) {
      return data.text;
    } else {
      return JSON.stringify(data);
    }
  }

  async generate(
    prompt: string, 
    model: string = 'microsoft/DialoGPT-medium', 
    apiKey?: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string> {
    try {
      if (!apiKey) {
        throw new BadRequestException('API key is required for Hugging Face');
      }

      this.logger.log(`=== STARTING HUGGING FACE GENERATION ===`);
      this.logger.log(`Model: ${model}`);
      this.logger.log(`Prompt length: ${prompt.length} characters`);
      this.logger.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT PROVIDED'}`);
      
      // Try the direct HF API method first (the one that worked)
      try {
        this.logger.log(`Attempting generateTextWithHfDirect for model: ${model}`);
        return await this.generateTextWithHfDirect(prompt, model, apiKey, options);
      } catch (hfDirectError) {
        this.logger.warn(`generateTextWithHfDirect failed: ${hfDirectError.message}, trying ConversationChain as fallback`);
        
        // Check if model requires conversational task
        const useConversational = this.requiresConversationalTask(model);
        this.logger.log(`Using task type: ${useConversational ? 'conversational' : 'text-generation'}`);
        
        // For conversational models, use ConversationChain as fallback
        if (useConversational) {
          try {
            this.logger.log(`Attempting ConversationChain for conversational model: ${model}`);
            return await this.useConversationChain(model, prompt, apiKey, options);
          } catch (conversationError) {
            this.logger.warn(`ConversationChain failed: ${conversationError.message}, trying direct API as fallback`);
            try {
              this.logger.log(`Attempting direct API call for conversational model: ${model}`);
              return await this.callHuggingFaceAPI(model, prompt, apiKey, options);
            } catch (directApiError) {
              this.logger.warn(`Direct API call also failed: ${directApiError.message}, trying HuggingFaceInference as final fallback`);
            }
          }
        }
        
        // Use LangChain HuggingFaceInference as final fallback
        this.logger.log(`Using HuggingFaceInference as final fallback for model: ${model}`);
        const llm = new HuggingFaceInference({
          model: model,
          apiKey: apiKey,
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 500,
        });
        
        const response = await llm.invoke(prompt);
        
        // Extract text from response
        if (typeof response === 'string') {
          return response;
        } else if (response && typeof response === 'object' && 'content' in response) {
          return (response as any).content;
        } else {
          return JSON.stringify(response);
        }
      }
    } catch (error) {
      this.logger.error(`=== HUGGING FACE GENERATION ERROR ===`);
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      this.logger.error(`Model: ${model}`);
      this.logger.error(`=== END ERROR ===`);
      
      if (error.message.includes('No Inference Provider available')) {
        throw new BadRequestException(`Modelo "${model}" não possui provedor de inferência disponível. Verifique se o modelo está disponível no Hugging Face Hub.`);
      } else if (error.message.includes('Invalid API key')) {
        throw new BadRequestException('API key inválida ou expirada');
      } else if (error.message.includes('Rate limit')) {
        throw new BadRequestException('Limite de requisições excedido');
      } else if (error.message.includes('not supported for task')) {
        throw new BadRequestException(`Modelo "${model}" não é compatível com a tarefa solicitada. Este erro geralmente ocorre com modelos Llama que requerem a tarefa 'conversational'. Tente usar um modelo como 'microsoft/DialoGPT-medium' ou 'google/flan-t5-large' que suportam geração de texto genérica.`);
      } else {
        throw new BadRequestException(`Falha ao gerar texto usando Hugging Face: ${error.message}`);
      }
    }
  }

  async testApiKey(
    apiKey: string, 
    model: string = 'microsoft/DialoGPT-medium'
  ): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing Hugging Face API key with model: ${model}`);
      
      const testPrompt = 'Hello, how are you?';
      const response = await this.generate(testPrompt, model, apiKey, {
        temperature: 0.1,
        maxTokens: 50,
      });

      if (response && response.trim().length > 0) {
        return {
          valid: true,
          message: 'API key está funcionando corretamente',
          provider: this.providerName,
          model: model,
        };
      } else {
        return {
          valid: false,
          message: 'API key retornou resposta vazia',
          provider: this.providerName,
          model: model,
        };
      }
    } catch (error) {
      this.logger.error(`Hugging Face API key test failed: ${error.message}`);
      
      let errorMessage = 'Erro desconhecido ao testar API key';
      
      if (error.message.includes('Invalid API key')) {
        errorMessage = 'API key inválida ou expirada';
      } else if (error.message.includes('No Inference Provider available')) {
        errorMessage = `Modelo "${model}" não possui provedor de inferência disponível`;
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Limite de requisições excedido';
      } else {
        errorMessage = error.message || 'Erro desconhecido ao testar API key';
      }

      return {
        valid: false,
        message: errorMessage,
        provider: this.providerName,
        model: model,
      };
    }
  }

  getProviderName(): string {
    return this.providerName;
  }

  getAvailableModels(): string[] {
    return this.availableModels;
  }

  supportsModel(model: string): boolean {
    // Check if it's in the predefined list
    if (this.availableModels.includes(model)) {
      return true;
    }
    
    // Check if it's a Llama model (more flexible matching)
    if (model.includes('meta-llama') || model.includes('llama')) {
      return true;
    }
    
    // Check if it's a DialoGPT model
    if (model.includes('DialoGPT') || model.includes('blenderbot')) {
      return true;
    }
    
    // Check if it's a Mistral model
    if (model.includes('mistralai') || model.includes('mistral')) {
      return true;
    }
    
    // Check if it's a Google model
    if (model.includes('google') || model.includes('flan-t5')) {
      return true;
    }
    
    return false;
  }
}
