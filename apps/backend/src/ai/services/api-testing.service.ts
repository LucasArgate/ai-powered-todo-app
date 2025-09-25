import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { LangChainService, LLMProvider, LLMConfig } from './langchain.service';

@Injectable()
export class ApiTestingService {
  private readonly logger = new Logger(ApiTestingService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly langChainService: LangChainService,
  ) {}

  /**
   * Tests if the logged user's API key is working correctly
   */
  async testUserApiKey(userId: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing user API key for provider: ${provider}, userId: ${userId}`);
      
      // Get user data (including API key)
      const user = await this.usersService.findOne(userId);
      
      // Check if user has API key configured
      if (!user.aiToken) {
        return {
          valid: false,
          message: 'Usuário não possui API key configurada. Configure sua integração de IA primeiro.',
          provider: provider,
          model: model,
        };
      }
      
      // Map provider to LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Create test configuration - use user's model if available
      const config = {
        provider: llmProvider,
        apiKey: user.aiToken,
        model: (user as any).aiModel || model, // Prioritize user's model
        temperature: 0.1,
        maxTokens: 50,
      };
      
      // Test using LangChainService
      const result = await this.langChainService.testApiKey(config);
      
      this.logger.log(`User API key test completed for ${provider}: ${result.valid ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Error testing user API key:', error.message);
      
      // Return generic error if something goes wrong
      return {
        valid: false,
        message: 'Erro interno ao testar API key do usuário',
        provider: provider,
        model: model,
      };
    }
  }

  /**
   * Tests if an API key is working correctly (public method)
   */
  async testApiKey(apiKey: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    try {
      this.logger.log(`Testing API key for provider: ${provider}`);
      
      // Map provider to LLMProvider
      const llmProvider = this.mapProvider(provider);
      
      // Create test configuration
      const config = {
        provider: llmProvider,
        apiKey: apiKey,
        model: model,
        temperature: 0.1,
        maxTokens: 50,
      };
      
      // Test using LangChainService
      const result = await this.langChainService.testApiKey(config);
      
      this.logger.log(`API key test completed for ${provider}: ${result.valid ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Error testing API key:', error.message);
      
      // Return generic error if something goes wrong
      return {
        valid: false,
        message: 'Erro interno ao testar API key',
        provider: provider,
        model: model,
      };
    }
  }

  /**
   * Maps old providers to new LLMProviders
   */
  private mapProvider(provider: string): LLMProvider {
    const providerMap: Record<string, LLMProvider> = {
      'huggingface': 'huggingface',
      'openrouter': 'openrouter',
    };
    
    return providerMap[provider] || 'huggingface';
  }
}
