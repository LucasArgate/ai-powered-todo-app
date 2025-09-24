import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TaskList, Task } from '@prisma/client';

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

export interface TaskListWithTasksAndCounts extends TaskList {
  tasks: Task[];
  tasksCount: number;
  completedTasksCount: number;
}

@Injectable()
export class TaskListsService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createTaskListDto: CreateTaskListDto): Promise<TaskList> {
    // First verify that the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createTaskListDto.userId },
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${createTaskListDto.userId} not found`);
    }

    return await this.prisma.taskList.create({
      data: {
        userId: createTaskListDto.userId,
        name: createTaskListDto.name,
        description: createTaskListDto.description,
        iaPrompt: createTaskListDto.iaPrompt,
      },
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

  async update(id: string, updateTaskListDto: UpdateTaskListDto, userId: string): Promise<TaskList> {
    await this.findOneWithUserCheck(id, userId); // Check if taskList exists and belongs to user
    
    return await this.prisma.taskList.update({
      where: { id },
      data: updateTaskListDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOneWithUserCheck(id, userId); // Check if taskList exists and belongs to user
    
    await this.prisma.taskList.delete({
      where: { id },
    });
  }

  async findByUserIdWithTasksAndCounts(userId: string): Promise<TaskListWithTasksAndCounts[]> {
    const taskLists = await this.prisma.taskList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get tasks and counts for each task list
    const taskListsWithTasksAndCounts = await Promise.all(
      taskLists.map(async (taskList) => {
        const tasks = await this.prisma.task.findMany({
          where: { listId: taskList.id },
          orderBy: { position: 'asc' },
        });

        const tasksCount = tasks.length;
        const completedTasksCount = tasks.filter(task => task.isCompleted).length;

        return {
          ...taskList,
          tasks,
          tasksCount,
          completedTasksCount,
        };
      })
    );

    return taskListsWithTasksAndCounts;
  }


  private async findOneWithUserCheck(id: string, userId: string): Promise<TaskList> {
    const taskList = await this.prisma.taskList.findFirst({
      where: { 
        id,
        userId,
      },
    });
    
    if (!taskList) {
      throw new NotFoundException(`TaskList with ID ${id} not found or does not belong to user`);
    }
    
    return taskList;
  }
}