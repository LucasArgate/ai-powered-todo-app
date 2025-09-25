import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTaskListDto {
  @ApiProperty({ description: 'Nome da lista de tarefas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição da lista de tarefas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Prompt original usado para gerar a lista (se criada por IA)' })
  @IsString()
  @IsOptional()
  iaPrompt?: string;
}

export class UpdateTaskListDto {
  @ApiPropertyOptional({ description: 'Nome da lista de tarefas' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição da lista de tarefas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Prompt original usado para gerar a lista' })
  @IsString()
  @IsOptional()
  iaPrompt?: string;
}

export class TaskResponseDto {
  @ApiProperty({ description: 'ID da tarefa' })
  id: string;

  @ApiProperty({ description: 'Título da tarefa' })
  title: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa' })
  description?: string;

  @ApiProperty({ description: 'Status de conclusão' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Posição na lista' })
  position: number;

  @ApiProperty({ description: 'Prioridade da tarefa', enum: ['low', 'medium', 'high'] })
  priority: string;

  @ApiPropertyOptional({ description: 'Categoria da tarefa' })
  category?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class TaskListResponseDto {
  @ApiProperty({ description: 'ID da lista' })
  id: string;

  @ApiProperty({ description: 'Nome da lista' })
  name: string;

  @ApiPropertyOptional({ description: 'Descrição da lista' })
  description?: string;

  @ApiPropertyOptional({ description: 'Prompt original da IA' })
  iaPrompt?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @ApiProperty({ description: 'Número total de tarefas' })
  tasksCount: number;

  @ApiProperty({ description: 'Número de tarefas concluídas' })
  completedTasksCount: number;

  @ApiProperty({ description: 'Lista de tarefas', type: [TaskResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskResponseDto)
  tasks: TaskResponseDto[];
}
