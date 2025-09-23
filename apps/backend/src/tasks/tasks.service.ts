import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.prisma.task.create({
      data: {
        listId: createTaskDto.listId,
        title: createTaskDto.title,
        position: createTaskDto.position,
        isCompleted: createTaskDto.isCompleted ?? false,
      },
    });
  }

  async findAll(): Promise<Task[]> {
    return await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id); // Check if task exists
    
    return await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if task exists
    
    await this.prisma.task.delete({
      where: { id },
    });
  }

  async toggleComplete(id: string): Promise<Task> {
    const task = await this.findOne(id);
    const newStatus = !task.isCompleted;
    
    return await this.prisma.task.update({
      where: { id },
      data: { isCompleted: newStatus },
    });
  }

  async findByListId(listId: string): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { listId },
      orderBy: { position: 'asc' },
    });
  }

  async findCompleted(): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { isCompleted: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPending(): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { isCompleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}