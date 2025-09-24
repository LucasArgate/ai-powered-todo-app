import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiPublicController } from './ai-public.controller';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { TaskListsModule } from '../task-lists/task-lists.module';
import { LangChainService } from './services/langchain.service';

@Module({
  imports: [TasksModule, UsersModule, TaskListsModule],
  controllers: [AiController, AiPublicController],
  providers: [AiService, LangChainService],
  exports: [AiService, LangChainService],
})
export class AiModule {}
