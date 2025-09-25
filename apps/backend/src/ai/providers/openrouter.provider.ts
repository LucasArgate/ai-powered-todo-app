import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { IAiProvider } from './ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements IAiProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly providerName = 'openrouter';
  private readonly availableModels = [
    'openai/gpt-3.5-turbo',
    'openai/gpt-4',
    'openai/gpt-4-turbo',
    'anthropic/claude-3-haiku',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-opus',
    'google/gemini-pro',
    'meta-llama/llama-2-70b-chat',
    'mistralai/mistral-7b-instruct'
  ];

  async generate(
    prompt: string, 
    model: string = 'openai/gpt-3.5-turbo', 
    apiKey?: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string> {
    try {
      if (!apiKey) {
        throw new BadRequestException('API key is required for OpenRouter');
      }

      this.logger.log(`Generating text with OpenRouter model: ${model}`);
      
      const llm = new ChatOpenAI({
        apiKey: apiKey,
        modelName: model,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1000,
        timeout: options?.timeout ?? 30000,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'AI Todo App',
          },
        },
      });
      
      const response = await llm.invoke(prompt);
      return response.content.toString();
    } catch (error) {
      this.logger.error(`OpenRouter generation error: ${error.message}`);
      
      if (error.message.includes('Invalid API key')) {
        throw new BadRequestException('API key inválida ou expirada');
      } else if (error.message.includes('Model not found')) {
        throw new BadRequestException('Modelo não encontrado ou não disponível');
      } else if (error.message.includes('Rate limit')) {
        throw new BadRequestException('Limite de requisições excedido');
      } else if (error.message.includes('Insufficient credits')) {
        throw new BadRequestException('Créditos insuficientes na conta');
      } else {
        throw new BadRequestException(`Falha ao gerar texto usando OpenRouter: ${error.message}`);
      }
    }
  }

  async testApiKey(
    apiKey: string, 
    model: string = 'openai/gpt-3.5-turbo'
  ): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing OpenRouter API key with model: ${model}`);
      
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
      this.logger.error(`OpenRouter API key test failed: ${error.message}`);
      
      let errorMessage = 'Erro desconhecido ao testar API key';
      
      if (error.message.includes('Invalid API key')) {
        errorMessage = 'API key inválida ou expirada';
      } else if (error.message.includes('Model not found')) {
        errorMessage = 'Modelo não encontrado ou não disponível';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Limite de requisições excedido';
      } else if (error.message.includes('Insufficient credits')) {
        errorMessage = 'Créditos insuficientes na conta';
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
    return this.availableModels.includes(model);
  }
}
