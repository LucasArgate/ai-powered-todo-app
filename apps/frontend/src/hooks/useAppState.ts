import { useState, useEffect, useCallback } from 'react';
import { User, TaskList, Task, AppState } from '@/types';
import { apiClient } from '@/lib/api';
import { useAuth } from './useAuth';

export const useAppState = () => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [state, setState] = useState<AppState>({
    user: null,
    taskLists: [],
    currentTaskList: null,
    isLoading: false,
    error: null,
  });

  // Update state when auth user changes - ensure immediate sync
  useEffect(() => {
    if (user !== state.user) {
      setState(prev => ({ ...prev, user }));
    }
  }, [user, state.user]);

  // Load task lists
  const loadTaskLists = useCallback(async () => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const taskLists = await apiClient.getTaskLists();
      setState(prev => ({ ...prev, taskLists, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao carregar listas de tarefas', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Load specific task list with tasks
  const loadTaskList = useCallback(async (taskListId: string) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const taskList = await apiClient.getTaskList(taskListId);
      setState(prev => ({ 
        ...prev, 
        currentTaskList: taskList, 
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao carregar lista de tarefas', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Update user - now handled by useAuth hook
  const updateUser = useCallback(async (userData: { 
    name?: string; 
    aiIntegrationType?: 'huggingface' | 'openrouter'; 
    aiToken?: string; 
  }) => {
    // This is now handled by the useAuth hook
    // The user state will be updated automatically through the auth hook
    console.warn('updateUser está depreciado. Use o hook useAuth diretamente.');
  }, []);

  // Create task list
  const createTaskList = useCallback(async (name: string, description?: string) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newTaskList = await apiClient.createTaskList({ name, description });
      setState(prev => ({ 
        ...prev, 
        taskLists: [...prev.taskLists, newTaskList],
        currentTaskList: newTaskList,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao criar lista de tarefas', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Generate task list from AI
  const generateFromAI = useCallback(async (listName: string, prompt: string) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newTaskList = await apiClient.generateFromAI({ listName, prompt });
      setState(prev => ({ 
        ...prev, 
        taskLists: [...prev.taskLists, newTaskList],
        currentTaskList: newTaskList,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao gerar tarefas da IA', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Update task list
  const updateTaskList = useCallback(async (taskListId: string, name: string, description?: string) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedTaskList = await apiClient.updateTaskList(taskListId, { name, description });
      setState(prev => ({ 
        ...prev, 
        taskLists: prev.taskLists.map(tl => 
          tl.id === taskListId ? updatedTaskList : tl
        ),
        currentTaskList: prev.currentTaskList?.id === taskListId ? updatedTaskList : prev.currentTaskList,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao atualizar lista de tarefas', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Delete task list
  const deleteTaskList = useCallback(async (taskListId: string) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await apiClient.deleteTaskList(taskListId);
      setState(prev => ({ 
        ...prev, 
        taskLists: prev.taskLists.filter(tl => tl.id !== taskListId),
        currentTaskList: prev.currentTaskList?.id === taskListId ? null : prev.currentTaskList,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao excluir lista de tarefas', 
        isLoading: false 
      }));
    }
  }, [state.user]);

  // Add task
  const addTask = useCallback(async (title: string) => {
    if (!state.user || !state.currentTaskList) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const position = state.currentTaskList.tasks?.length || 0;
      const newTask = await apiClient.createTask(state.currentTaskList.id, { title, position });
      
      setState(prev => ({
        ...prev,
        currentTaskList: prev.currentTaskList ? {
          ...prev.currentTaskList,
          tasks: [...(prev.currentTaskList.tasks || []), newTask]
        } : null,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao adicionar tarefa', 
        isLoading: false 
      }));
    }
  }, [state.user, state.currentTaskList]);

  // Toggle task completion
  const toggleTask = useCallback(async (taskId: string, isCompleted: boolean) => {
    if (!state.user || !state.currentTaskList) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedTask = await apiClient.updateTask(state.currentTaskList.id, taskId, { isCompleted });
      
      setState(prev => ({
        ...prev,
        currentTaskList: prev.currentTaskList ? {
          ...prev.currentTaskList,
          tasks: prev.currentTaskList.tasks?.map(task => 
            task.id === taskId ? updatedTask : task
          ) || []
        } : null,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao atualizar tarefa', 
        isLoading: false 
      }));
    }
  }, [state.user, state.currentTaskList]);

  // Edit task
  const editTask = useCallback(async (taskId: string, newTitle: string) => {
    if (!state.user || !state.currentTaskList) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedTask = await apiClient.updateTask(state.currentTaskList.id, taskId, { title: newTitle });
      
      setState(prev => ({
        ...prev,
        currentTaskList: prev.currentTaskList ? {
          ...prev.currentTaskList,
          tasks: prev.currentTaskList.tasks?.map(task => 
            task.id === taskId ? updatedTask : task
          ) || []
        } : null,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao editar tarefa', 
        isLoading: false 
      }));
    }
  }, [state.user, state.currentTaskList]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    if (!state.user || !state.currentTaskList) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await apiClient.deleteTask(state.currentTaskList.id, taskId);
      
      setState(prev => ({
        ...prev,
        currentTaskList: prev.currentTaskList ? {
          ...prev.currentTaskList,
          tasks: prev.currentTaskList.tasks?.filter(task => task.id !== taskId) || []
        } : null,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Falha ao excluir tarefa', 
        isLoading: false 
      }));
    }
  }, [state.user, state.currentTaskList]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    user, // Always use the latest user from useAuth
    isLoading: state.isLoading || authLoading,
    error: state.error || authError,
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
  };
};
