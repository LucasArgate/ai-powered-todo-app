import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export enum AiIntegrationType {
  huggingface = 'huggingface',
  openrouter = 'openrouter',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Whether the user is anonymous',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: 'AI integration type',
    enum: AiIntegrationType,
    example: 'openrouter',
    required: false,
  })
  @IsOptional()
  @IsEnum(AiIntegrationType)
  aiIntegrationType?: AiIntegrationType;

  @ApiProperty({
    description: 'AI API token',
    example: 'sk-or-v1-abc123...',
    required: false,
  })
  @IsOptional()
  @IsString()
  aiToken?: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name. If provided and not empty, isAnonymous will be set to false automatically',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Whether the user is anonymous. If not provided, will be set automatically based on name field',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: 'AI integration type',
    enum: AiIntegrationType,
    example: 'openrouter',
    required: false,
  })
  @IsOptional()
  @IsEnum(AiIntegrationType)
  aiIntegrationType?: AiIntegrationType;

  @ApiProperty({
    description: 'AI API token',
    example: 'sk-or-v1-abc123...',
    required: false,
  })
  @IsOptional()
  @IsString()
  aiToken?: string;
}
