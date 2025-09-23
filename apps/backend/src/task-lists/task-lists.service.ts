import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TaskList } from '@prisma/client';

export interface CreateTaskListDto {
  userId: string;
  name: string;
  description?: string;
  iaPrompt?: string;
}

export interface UpdateTaskListDto {
  name?: string;
  description?: string;
  iaPrompt?: string;
}

@Injectable()
export class TaskListsService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createTaskListDto: CreateTaskListDto): Promise<TaskList> {
    return await this.prisma.taskList.create({
      data: {
        userId: createTaskListDto.userId,
        name: createTaskListDto.name,
        description: createTaskListDto.description,
        iaPrompt: createTaskListDto.iaPrompt,
      },
    });
  }

  async findAll(): Promise<TaskList[]> {
    return await this.prisma.taskList.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<TaskList[]> {
    return await this.prisma.taskList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<TaskList> {
    const taskList = await this.prisma.taskList.findUnique({
      where: { id },
    });
    
    if (!taskList) {
      throw new NotFoundException(`TaskList with ID ${id} not found`);
    }
    
    return taskList;
  }

  async update(id: string, updateTaskListDto: UpdateTaskListDto): Promise<TaskList> {
    await this.findOne(id); // Check if taskList exists
    
    return await this.prisma.taskList.update({
      where: { id },
      data: updateTaskListDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if taskList exists
    
    await this.prisma.taskList.delete({
      where: { id },
    });
  }
}