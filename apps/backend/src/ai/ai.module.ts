import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TasksModule } from '../tasks/tasks.module';
import { LangChainService } from './services/langchain.service';

@Module({
  imports: [TasksModule],
  controllers: [AiController],
  providers: [AiService, LangChainService],
  exports: [AiService, LangChainService],
})
export class AiModule {}
