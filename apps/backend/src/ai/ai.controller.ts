import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateTasksDto } from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-tasks')
  @ApiOperation({ 
    summary: 'Gerar tarefas usando IA',
    description: 'Gera uma lista de tarefas baseada em um prompt usando serviços de IA como Hugging Face ou OpenRouter. Usa a API key configurada no perfil do usuário.'
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID do usuário que possui a API key configurada',
    required: true,
    example: 'user_123'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tarefas geradas e salvas com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: 'Pesquisar destinos' },
          description: { type: 'string', example: 'Encontrar lugares interessantes para visitar' },
          isCompleted: { type: 'boolean', example: false },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          category: { type: 'string', example: 'AI Generated' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Erro na requisição ou falha na API de IA' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async generateTasks(
    @Query('userId') userId: string,
    @Body() generateTasksDto: GenerateTasksDto
  ) {
    return await this.aiService.generateTasksFromPrompt(userId, generateTasksDto);
  }

  @Post('generate-tasklist')
  @ApiOperation({ 
    summary: 'Gerar lista de tarefas completa usando IA',
    description: 'Gera uma lista de tarefas completa (com título, descrição e tasks) baseada em um prompt usando serviços de IA. Cria uma TaskList com todas as tasks organizadas.'
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID do usuário que possui a API key configurada',
    required: true,
    example: 'user_123'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Lista de tarefas gerada e salva com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'list_123' },
        name: { type: 'string', example: 'Viagem para o Japão' },
        description: { type: 'string', example: 'Planejamento completo para uma viagem ao Japão' },
        iaPrompt: { type: 'string', example: 'planejar viagem para Japão' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'task_123' },
              title: { type: 'string', example: 'Pesquisar voos' },
              isCompleted: { type: 'boolean', example: false },
              position: { type: 'number', example: 1 },
              listId: { type: 'string', example: 'list_123' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Erro na requisição ou falha na API de IA' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async generateTaskList(
    @Query('userId') userId: string,
    @Body() generateTasksDto: GenerateTasksDto
  ) {
    return await this.aiService.generateTaskListFromPrompt(userId, generateTasksDto);
  }

  @Get('providers')
  @ApiOperation({ 
    summary: 'Listar provedores de IA disponíveis',
    description: 'Retorna informações sobre os provedores de IA suportados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de provedores disponíveis',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'huggingface' },
          description: { type: 'string', example: 'Hugging Face Inference API - Free tier available' },
          free: { type: 'boolean', example: true }
        }
      }
    }
  })
  async getProviders() {
    return await this.aiService.getAvailableProviders();
  }
}
