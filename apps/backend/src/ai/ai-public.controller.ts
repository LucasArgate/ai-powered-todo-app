import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { TestApiKeyDto } from './dto/ai.dto';

@ApiTags('ai-public')
@Controller('ai-public')
export class AiPublicController {
  constructor(private readonly aiService: AiService) {}

  @Post('test-api-key')
  @ApiOperation({ 
    summary: 'Testar API key de IA (público)',
    description: 'Testa se uma API key está funcionando corretamente com o provedor especificado. Endpoint público que não requer autenticação.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado do teste da API key',
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
  async testApiKey(@Body() testApiKeyDto: TestApiKeyDto) {
    return await this.aiService.testApiKey(
      testApiKeyDto.apiKey,
      testApiKeyDto.provider,
      testApiKeyDto.model
    );
  }
}
