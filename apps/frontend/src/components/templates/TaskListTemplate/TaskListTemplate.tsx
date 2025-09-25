import React from 'react';
import { TaskList as TaskListType, Task, User } from '@/types';
import MainLayout from '@/components/templates/MainLayout/MainLayout';
import TaskListHeader from '@/components/molecules/TaskListHeader/TaskListHeader';
import TaskList from '@/components/organisms/TaskList/TaskList';
import AIForm from '@/components/molecules/AIForm/AIForm';
import Image from 'next/image';
import { firstTaskImage } from '@/assets';

export interface TaskListTemplateProps {
  user: User | null;
  taskList: TaskListType | null;
  tasks: Task[];
  isLoading?: boolean;
  isEditingHeader?: boolean;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string, newTitle: string) => void;
  onEditTaskList?: (taskList: TaskListType) => void;
  onSaveTaskListEdit?: (name: string, description?: string) => void;
  onCancelTaskListEdit?: () => void;
  onDeleteTaskList?: (taskListId: string) => void;
  onGenerateFromAI: (listName: string, prompt: string) => void;
}

const TaskListTemplate: React.FC<TaskListTemplateProps> = ({
  user,
  taskList,
  tasks,
  isLoading = false,
  isEditingHeader = false,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onEditTaskList,
  onSaveTaskListEdit,
  onCancelTaskListEdit,
  onDeleteTaskList,
  onGenerateFromAI,
}) => {
  if (!taskList) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-96 h-72 opacity-30">
              <Image
                src={firstTaskImage}
                alt="Selecione uma lista de tarefas"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary-900">
                Nenhuma Lista de Tarefas Selecionada
              </h2>
              <p className="text-secondary-600">
                Selecione uma lista de tarefas da barra lateral ou crie uma nova.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Task List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
            <TaskListHeader
              taskList={taskList}
              onEdit={onEditTaskList}
              onDelete={onDeleteTaskList}
              isEditing={isEditingHeader}
              onSaveEdit={onSaveTaskListEdit}
              onCancelEdit={onCancelTaskListEdit}
            />
            
            <div className="p-6">
              <TaskList
                taskList={taskList}
                tasks={tasks}
                isLoading={isLoading}
                onAddTask={onAddTask}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            </div>
          </div>
        </div>

        {/* AI Generation Sidebar */}
        <div className="lg:col-span-1">
          <AIForm
            onSubmit={onGenerateFromAI}
            isLoading={isLoading}
            aiIntegrationType={user?.aiIntegrationType}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default TaskListTemplate;
