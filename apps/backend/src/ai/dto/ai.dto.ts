import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GenerateTasksDto {
  @ApiProperty({
    description: 'Prompt ou objetivo para gerar tarefas',
    example: 'planejar uma viagem para o Japão',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiPropertyOptional({
    description: 'API Key do provedor de IA (opcional se configurado no .env)',
    example: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({
    description: 'Provedor de IA a ser utilizado (apenas gratuitos)',
    enum: ['huggingface', 'openrouter'],
    example: 'huggingface',
    default: 'huggingface',
  })
  @IsOptional()
  @IsEnum(['huggingface', 'openrouter'])
  provider?: 'huggingface' | 'openrouter';

  @ApiPropertyOptional({
    description: 'Modelo específico do provedor',
    example: 'gpt-3.5-turbo',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Temperatura para controle de criatividade (0.0 a 1.0)',
    example: 0.7,
    minimum: 0.0,
    maximum: 1.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Número máximo de tokens na resposta',
    example: 1000,
    minimum: 100,
    maximum: 4000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(4000)
  maxTokens?: number;
}

export class AiConfigDto {
  @ApiProperty({
    description: 'API Key do provedor de IA',
    example: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Provedor de IA (apenas gratuitos)',
    enum: ['huggingface', 'openrouter'],
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'huggingface' | 'openrouter';
}
