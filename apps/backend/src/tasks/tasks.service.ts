import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // First verify that the taskList belongs to the user
    const taskList = await this.prisma.taskList.findFirst({
      where: {
        id: createTaskDto.listId,
        userId: userId,
      },
    });

    if (!taskList) {
      throw new Error('TaskList not found or does not belong to user');
    }

    // Get the next position if not provided
    let position = createTaskDto.position;
    if (position === undefined) {
      const lastTask = await this.prisma.task.findFirst({
        where: { listId: createTaskDto.listId },
        orderBy: { position: 'desc' },
      });
      position = lastTask ? lastTask.position + 1 : 1;
    }

    return await this.prisma.task.create({
      data: {
        listId: createTaskDto.listId,
        title: createTaskDto.title,
        description: createTaskDto.description,
        position: position,
        isCompleted: createTaskDto.isCompleted ?? false,
        priority: createTaskDto.priority ?? 'medium',
        category: createTaskDto.category,
      },
    });
  }


  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    await this.findOneWithUserCheck(id, userId); // Check if task exists and belongs to user
    
    return await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOneWithUserCheck(id, userId); // Check if task exists and belongs to user
    
    await this.prisma.task.delete({
      where: { id },
    });
  }

  async toggleComplete(id: string, userId: string): Promise<Task> {
    const task = await this.findOneWithUserCheck(id, userId);
    const newStatus = !task.isCompleted;
    
    return await this.prisma.task.update({
      where: { id },
      data: { isCompleted: newStatus },
    });
  }

  private async findOneWithUserCheck(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        taskList: {
          userId: userId,
        },
      },
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

}