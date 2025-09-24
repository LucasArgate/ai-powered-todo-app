import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { AiIntegrationType } from './user.dto';

export class ConfigureAiIntegrationDto {
  @ApiProperty({
    description: 'AI integration type',
    enum: AiIntegrationType,
    example: 'huggingface',
    required: true,
  })
  @IsEnum(AiIntegrationType)
  aiIntegrationType: AiIntegrationType;

  @ApiProperty({
    description: 'AI API token',
    example: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    required: true,
  })
  @IsString()
  aiToken: string;

  @ApiProperty({
    description: 'AI model to use with the integration',
    example: 'gpt2',
    required: false,
  })
  @IsOptional()
  @IsString()
  aiModel?: string;
}
