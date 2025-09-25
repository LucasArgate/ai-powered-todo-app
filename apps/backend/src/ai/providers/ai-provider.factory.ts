import { Injectable, Logger } from '@nestjs/common';
import { HuggingFaceProvider } from './huggingface.provider';
import { OpenRouterProvider } from './openrouter.provider';
import { GeminiProvider } from './gemini.provider';
import { IAiProvider } from './ai-provider.interface';

export type ProviderType = 'huggingface' | 'openrouter' | 'gemini';

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);

  constructor(
    // NestJS injects provider instances here
    private readonly huggingFaceProvider: HuggingFaceProvider,
    private readonly openRouterProvider: OpenRouterProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  /**
   * Gets the appropriate AI provider based on the provider type
   * @param providerType The type of provider to get
   * @returns The AI provider instance
   */
  public getProvider(providerType: ProviderType): IAiProvider {
    this.logger.log(`Getting provider for type: ${providerType}`);
    
    switch (providerType) {
      case 'huggingface':
        return this.huggingFaceProvider;
      case 'openrouter':
        return this.openRouterProvider;
      case 'gemini':
        return this.geminiProvider;
      default:
        const errorMessage = `Provedor de IA '${providerType}' não suportado. Provedores disponíveis: ${this.getSupportedProviders().join(', ')}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }
  }

  /**
   * Gets all supported provider types
   * @returns Array of supported provider types
   */
  public getSupportedProviders(): ProviderType[] {
    return ['huggingface', 'openrouter', 'gemini'];
  }

  /**
   * Gets information about all available providers
   * @returns Array of provider information
   */
  public getProvidersInfo(): Array<{
    name: ProviderType;
    description: string;
    free: boolean;
    models: string[];
  }> {
    return [
      {
        name: 'huggingface',
        description: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
        free: true,
        models: this.huggingFaceProvider.getAvailableModels(),
      },
      {
        name: 'openrouter',
        description: 'OpenRouter - Acesso a múltiplos modelos de IA',
        free: false,
        models: this.openRouterProvider.getAvailableModels(),
      },
      {
        name: 'gemini',
        description: 'Google Gemini - Modelos avançados do Google',
        free: false,
        models: this.geminiProvider.getAvailableModels(),
      },
    ];
  }

  /**
   * Validates if a provider type is supported
   * @param providerType Provider type to validate
   * @returns True if provider is supported
   */
  public isProviderSupported(providerType: string): providerType is ProviderType {
    return this.getSupportedProviders().includes(providerType as ProviderType);
  }

  /**
   * Gets available models for a specific provider
   * @param providerType Provider type
   * @returns Array of available models
   */
  public getAvailableModelsForProvider(providerType: ProviderType): string[] {
    const provider = this.getProvider(providerType);
    return provider.getAvailableModels();
  }

  /**
   * Checks if a model is supported by a provider
   * @param providerType Provider type
   * @param model Model name
   * @returns True if model is supported
   */
  public isModelSupportedByProvider(providerType: ProviderType, model: string): boolean {
    const provider = this.getProvider(providerType);
    return provider.supportsModel(model);
  }
}
