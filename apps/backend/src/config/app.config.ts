import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', 'file:./prisma/todo-app.db');
  }

  get corsOrigin(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    return origins.split(',').map(origin => origin.trim());
  }

  get huggingFaceApiKey(): string {
    return this.configService.get<string>('HUGGINGFACE_API_KEY', '');
  }

  get openRouterApiKey(): string {
    return this.configService.get<string>('OPENROUTER_API_KEY', '');
  }
}
