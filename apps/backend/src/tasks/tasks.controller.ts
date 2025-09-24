import { Controller, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private extractUserIdFromAuthHeader(request: any): string {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header. Expected Bearer token.');
    }
    return authorization.substring(7); // Remove 'Bearer ' prefix
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  create(@Body() createTaskDto: CreateTaskDto, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.tasksService.create(createTaskDto, userId);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Alternar status de conclusão da tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  toggleComplete(@Param('id') id: string, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.tasksService.toggleComplete(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de autorização inválido ou ausente' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  remove(@Param('id') id: string, @Req() request: any) {
    const userId = this.extractUserIdFromAuthHeader(request);
    return this.tasksService.remove(id, userId);
  }
}
