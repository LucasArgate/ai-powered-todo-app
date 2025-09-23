import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { TaskListsModule } from './task-lists/task-lists.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AppConfigService } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    TaskListsModule,
    TasksModule,
    AiModule,
    HealthModule,
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppModule {}