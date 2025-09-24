'use client';

import { useEffect, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import MainLayout from '@/components/templates/MainLayout/MainLayout';
import TaskListSelector from '@/components/organisms/TaskListSelector/TaskListSelector';
import TaskListTemplate from '@/components/templates/TaskListTemplate/TaskListTemplate';
import AISettings from '@/components/organisms/AISettings/AISettings';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';

export default function HomePage() {
  const {
    user,
    taskLists,
    currentTaskList,
    isLoading,
    error,
    initializeUser,
    loadTaskLists,
    loadTaskList,
    updateUser,
    createTaskList,
    generateFromAI,
    updateTaskList,
    deleteTaskList,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
    clearError,
  } = useAppState();

  const [showAISettings, setShowAISettings] = useState(false);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Load task lists when user is available
  useEffect(() => {
    if (user) {
      loadTaskLists();
    }
  }, [user, loadTaskLists]);

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

  const handleUpdateUser = async (userData: any) => {
    await updateUser(userData);
    setShowAISettings(false);
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
    if (confirm('Are you sure you want to delete this task list? This action cannot be undone.')) {
      await deleteTaskList(taskListId);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <MainLayout user={user} onConfigureAI={() => setShowAISettings(true)}>
        <Card className="max-w-md mx-auto text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Error</h3>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button onClick={clearError}>Try Again</Button>
        </Card>
      </MainLayout>
    );
  }

  if (showAISettings) {
    return (
      <MainLayout user={user} onConfigureAI={() => setShowAISettings(false)}>
        <div className="max-w-2xl mx-auto">
          <AISettings
            user={user!}
            onUpdateUser={handleUpdateUser}
            isLoading={isLoading}
          />
        </div>
      </MainLayout>
    );
  }

  if (showCreateListForm) {
    return (
      <MainLayout user={user} onConfigureAI={() => setShowAISettings(true)}>
        <div className="max-w-md mx-auto">
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              Create New Task List
            </h2>
            <form onSubmit={handleSubmitCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="input-field"
                  placeholder="Enter list name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="input-field"
                  placeholder="Enter description"
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
                  Create List
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateListForm(false)}
                >
                  Cancel
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
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onEditTask={editTask}
        onEditTaskList={handleEditTaskList}
        onSaveTaskListEdit={handleSaveTaskListEdit}
        onCancelTaskListEdit={handleCancelTaskListEdit}
        onDeleteTaskList={handleDeleteTaskList}
        onGenerateFromAI={handleGenerateFromAI}
        onConfigureAI={() => setShowAISettings(true)}
      />
    );
  }

  return (
    <MainLayout user={user} onConfigureAI={() => setShowAISettings(true)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskListSelector
            taskLists={taskLists}
            isLoading={isLoading}
            onSelectTaskList={handleSelectTaskList}
            onCreateNewList={handleCreateNewList}
            onDeleteTaskList={handleDeleteTaskList}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="text-center py-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Welcome to Smart Todo List
            </h3>
            <p className="text-secondary-600 mb-6">
              Create task lists manually or let AI generate them for you based on your goals.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleCreateNewList}
                className="w-full"
              >
                Create Manual List
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAISettings(true)}
                className="w-full"
              >
                Configure AI Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
