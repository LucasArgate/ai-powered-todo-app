import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { IAiProvider } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly providerName = 'gemini';
  private readonly availableModels = [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];

  async generate(
    prompt: string, 
    model: string = 'gemini-pro', 
    apiKey?: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string> {
    try {
      if (!apiKey) {
        throw new BadRequestException('API key is required for Gemini');
      }

      this.logger.log(`Generating text with Gemini model: ${model}`);
      
      // Use OpenAI-compatible API for Gemini via Google AI Studio
      const llm = new ChatOpenAI({
        model: model,
        apiKey: apiKey,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1000,
        timeout: options?.timeout ?? 30000,
        configuration: {
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
          defaultHeaders: {
            'x-goog-api-key': apiKey,
          },
        },
      });
      
      const response = await llm.invoke(prompt);
      return response.content.toString();
    } catch (error) {
      this.logger.error(`Gemini generation error: ${error.message}`);
      
      if (error.message.includes('API key not valid')) {
        throw new BadRequestException('API key inválida ou expirada');
      } else if (error.message.includes('Model not found')) {
        throw new BadRequestException('Modelo não encontrado ou não disponível');
      } else if (error.message.includes('Quota exceeded')) {
        throw new BadRequestException('Cota de uso excedida');
      } else if (error.message.includes('Rate limit')) {
        throw new BadRequestException('Limite de requisições excedido');
      } else {
        throw new BadRequestException(`Falha ao gerar texto usando Gemini: ${error.message}`);
      }
    }
  }

  async testApiKey(
    apiKey: string, 
    model: string = 'gemini-pro'
  ): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing Gemini API key with model: ${model}`);
      
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
      this.logger.error(`Gemini API key test failed: ${error.message}`);
      
      let errorMessage = 'Erro desconhecido ao testar API key';
      
      if (error.message.includes('API key not valid')) {
        errorMessage = 'API key inválida ou expirada';
      } else if (error.message.includes('Model not found')) {
        errorMessage = 'Modelo não encontrado ou não disponível';
      } else if (error.message.includes('Quota exceeded')) {
        errorMessage = 'Cota de uso excedida';
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
    return this.availableModels.includes(model);
  }
}
