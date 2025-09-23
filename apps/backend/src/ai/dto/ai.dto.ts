import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Provedor de IA a ser utilizado',
    enum: ['huggingface', 'openrouter'],
    example: 'huggingface',
    default: 'huggingface',
  })
  @IsOptional()
  @IsEnum(['huggingface', 'openrouter'])
  provider?: 'huggingface' | 'openrouter';
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
    description: 'Provedor de IA',
    enum: ['huggingface', 'openrouter'],
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  provider: 'huggingface' | 'openrouter';
}
