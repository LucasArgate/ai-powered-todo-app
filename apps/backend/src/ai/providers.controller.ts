import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe,
  ParseBoolPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { ProviderService } from './services/provider.service';
import { 
  CreateProviderDto, 
  UpdateProviderDto, 
  ProviderResponseDto, 
  ProviderListResponseDto 
} from './dto/provider.dto';
import { BaseController } from '../common/base.controller';

@ApiTags('providers')
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController extends BaseController {
  constructor(private readonly providerService: ProviderService) {
    super();
  }

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo provedor de IA',
    description: 'Cria um novo provedor de IA no sistema'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Provedor criado com sucesso',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 409, description: 'Provedor com este nome já existe' })
  async createProvider(@Body() createProviderDto: CreateProviderDto): Promise<ProviderResponseDto> {
    return await this.providerService.createProvider(createProviderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar provedores de IA',
    description: 'Retorna uma lista paginada de provedores de IA'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página (padrão: 10)' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Mostrar apenas provedores ativos (padrão: false)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de provedores retornada com sucesso',
    type: ProviderListResponseDto
  })
  async getAllProviders(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly: boolean = false
  ): Promise<ProviderListResponseDto> {
    return await this.providerService.getAllProviders(page, limit, activeOnly);
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Listar provedores ativos',
    description: 'Retorna apenas os provedores de IA que estão ativos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de provedores ativos retornada com sucesso',
    type: [ProviderResponseDto]
  })
  async getActiveProviders(): Promise<ProviderResponseDto[]> {
    return await this.providerService.getActiveProvidersFromDb();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter provedor por ID',
    description: 'Retorna um provedor específico pelo seu ID'
  })
  @ApiParam({ name: 'id', description: 'ID único do provedor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provedor encontrado com sucesso',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado' })
  async getProviderById(@Param('id') id: string): Promise<ProviderResponseDto> {
    return await this.providerService.getProviderById(id);
  }

  @Get('name/:name')
  @ApiOperation({ 
    summary: 'Obter provedor por nome',
    description: 'Retorna um provedor específico pelo seu nome'
  })
  @ApiParam({ name: 'name', description: 'Nome único do provedor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provedor encontrado com sucesso',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado' })
  async getProviderByName(@Param('name') name: string): Promise<ProviderResponseDto> {
    return await this.providerService.getProviderByName(name);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar provedor',
    description: 'Atualiza os dados de um provedor existente'
  })
  @ApiParam({ name: 'id', description: 'ID único do provedor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provedor atualizado com sucesso',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado' })
  async updateProvider(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto
  ): Promise<ProviderResponseDto> {
    return await this.providerService.updateProvider(id, updateProviderDto);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ 
    summary: 'Alternar status do provedor',
    description: 'Ativa ou desativa um provedor'
  })
  @ApiParam({ name: 'id', description: 'ID único do provedor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do provedor alterado com sucesso',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado' })
  async toggleProviderStatus(@Param('id') id: string): Promise<ProviderResponseDto> {
    return await this.providerService.toggleProviderStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deletar provedor',
    description: 'Remove um provedor do sistema'
  })
  @ApiParam({ name: 'id', description: 'ID único do provedor' })
  @ApiResponse({ status: 204, description: 'Provedor deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado' })
  async deleteProvider(@Param('id') id: string): Promise<void> {
    return await this.providerService.deleteProvider(id);
  }
}
