import { Module } from '@nestjs/common';
import { TaskListsService } from './task-lists.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TaskListsService],
  exports: [TaskListsService],
})
export class TaskListsModule {}
