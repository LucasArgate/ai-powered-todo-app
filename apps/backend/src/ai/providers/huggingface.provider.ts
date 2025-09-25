import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
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
    'microsoft/DialoGPT-small'
  ];

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

      this.logger.log(`Generating text with Hugging Face model: ${model}`);
      
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
    } catch (error) {
      this.logger.error(`Hugging Face generation error: ${error.message}`);
      
      if (error.message.includes('No Inference Provider available')) {
        throw new BadRequestException(`Modelo "${model}" não possui provedor de inferência disponível. Verifique se o modelo está disponível no Hugging Face Hub.`);
      } else if (error.message.includes('Invalid API key')) {
        throw new BadRequestException('API key inválida ou expirada');
      } else if (error.message.includes('Rate limit')) {
        throw new BadRequestException('Limite de requisições excedido');
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
    return this.availableModels.includes(model);
  }
}
