import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ConfigureAiIntegrationDto } from './dto/ai-integration.dto';

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
        aiModel: createUserDto.aiModel,
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
    
    // Prepare update data
    const updateData: any = {};
    
    // Update name if provided
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
      // Set isAnonymous based on name: if name is provided and not empty, user is not anonymous
      updateData.isAnonymous = !updateUserDto.name || updateUserDto.name.trim() === '';
    }
    
    // Update aiIntegrationType if provided
    if (updateUserDto.aiIntegrationType !== undefined) {
      updateData.aiIntegrationType = updateUserDto.aiIntegrationType;
    }
    
    // Update aiToken if provided
    if (updateUserDto.aiToken !== undefined) {
      updateData.aiToken = updateUserDto.aiToken;
    }
    
    // Update aiModel if provided
    if (updateUserDto.aiModel !== undefined) {
      updateData.aiModel = updateUserDto.aiModel;
    }
    
    // If isAnonymous is explicitly provided, use that value
    if (updateUserDto.isAnonymous !== undefined) {
      updateData.isAnonymous = updateUserDto.isAnonymous;
    }
    
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
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

  async configureAiIntegration(id: string, configureAiDto: ConfigureAiIntegrationDto): Promise<User> {
    await this.findOne(id); // Check if user exists
    
    return await this.prisma.user.update({
      where: { id },
      data: {
        aiIntegrationType: configureAiDto.aiIntegrationType,
        aiToken: configureAiDto.aiToken,
        aiModel: configureAiDto.aiModel,
      },
    });
  }
}