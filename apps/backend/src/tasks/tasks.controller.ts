import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiQuery({ name: 'listId', required: false, description: 'Filtrar por lista de tarefas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
  findAll(@Query('listId') listId?: string) {
    if (listId) {
      return this.tasksService.findByListId(listId);
    }
    return this.tasksService.findAll();
  }

  @Get('completed')
  @ApiOperation({ summary: 'Listar tarefas concluídas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas concluídas' })
  findCompleted() {
    return this.tasksService.findCompleted();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Listar tarefas pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas pendentes' })
  findPending() {
    return this.tasksService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Alternar status de conclusão da tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  toggleComplete(@Param('id') id: string) {
    return this.tasksService.toggleComplete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
