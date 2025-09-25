import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'ID da lista de tarefas' })
  @IsString()
  @IsNotEmpty()
  listId: string;

  @ApiProperty({ description: 'Título da tarefa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição da tarefa', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Posição da tarefa na lista', required: false })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiProperty({ description: 'Status de conclusão da tarefa', required: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ description: 'Prioridade da tarefa', enum: ['low', 'medium', 'high'], required: false })
  @IsString()
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Categoria da tarefa', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ description: 'Título da tarefa', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Descrição da tarefa', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Status de conclusão da tarefa', required: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ description: 'Posição da tarefa na lista', required: false })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiProperty({ description: 'Prioridade da tarefa', enum: ['low', 'medium', 'high'], required: false })
  @IsString()
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Categoria da tarefa', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}
