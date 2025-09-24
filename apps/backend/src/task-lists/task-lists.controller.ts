import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TaskListsService } from './task-lists.service';
import { CreateTaskListDto, UpdateTaskListDto, TaskListResponseDto } from './dto/task-list.dto';

@ApiTags('task-lists')
@ApiBearerAuth()
@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  private extractUserIdFromAuthHeader(request: any): string {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header. Expected Bearer token.');
    }
    return authorization.substring(7); // Remove 'Bearer ' prefix
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova lista de tarefas' })
  @ApiResponse({ status: 201, description: 'Lista de tarefas criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  create(@Body() createTaskListDto: CreateTaskListDto, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.taskListsService.create({
      ...createTaskListDto,
      userId
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as listas de tarefas do usuário com suas tasks' })
  @ApiResponse({ status: 200, description: 'Lista de listas de tarefas com tasks retornada com sucesso', type: [TaskListResponseDto] })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  findAll(@Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.taskListsService.findByUserIdWithTasksAndCounts(userId);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar lista de tarefas' })
  @ApiParam({ name: 'id', description: 'ID da lista de tarefas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  @ApiResponse({ status: 404, description: 'Lista de tarefas não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateTaskListDto: UpdateTaskListDto, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.taskListsService.update(id, updateTaskListDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar lista de tarefas' })
  @ApiParam({ name: 'id', description: 'ID da lista de tarefas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  @ApiResponse({ status: 404, description: 'Lista de tarefas não encontrada' })
  remove(@Param('id') id: string, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.taskListsService.remove(id, userId);
  }

}
