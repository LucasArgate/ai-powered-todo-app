import React from 'react';
import { Task, TaskList as TaskListType } from '@/types';
import TaskItem from '@/components/molecules/TaskItem/TaskItem';
import TaskForm from '@/components/molecules/TaskForm/TaskForm';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';

export interface TaskListProps {
  taskList: TaskListType;
  tasks: Task[];
  isLoading?: boolean;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string, newTitle: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  taskList,
  tasks,
  isLoading = false,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
}) => {
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  const handleStartEdit = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleEditTask = (taskId: string, newTitle: string) => {
    onEditTask?.(taskId, newTitle);
    setEditingTaskId(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {/* Task Form */}
      <TaskForm
        onSubmit={onAddTask}
        isLoading={isLoading}
        placeholder={`Add a task to "${taskList.name}"...`}
      />

      {/* Tasks List */}
      <div className="space-y-2">
        {isLoading && tasks.length === 0 ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask ? handleEditTask : undefined}
              isEditing={editingTaskId === task.id}
              onStartEdit={() => handleStartEdit(task.id)}
              onCancelEdit={handleCancelEdit}
            />
          ))
        )}
      </div>

      {/* Task Stats */}
      {tasks.length > 0 && (
        <div className="text-sm text-secondary-500 text-center pt-4 border-t border-secondary-200">
          {tasks.filter(task => task.isCompleted).length} of {tasks.length} tasks completed
        </div>
      )}
    </div>
  );
};

export default TaskList;
