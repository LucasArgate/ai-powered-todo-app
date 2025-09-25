import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProviderDto, UpdateProviderDto, ProviderResponseDto, ProviderListResponseDto } from '../dto/provider.dto';
import { LangChainService } from './langchain.service';

@Injectable()
export class ProviderService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly langChainService: LangChainService,
  ) {}

  /**
   * Creates a new AI provider
   */
  async createProvider(createProviderDto: CreateProviderDto): Promise<ProviderResponseDto> {
    try {
      // Check if provider with same name already exists
      const existingProvider = await this.prisma.provider.findUnique({
        where: { name: createProviderDto.name },
      });

      if (existingProvider) {
        throw new ConflictException(`Provedor com nome '${createProviderDto.name}' já existe`);
      }

      // Validate models JSON
      try {
        JSON.parse(createProviderDto.models);
      } catch (error) {
        throw new BadRequestException('Campo models deve ser um JSON array válido');
      }

      const provider = await this.prisma.provider.create({
        data: {
          name: createProviderDto.name,
          description: createProviderDto.description,
          free: createProviderDto.free,
          models: createProviderDto.models,
          tokenUrl: createProviderDto.tokenUrl,
          documentationUrl: createProviderDto.documentationUrl,
          isActive: createProviderDto.isActive ?? true,
        },
      });

      return this.mapProviderToResponse(provider);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao criar provedor: ${error.message}`);
    }
  }

  /**
   * Gets all providers with pagination
   */
  async getAllProviders(
    page: number = 1,
    limit: number = 10,
    activeOnly: boolean = false
  ): Promise<ProviderListResponseDto> {
    const skip = (page - 1) * limit;
    
    const where = activeOnly ? { isActive: true } : {};
    
    const [providers, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.provider.count({ where }),
    ]);

    return {
      providers: providers.map(provider => this.mapProviderToResponse(provider)),
      total,
    };
  }

  /**
   * Gets a provider by ID
   */
  async getProviderById(id: string): Promise<ProviderResponseDto> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provedor com ID '${id}' não encontrado`);
    }

    return this.mapProviderToResponse(provider);
  }

  /**
   * Gets a provider by name
   */
  async getProviderByName(name: string): Promise<ProviderResponseDto> {
    const provider = await this.prisma.provider.findUnique({
      where: { name },
    });

    if (!provider) {
      throw new NotFoundException(`Provedor com nome '${name}' não encontrado`);
    }

    return this.mapProviderToResponse(provider);
  }

  /**
   * Updates a provider
   */
  async updateProvider(id: string, updateProviderDto: UpdateProviderDto): Promise<ProviderResponseDto> {
    try {
      // Check if provider exists
      const existingProvider = await this.prisma.provider.findUnique({
        where: { id },
      });

      if (!existingProvider) {
        throw new NotFoundException(`Provedor com ID '${id}' não encontrado`);
      }

      // Validate models JSON if provided
      if (updateProviderDto.models) {
        try {
          JSON.parse(updateProviderDto.models);
        } catch (error) {
          throw new BadRequestException('Campo models deve ser um JSON array válido');
        }
      }

      const provider = await this.prisma.provider.update({
        where: { id },
        data: updateProviderDto,
      });

      return this.mapProviderToResponse(provider);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao atualizar provedor: ${error.message}`);
    }
  }

  /**
   * Deletes a provider
   */
  async deleteProvider(id: string): Promise<void> {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
      });

      if (!provider) {
        throw new NotFoundException(`Provedor com ID '${id}' não encontrado`);
      }

      await this.prisma.provider.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao deletar provedor: ${error.message}`);
    }
  }

  /**
   * Toggles provider active status
   */
  async toggleProviderStatus(id: string): Promise<ProviderResponseDto> {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
      });

      if (!provider) {
        throw new NotFoundException(`Provedor com ID '${id}' não encontrado`);
      }

      const updatedProvider = await this.prisma.provider.update({
        where: { id },
        data: { isActive: !provider.isActive },
      });

      return this.mapProviderToResponse(updatedProvider);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao alterar status do provedor: ${error.message}`);
    }
  }

  /**
   * Returns available AI providers with their information (legacy method)
   */
  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return this.langChainService.getAvailableProviders();
  }

  /**
   * Gets active providers from database
   */
  async getActiveProvidersFromDb(): Promise<ProviderResponseDto[]> {
    const providers = await this.prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return providers.map(provider => this.mapProviderToResponse(provider));
  }

  /**
   * Maps Prisma provider to response DTO
   */
  private mapProviderToResponse(provider: any): ProviderResponseDto {
    return {
      id: provider.id,
      name: provider.name,
      description: provider.description,
      free: provider.free,
      models: JSON.parse(provider.models),
      tokenUrl: provider.tokenUrl,
      documentationUrl: provider.documentationUrl,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
