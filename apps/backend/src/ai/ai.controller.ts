import { Controller, Post, Body, Get, Query, Param, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AiService } from './ai.service';
import { GenerateTasksDto, TestApiKeyDto, TestUserApiKeyDto } from './dto/ai.dto';
import { BaseController } from '../common/base.controller';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController extends BaseController {
  constructor(private readonly aiService: AiService) {
    super();
  }

  @Post('generate-tasks')
  @ApiOperation({ 
    summary: 'Gerar tarefas usando IA',
    description: 'Gera uma lista de tarefas baseada em um prompt usando serviços de IA como Hugging Face ou OpenRouter. Se um listName for fornecido, cria uma nova TaskList com esse nome. Usa a API key configurada no perfil do usuário.'
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
  @ApiResponse({ status: 401, description: 'Token de autorização inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async generateTasks(
    @Req() request: any,
    @Body() generateTasksDto: GenerateTasksDto
  ) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return await this.aiService.generateTasksFromPrompt(userId, generateTasksDto);
  }

  @Post('generate-tasklist')
  @ApiOperation({ 
    summary: 'Gerar lista de tarefas completa usando IA',
    description: 'Gera uma lista de tarefas completa (com título, descrição e tasks) baseada em um prompt usando serviços de IA. Se um listName for fornecido, usa esse nome; caso contrário, gera automaticamente um título usando IA. Cria uma TaskList com todas as tasks organizadas.'
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
  @ApiResponse({ status: 401, description: 'Token de autorização inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async generateTaskList(
    @Req() request: any,
    @Body() generateTasksDto: GenerateTasksDto
  ) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return await this.aiService.generateTaskListFromPrompt(userId, generateTasksDto);
  }

  @Post('generate-tasklist-preview')
  @ApiOperation({ 
    summary: 'Gerar preview de lista de tarefas usando IA',
    description: 'Gera um preview de lista de tarefas (com título, descrição e tasks) baseada em um prompt usando serviços de IA. Não salva no banco de dados, apenas retorna os dados para preview. Se um listName for fornecido, usa esse nome; caso contrário, gera automaticamente um título usando IA.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Preview da lista de tarefas gerado com sucesso',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Viagem para o Japão' },
        description: { type: 'string', example: 'Planejamento completo para uma viagem ao Japão' },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', example: 'Pesquisar voos' },
              description: { type: 'string', example: 'Encontrar voos com melhor custo-benefício' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
              category: { type: 'string', example: 'Transporte' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Erro na requisição ou falha na API de IA' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async generateTaskListPreview(
    @Req() request: any,
    @Body() generateTasksDto: GenerateTasksDto
  ) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return await this.aiService.generateTaskListPreview(userId, generateTasksDto);
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

  @Post('test-api-key')
  @ApiOperation({ 
    summary: 'Testar API key do usuário logado',
    description: 'Testa se a API key configurada no perfil do usuário logado está funcionando corretamente com o provedor especificado. Usa o aiToken salvo no banco de dados do usuário.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado do teste da API key do usuário',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        message: { type: 'string', example: 'API key está funcionando corretamente' },
        provider: { type: 'string', example: 'huggingface' },
        model: { type: 'string', example: 'gpt-3.5-turbo' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Erro na requisição ou API key inválida' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado ou sem API key configurada' })
  async testApiKey(
    @Req() request: any,
    @Body() testUserApiKeyDto: TestUserApiKeyDto
  ) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return await this.aiService.testUserApiKey(
      userId,
      testUserApiKeyDto.provider,
      testUserApiKeyDto.model
    );
  }

}
