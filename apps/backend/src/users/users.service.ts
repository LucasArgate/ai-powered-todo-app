import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';

export interface CreateUserDto {
  name?: string;
  isAnonymous?: boolean;
  aiIntegrationType?: 'huggingface' | 'openrouter';
  aiToken?: string;
}

export interface UpdateUserDto {
  name?: string;
  isAnonymous?: boolean;
  aiIntegrationType?: 'huggingface' | 'openrouter';
  aiToken?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        isAnonymous: createUserDto.isAnonymous ?? true,
        aiIntegrationType: createUserDto.aiIntegrationType,
        aiToken: createUserDto.aiToken,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id); // Check if user exists
    
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if user exists
    
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAnonymousUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { isAnonymous: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRegisteredUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { isAnonymous: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}