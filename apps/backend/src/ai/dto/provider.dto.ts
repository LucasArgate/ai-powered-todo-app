import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Nome único do provedor de IA',
    example: 'huggingface',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição do provedor de IA',
    example: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Se o provedor oferece modelos gratuitos',
    example: true,
  })
  @IsBoolean()
  free: boolean;

  @ApiProperty({
    description: 'Lista de modelos disponíveis (JSON array)',
    example: '["microsoft/DialoGPT-medium", "microsoft/DialoGPT-large"]',
  })
  @IsString()
  @IsNotEmpty()
  models: string;

  @ApiPropertyOptional({
    description: 'URL para obter token de API',
    example: 'https://huggingface.co/settings/tokens',
  })
  @IsOptional()
  @IsUrl()
  tokenUrl?: string;

  @ApiPropertyOptional({
    description: 'URL da documentação do provedor',
    example: 'https://huggingface.co/docs/api-inference',
  })
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({
    description: 'Se o provedor está ativo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProviderDto {
  @ApiPropertyOptional({
    description: 'Descrição do provedor de IA',
    example: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Se o provedor oferece modelos gratuitos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  free?: boolean;

  @ApiPropertyOptional({
    description: 'Lista de modelos disponíveis (JSON array)',
    example: '["microsoft/DialoGPT-medium", "microsoft/DialoGPT-large"]',
  })
  @IsOptional()
  @IsString()
  models?: string;

  @ApiPropertyOptional({
    description: 'URL para obter token de API',
    example: 'https://huggingface.co/settings/tokens',
  })
  @IsOptional()
  @IsUrl()
  tokenUrl?: string;

  @ApiPropertyOptional({
    description: 'URL da documentação do provedor',
    example: 'https://huggingface.co/docs/api-inference',
  })
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({
    description: 'Se o provedor está ativo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProviderResponseDto {
  @ApiProperty({
    description: 'ID único do provedor',
    example: 'prov_123',
  })
  id: string;

  @ApiProperty({
    description: 'Nome único do provedor de IA',
    example: 'huggingface',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do provedor de IA',
    example: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
  })
  description: string;

  @ApiProperty({
    description: 'Se o provedor oferece modelos gratuitos',
    example: true,
  })
  free: boolean;

  @ApiProperty({
    description: 'Lista de modelos disponíveis',
    example: ['microsoft/DialoGPT-medium', 'microsoft/DialoGPT-large'],
  })
  models: string[];

  @ApiPropertyOptional({
    description: 'URL para obter token de API',
    example: 'https://huggingface.co/settings/tokens',
  })
  tokenUrl?: string;

  @ApiPropertyOptional({
    description: 'URL da documentação do provedor',
    example: 'https://huggingface.co/docs/api-inference',
  })
  documentationUrl?: string;

  @ApiProperty({
    description: 'Se o provedor está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class ProviderListResponseDto {
  @ApiProperty({
    description: 'Lista de provedores',
    type: [ProviderResponseDto],
  })
  providers: ProviderResponseDto[];

  @ApiProperty({
    description: 'Total de provedores',
    example: 3,
  })
  total: number;
}
