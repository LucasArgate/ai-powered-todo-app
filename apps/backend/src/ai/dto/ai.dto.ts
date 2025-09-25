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
    description: 'Nome personalizado para a lista de tarefas (se não fornecido, será gerado automaticamente)',
    example: 'Viagem para o Japão',
  })
  @IsOptional()
  @IsString()
  listName?: string;

  @ApiPropertyOptional({
    description: 'Descrição personalizada para a lista de tarefas (se não fornecida, será gerada automaticamente)',
    example: 'Planejamento completo para uma viagem ao Japão',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Provedor de IA a ser utilizado',
    enum: ['huggingface', 'openrouter', 'gemini'],
    example: 'huggingface',
    default: 'huggingface',
  })
  @IsOptional()
  @IsEnum(['huggingface', 'openrouter', 'gemini'])
  provider?: 'huggingface' | 'openrouter' | 'gemini';

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
    description: 'Provedor de IA',
    enum: ['huggingface', 'openrouter', 'gemini'],
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'huggingface' | 'openrouter' | 'gemini';
}

export class TestApiKeyDto {
  @ApiProperty({
    description: 'API key para testar',
    example: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Provedor de IA para testar',
    enum: ['huggingface', 'openrouter', 'gemini'],
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'huggingface' | 'openrouter' | 'gemini';

  @ApiPropertyOptional({
    description: 'Modelo específico do provedor para testar',
    example: 'gpt-3.5-turbo',
  })
  @IsOptional()
  @IsString()
  model?: string;
}

export class TestUserApiKeyDto {
  @ApiProperty({
    description: 'Provedor de IA para testar',
    enum: ['huggingface', 'openrouter', 'gemini'],
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'huggingface' | 'openrouter' | 'gemini';

  @ApiPropertyOptional({
    description: 'Modelo específico do provedor para testar',
    example: 'gpt-3.5-turbo',
  })
  @IsOptional()
  @IsString()
  model?: string;
}