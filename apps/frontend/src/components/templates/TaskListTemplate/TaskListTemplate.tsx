import React from 'react';
import { TaskList as TaskListType, Task, User } from '@/types';
import MainLayout from '@/components/templates/MainLayout/MainLayout';
import TaskListHeader from '@/components/molecules/TaskListHeader/TaskListHeader';
import TaskList from '@/components/organisms/TaskList/TaskList';
import AIForm from '@/components/molecules/AIForm/AIForm';

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
  onConfigureAI?: () => void;
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
  onConfigureAI,
}) => {
  if (!taskList) {
    return (
      <MainLayout user={user} onConfigureAI={onConfigureAI}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
            No Task List Selected
          </h2>
          <p className="text-secondary-600">
            Please select a task list from the sidebar or create a new one.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} onConfigureAI={onConfigureAI}>
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
            onConfigureAI={onConfigureAI}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default TaskListTemplate;
