import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiPublicController } from './ai-public.controller';
import { ProvidersController } from './providers.controller';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { TaskListsModule } from '../task-lists/task-lists.module';
import { DatabaseModule } from '../database/database.module';
import { LangChainService } from './services/langchain.service';
import { TaskGenerationService } from './services/task-generation.service';
import { ApiTestingService } from './services/api-testing.service';
import { ProviderService } from './services/provider.service';
import { HuggingFaceProvider } from './providers/huggingface.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AiProviderFactory } from './providers/ai-provider.factory';

@Module({
  imports: [TasksModule, UsersModule, TaskListsModule, DatabaseModule],
  controllers: [AiController, AiPublicController, ProvidersController],
  providers: [
    // Core services
    AiService, 
    LangChainService, 
    TaskGenerationService, 
    ApiTestingService, 
    ProviderService,
    // AI Providers
    HuggingFaceProvider,
    OpenRouterProvider,
    GeminiProvider,
    // Factory
    AiProviderFactory,
  ],
  exports: [
    AiService, 
    LangChainService, 
    TaskGenerationService, 
    ApiTestingService, 
    ProviderService,
    HuggingFaceProvider,
    OpenRouterProvider,
    GeminiProvider,
    AiProviderFactory,
  ],
})
export class AiModule {}
