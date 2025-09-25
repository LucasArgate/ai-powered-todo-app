/**
 * Interface that defines the contract for AI providers
 * This ensures all providers have the same public methods, making them interchangeable
 */
export interface IAiProvider {
  /**
   * Generates a text response based on a prompt
   * @param prompt The prompt to send to the model
   * @param model Optional specific model to use
   * @param apiKey Optional API key if needed
   * @param options Optional configuration options
   * @returns The LLM response as string
   */
  generate(
    prompt: string, 
    model?: string, 
    apiKey?: string, 
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string>;

  /**
   * Tests if the API key is working correctly
   * @param apiKey The API key to test
   * @param model Optional model to test with
   * @returns Test result with validation status and message
   */
  testApiKey(
    apiKey: string, 
    model?: string
  ): Promise<{ valid: boolean; message: string; provider: string; model?: string }>;

  /**
   * Gets the provider name
   * @returns Provider identifier
   */
  getProviderName(): string;

  /**
   * Gets available models for this provider
   * @returns Array of available models
   */
  getAvailableModels(): string[];

  /**
   * Checks if the provider supports a specific model
   * @param model Model name to check
   * @returns True if model is supported
   */
  supportsModel(model: string): boolean;
}
