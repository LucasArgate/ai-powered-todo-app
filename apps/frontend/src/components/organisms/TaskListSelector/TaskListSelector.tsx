import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaskList as TaskListType } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { Plus, Trash2 } from 'lucide-react';

export interface TaskListSelectorProps {
  taskLists: TaskListType[];
  currentTaskListId?: string;
  isLoading?: boolean;
  onSelectTaskList: (taskList: TaskListType) => void;
  onCreateNewList: () => void;
  onDeleteTaskList?: (taskListId: string) => void;
  onAddTask?: (taskListId: string, title: string) => void;
  onToggleTask?: (taskListId: string, taskId: string, isCompleted: boolean) => void;
  onEditTask?: (taskListId: string, taskId: string, newTitle: string) => void;
  onDeleteTask?: (taskListId: string, taskId: string) => void;
}

const TaskListSelector: React.FC<TaskListSelectorProps> = ({
  taskLists,
  currentTaskListId,
  isLoading = false,
  onSelectTaskList,
  onCreateNewList,
  onDeleteTaskList,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [shouldScrollToTask, setShouldScrollToTask] = useState<string | null>(null);
  
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to last added task when shouldScrollToTask changes
  useEffect(() => {
    if (shouldScrollToTask && taskRefs.current[shouldScrollToTask]) {
      setTimeout(() => {
        taskRefs.current[shouldScrollToTask]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        setShouldScrollToTask(null);
      }, 100);
    }
  }, [shouldScrollToTask]);

  // Callback to set ref for the last task of each task list
  const setLastTaskRef = useCallback((taskListId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      taskRefs.current[taskListId] = el;
    }
  }, []);

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
      
      // Trigger scroll to the last task of this task list
      setShouldScrollToTask(taskListId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskListId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask(taskListId);
    }
  };

  const handleToggleTask = async (taskListId: string, taskId: string, isCompleted: boolean) => {
    if (onToggleTask) {
      setLoadingTasks(prev => ({ ...prev, [taskId]: true }));
      try {
        await onToggleTask(taskListId, taskId, !isCompleted);
      } finally {
        setLoadingTasks(prev => ({ ...prev, [taskId]: false }));
      }
    }
  };

  const handleStartEdit = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTaskTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleSaveEdit = async (taskListId: string, taskId: string) => {
    setLoadingTasks(prev => ({ ...prev, [taskId]: true }));
    try {
      if (editingTaskTitle.trim()) {
        // Update task if title is not empty
        if (onEditTask) {
          await onEditTask(taskListId, taskId, editingTaskTitle.trim());
        }
      } else {
        // Delete task if title is empty
        if (onDeleteTask) {
          await onDeleteTask(taskListId, taskId);
        }
      }
      setEditingTaskId(null);
      setEditingTaskTitle('');
    } finally {
      setLoadingTasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, taskListId: string, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(taskListId, taskId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeleteTask = async (taskListId: string, taskId: string) => {
    if (onDeleteTask && confirm('Tem certeza de que deseja excluir esta tarefa?')) {
      setLoadingTasks(prev => ({ ...prev, [taskId]: true }));
      try {
        await onDeleteTask(taskListId, taskId);
      } finally {
        setLoadingTasks(prev => ({ ...prev, [taskId]: false }));
      }
    }
  };

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

                {/* Tasks list */}
                {taskList.tasks && taskList.tasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-secondary-200">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">
                      Tarefas ({taskList.tasks.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {taskList.tasks.map((task, index) => (
                        <div
                          key={task.id}
                          ref={index === (taskList.tasks?.length || 0) - 1 ? setLastTaskRef(taskList.id) : null}
                          className="flex items-center gap-2 p-2 bg-secondary-50 rounded text-sm hover:bg-secondary-100 transition-colors"
                        >
                          {/* Toggle button */}
                          <button
                            onClick={() => handleToggleTask(taskList.id, task.id, task.isCompleted)}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.isCompleted 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-secondary-400 hover:border-green-500'
                            }`}
                          >
                            {task.isCompleted && (
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          
                          {/* Task content */}
                          {editingTaskId === task.id ? (
                            <input
                              type="text"
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(e, taskList.id, task.id)}
                              onBlur={() => handleSaveEdit(taskList.id, task.id)}
                              className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={`flex-1 cursor-pointer ${
                                task.isCompleted ? 'line-through text-secondary-500' : 'text-secondary-700'
                              }`}
                              onClick={() => handleStartEdit(task.id, task.title)}
                            >
                              {task.title}
                            </span>
                          )}
                          
                          {/* Delete button */}
                          {onDeleteTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(taskList.id, task.id);
                              }}
                              disabled={loadingTasks[task.id]}
                              className="p-1 text-secondary-400 hover:text-red-500 transition-colors disabled:opacity-50"
                              title="Excluir tarefa"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add task input */}
                {onAddTask && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddTask(taskList.id);
                    }}
                    className="flex gap-2 pt-2 border-t border-secondary-200"
                  >
                    <input
                      type="text"
                      value={newTaskInputs[taskList.id] || ''}
                      onChange={(e) => handleTaskInputChange(taskList.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, taskList.id)}
                      placeholder="Adicionar tarefa..."
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={!newTaskInputs[taskList.id]?.trim()}
                      className="px-3"
                    >
                      <Plus size={16} />
                    </Button>
                  </form>
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
