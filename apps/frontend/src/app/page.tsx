'use client';

import { useEffect, useState } from 'react';
import { useReduxAuth } from '@/hooks/useReduxAuth';
import { useReduxTaskList } from '@/hooks/useReduxTaskList';
import MainLayout from '@/components/templates/MainLayout/MainLayout';
import TaskListSelector from '@/components/organisms/TaskListSelector/TaskListSelector';
import TaskListTemplate from '@/components/templates/TaskListTemplate/TaskListTemplate';
import WelcomeCard, { TaskPreview } from '@/components/organisms/WelcomeCard/WelcomeCard';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const {
    user,
    isLoading: authLoading,
    error: authError,
    updateUser,
  } = useReduxAuth();
  
  const {
    taskLists,
    currentTaskList,
    isLoading: taskListLoading,
    error: taskListError,
    loadTaskList,
    createTaskList,
    generateFromAI,
    updateTaskList,
    deleteTaskList,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    clearError,
  } = useReduxTaskList();

  const isLoading = authLoading || taskListLoading;
  const error = authError || taskListError;

  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Task lists are loaded automatically by useReduxTaskList when user is available

  const handleSelectTaskList = (taskList: any) => {
    loadTaskList(taskList.id);
  };

  const handleCreateNewList = () => {
    setShowCreateListForm(true);
  };

  const handleSubmitCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      await createTaskList(newListName.trim(), newListDescription.trim() || undefined);
      setNewListName('');
      setNewListDescription('');
      setShowCreateListForm(false);
    }
  };

  const handleGenerateFromAI = async (listName: string, prompt: string) => {
    await generateFromAI(listName, prompt);
  };

  const handleGenerateWithAI = async (prompt: string) => {
    if (prompt.trim()) {
      await generateFromAI('Lista Gerada por IA', prompt.trim());
    }
  };

  const handleGeneratePreview = async (prompt: string): Promise<TaskPreview[]> => {
    if (!user) throw new Error('Usuário não encontrado');
    
    const tasks = await apiClient.generateTasksPreview({ 
      listName: 'Preview', 
      prompt: prompt.trim() 
    });
    
    // Convert API response to TaskPreview format
    return tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      category: task.category
    }));
  };


  const handleEditTaskList = (taskList: any) => {
    setIsEditingHeader(true);
  };

  const handleSaveTaskListEdit = async (name: string, description?: string) => {
    if (currentTaskList) {
      await updateTaskList(currentTaskList.id, name, description);
      setIsEditingHeader(false);
    }
  };

  const handleCancelTaskListEdit = () => {
    setIsEditingHeader(false);
  };

  const handleDeleteTaskList = async (taskListId: string) => {
    if (confirm('Tem certeza de que deseja excluir esta lista de tarefas? Esta ação não pode ser desfeita.')) {
      await deleteTaskList(taskListId);
    }
  };

  // Wrapper functions to include taskListId automatically
  const handleAddTaskWrapper = async (title: string) => {
    if (currentTaskList) {
      await addTask(currentTaskList.id, title);
    }
  };

  const handleToggleTaskWrapper = async (taskId: string, isCompleted: boolean) => {
    if (currentTaskList) {
      await toggleTask(currentTaskList.id, taskId, isCompleted);
    }
  };

  const handleDeleteTaskWrapper = async (taskId: string) => {
    if (currentTaskList) {
      await deleteTask(currentTaskList.id, taskId);
    }
  };

  const handleEditTaskWrapper = async (taskId: string, newTitle: string) => {
    if (currentTaskList) {
      await editTask(currentTaskList.id, taskId, newTitle);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Inicializando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <MainLayout user={user}>
        <Card className="max-w-md mx-auto text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Erro</h3>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button onClick={clearError}>Tentar Novamente</Button>
        </Card>
      </MainLayout>
    );
  }

  if (showCreateListForm) {
    return (
      <MainLayout user={user}>
        <div className="max-w-md mx-auto">
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              Criar Nova Lista de Tarefas
            </h2>
            <form onSubmit={handleSubmitCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nome da Lista
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="input-field"
                  placeholder="Digite o nome da lista"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="input-field"
                  placeholder="Digite uma descrição"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={!newListName.trim()}
                >
                  Criar Lista
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateListForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (currentTaskList) {
    return (
      <TaskListTemplate
        user={user}
        taskList={currentTaskList}
        tasks={currentTaskList.tasks || []}
        isLoading={isLoading}
        isEditingHeader={isEditingHeader}
        onAddTask={handleAddTaskWrapper}
        onToggleTask={handleToggleTaskWrapper}
        onDeleteTask={handleDeleteTaskWrapper}
        onEditTask={handleEditTaskWrapper}
        onEditTaskList={handleEditTaskList}
        onSaveTaskListEdit={handleSaveTaskListEdit}
        onCancelTaskListEdit={handleCancelTaskListEdit}
        onDeleteTaskList={handleDeleteTaskList}
        onGenerateFromAI={handleGenerateFromAI}
      />
    );
  }

  return (
    <MainLayout user={user}>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <TaskListSelector
            taskLists={taskLists}
            isLoading={isLoading}
            onSelectTaskList={handleSelectTaskList}
            onCreateNewList={handleCreateNewList}
            onDeleteTaskList={handleDeleteTaskList}
            onAddTask={async (taskListId: string, title: string) => {
              await addTask(taskListId, title);
            }}
          />
        </div>
        
        <div className="lg:col-span-3">
          <WelcomeCard
            user={user}
            isLoading={isLoading}
            onCreateManualList={handleCreateNewList}
            onGenerateWithAI={handleGenerateWithAI}
            onGeneratePreview={handleGeneratePreview}
          />
        </div>
      </div>
    </MainLayout>
  );
}
