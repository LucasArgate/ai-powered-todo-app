# AI Service Architecture - Strategy & Factory Pattern

## Overview
The AI service has been completely redesigned using the **Strategy** and **Factory** design patterns to support multiple AI providers (HuggingFace, OpenRouter, Gemini) in a flexible, extensible, and maintainable way. The architecture follows the principle of "programming to an interface, not an implementation."

## Architecture Components

### 1. Interface Contract (`providers/ai-provider.interface.ts`)
**Responsibility**: Defines the contract that all AI providers must implement
- **Methods**:
  - `generate()` - Generate text responses from prompts
  - `testApiKey()` - Test API key functionality
  - `getProviderName()` - Get provider identifier
  - `getAvailableModels()` - Get supported models
  - `supportsModel()` - Check model support

### 2. Strategy Implementations (Providers)

#### HuggingFaceProvider (`providers/huggingface.provider.ts`)
**Responsibility**: Hugging Face Inference API integration
- **Features**: Direct API calls, fallback to conversational models
- **Models**: DialoGPT, BlenderBot, Mistral, Flan-T5
- **Cost**: Free tier available

#### OpenRouterProvider (`providers/openrouter.provider.ts`)
**Responsibility**: OpenRouter API integration
- **Features**: Multiple model access, OpenAI-compatible API
- **Models**: GPT-3.5/4, Claude, Gemini, Llama, Mistral
- **Cost**: Pay-per-use

#### GeminiProvider (`providers/gemini.provider.ts`)
**Responsibility**: Google Gemini API integration
- **Features**: Google's advanced models
- **Models**: Gemini Pro, Gemini Pro Vision, Gemini 1.5 Pro/Flash
- **Cost**: Pay-per-use

### 3. Factory Pattern (`providers/ai-provider.factory.ts`)
**Responsibility**: Provider instantiation and management
- **Methods**:
  - `getProvider()` - Get provider instance by type
  - `getSupportedProviders()` - Get all supported provider types
  - `getProvidersInfo()` - Get detailed provider information
  - `isProviderSupported()` - Validate provider support
  - `getAvailableModelsForProvider()` - Get models for specific provider
  - `isModelSupportedByProvider()` - Check model support

### 4. Core Services

#### LangChainService (`services/langchain.service.ts`)
**Responsibility**: Orchestrates AI operations using providers
- **Methods**:
  - `generateTasks()` - Generate structured tasks using providers
  - `generateText()` - Generate simple text using providers
  - `generateListTitle()` - Generate list titles using providers
  - `generateListDescription()` - Generate list descriptions using providers
  - `testApiKey()` - Test API keys using providers
  - `getAvailableProviders()` - Get provider information via factory

#### TaskGenerationService (`services/task-generation.service.ts`)
**Responsibility**: Task and task list generation business logic
- **Methods**:
  - `generateTasksFromPrompt()` - Generate tasks from prompt and save to DB
  - `generateTaskListFromPrompt()` - Generate complete task list from prompt

#### ApiTestingService (`services/api-testing.service.ts`)
**Responsibility**: API key testing functionality
- **Methods**:
  - `testUserApiKey()` - Test logged user's API key
  - `testApiKey()` - Test any API key (public method)

#### ProviderService (`services/provider.service.ts`)
**Responsibility**: Provider information management
- **Methods**:
  - `getAvailableProviders()` - Get available AI providers

### 5. Main Orchestrator

#### AiService (`ai.service.ts`)
**Responsibility**: Main orchestrator service that delegates to specialized services
- **Methods**:
  - `generateTasksFromPrompt()` - Delegates to TaskGenerationService
  - `generateTaskListFromPrompt()` - Delegates to TaskGenerationService
  - `getAvailableProviders()` - Delegates to ProviderService
  - `testUserApiKey()` - Delegates to ApiTestingService
  - `testApiKey()` - Delegates to ApiTestingService

## Architecture Benefits

### 1. **Decoupling**
- Business logic is completely isolated from AI provider implementation details
- Easy to swap providers without changing business logic

### 2. **Open/Closed Principle**
- System is "open for extension" (easy to add new providers)
- System is "closed for modification" (no need to change existing code)

### 3. **Strategy Pattern Benefits**
- Each provider encapsulates its specific implementation
- Providers are interchangeable at runtime
- Easy to add new AI providers

### 4. **Factory Pattern Benefits**
- Centralized provider creation logic
- No conditional logic scattered throughout the codebase
- Easy to manage provider dependencies

### 5. **Testability**
- Easy to mock `IAiProvider` for unit testing
- Each component can be tested independently
- Fast, reliable unit tests without network calls

## Service Dependencies

```
AiService (Main Orchestrator)
├── TaskGenerationService
│   ├── LangChainService
│   │   └── AiProviderFactory
│   │       ├── HuggingFaceProvider
│   │       ├── OpenRouterProvider
│   │       └── GeminiProvider
│   ├── TasksService
│   ├── UsersService
│   └── TaskListsService
├── ApiTestingService
│   ├── LangChainService
│   │   └── AiProviderFactory
│   └── UsersService
└── ProviderService
    └── LangChainService
        └── AiProviderFactory
```

## Usage Example

```typescript
// The service automatically selects the right provider
const provider = this.aiProviderFactory.getProvider('huggingface');
const response = await provider.generate(prompt, model, apiKey, options);

// Easy to switch providers
const provider = this.aiProviderFactory.getProvider('gemini');
const response = await provider.generate(prompt, model, apiKey, options);
```

## Adding New Providers

To add a new AI provider:

1. **Implement the Interface**: Create a new class implementing `IAiProvider`
2. **Add to Factory**: Register the provider in `AiProviderFactory`
3. **Update Types**: Add the provider type to `ProviderType`
4. **Register in Module**: Add the provider to the NestJS module

No changes needed in business logic or existing services!

## Migration Notes

- **Backward Compatibility**: All existing API endpoints remain unchanged
- **Zero Breaking Changes**: Existing functionality works exactly the same
- **Enhanced Flexibility**: Easy to add new providers without code changes
- **Better Error Handling**: Provider-specific error messages and handling
- **Improved Maintainability**: Clear separation of concerns and responsibilities
