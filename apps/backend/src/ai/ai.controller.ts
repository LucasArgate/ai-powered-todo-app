import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateTasksDto } from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-tasks')
  @ApiOperation({ 
    summary: 'Gerar tarefas usando IA',
    description: 'Gera uma lista de tarefas baseada em um prompt usando serviços de IA como Hugging Face ou OpenRouter'
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
  async generateTasks(@Body() generateTasksDto: GenerateTasksDto) {
    return await this.aiService.generateTasksFromPrompt(generateTasksDto);
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
