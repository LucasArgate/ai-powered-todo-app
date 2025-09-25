import { Injectable } from '@nestjs/common';
import { GenerateTasksDto } from './dto/ai.dto';
import { TaskListsService, TaskListWithTasksAndCounts } from '../task-lists/task-lists.service';
import { TaskGenerationService } from './services/task-generation.service';
import { ApiTestingService } from './services/api-testing.service';
import { ProviderService } from './services/provider.service';

@Injectable()
export class AiService {
  constructor(
    private readonly taskGenerationService: TaskGenerationService,
    private readonly apiTestingService: ApiTestingService,
    private readonly providerService: ProviderService,
  ) {}

  async generateTasksFromPrompt(userId: string, dto: GenerateTasksDto): Promise<any[]> {
    return this.taskGenerationService.generateTasksFromPrompt(userId, dto);
  }

  async generateTaskListFromPrompt(userId: string, dto: GenerateTasksDto): Promise<TaskListWithTasksAndCounts> {
    return this.taskGenerationService.generateTaskListFromPrompt(userId, dto);
  }

  async generateTaskListPreview(userId: string, dto: GenerateTasksDto): Promise<{ name: string; description: string; tasks: any[] }> {
    return this.taskGenerationService.generateTaskListPreview(userId, dto);
  }

  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return this.providerService.getAvailableProviders();
  }

  /**
   * Tests if the logged user's API key is working correctly
   */
  async testUserApiKey(userId: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    return this.apiTestingService.testUserApiKey(userId, provider, model);
  }

  /**
   * Tests if an API key is working correctly (public method)
   */
  async testApiKey(apiKey: string, provider: string, model?: string): Promise<{ valid: boolean; message: string; provider: string; model?: string }> {
    return this.apiTestingService.testApiKey(apiKey, provider, model);
  }

}
