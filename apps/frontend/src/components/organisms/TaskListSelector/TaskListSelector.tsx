import React, { useState } from 'react';
import { TaskList as TaskListType } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { Plus } from 'lucide-react';

export interface TaskListSelectorProps {
  taskLists: TaskListType[];
  currentTaskListId?: string;
  isLoading?: boolean;
  onSelectTaskList: (taskList: TaskListType) => void;
  onCreateNewList: () => void;
  onDeleteTaskList?: (taskListId: string) => void;
  onAddTask?: (taskListId: string, title: string) => void;
}

const TaskListSelector: React.FC<TaskListSelectorProps> = ({
  taskLists,
  currentTaskListId,
  isLoading = false,
  onSelectTaskList,
  onCreateNewList,
  onDeleteTaskList,
  onAddTask,
}) => {
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const handleTaskInputChange = (taskListId: string, value: string) => {
    setNewTaskInputs(prev => ({
      ...prev,
      [taskListId]: value
    }));
  };

  const handleAddTask = async (taskListId: string) => {
    const taskTitle = newTaskInputs[taskListId]?.trim();
    if (taskTitle && onAddTask) {
      await onAddTask(taskListId, taskTitle);
      setNewTaskInputs(prev => ({
        ...prev,
        [taskListId]: ''
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskListId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask(taskListId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">Suas Listas de Tarefas</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateNewList}
        >
          Nova Lista
        </Button>
      </div>

      {taskLists.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-secondary-500 mb-4">Ainda não há listas de tarefas.</p>
          <Button
            variant="primary"
            onClick={onCreateNewList}
          >
            Criar Sua Primeira Lista
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {taskLists.map((taskList) => (
            <Card
              key={taskList.id}
              className={`transition-all hover:shadow-md ${
                currentTaskListId === taskList.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:bg-secondary-50'
              }`}
            >
              <div className="space-y-3">
                {/* Header with title and delete button */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-secondary-900 mb-1">
                      {taskList.name}
                    </h3>
                    {taskList.description && (
                      <p className="text-sm text-secondary-600 mb-2">
                        {taskList.description}
                      </p>
                    )}
                    {taskList.iaPrompt && (
                      <div className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                        Gerado por IA
                      </div>
                    )}
                    <p className="text-xs text-secondary-500 mt-2">
                      Criado em {new Date(taskList.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {onDeleteTaskList && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTaskList(taskList.id);
                      }}
                      className="ml-2"
                    >
                      Excluir
                    </Button>
                  )}
                </div>

                {/* Add task input */}
                {onAddTask && (
                  <div className="flex gap-2 pt-2 border-t border-secondary-200">
                    <input
                      type="text"
                      value={newTaskInputs[taskList.id] || ''}
                      onChange={(e) => handleTaskInputChange(taskList.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, taskList.id)}
                      placeholder="Adicionar tarefa..."
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAddTask(taskList.id)}
                      disabled={!newTaskInputs[taskList.id]?.trim()}
                      className="px-3"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskListSelector;
