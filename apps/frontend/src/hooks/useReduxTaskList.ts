import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadTaskLists,
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
  setCurrentTaskList,
} from '@/store/taskListSlice';

export const useReduxTaskList = () => {
  const dispatch = useAppDispatch();
  const { taskLists, currentTaskList, isLoading, error } = useAppSelector((state) => state.taskList);
  const { user } = useAppSelector((state) => state.auth);

  // Load task lists when user is available
  useEffect(() => {
    if (user && taskLists.length === 0) {
      dispatch(loadTaskLists());
    }
  }, [dispatch, user]);

  const handleLoadTaskList = (taskListId: string) => {
    dispatch(loadTaskList(taskListId));
  };

  const handleCreateTaskList = async (name: string, description?: string) => {
    return dispatch(createTaskList({ name, description }));
  };

  const handleGenerateFromAI = async (listName: string, prompt: string, description?: string) => {
    return dispatch(generateFromAI({ listName, prompt, description }));
  };

  const handleUpdateTaskList = async (taskListId: string, name: string, description?: string) => {
    return dispatch(updateTaskList({ taskListId, name, description }));
  };

  const handleDeleteTaskList = async (taskListId: string) => {
    return dispatch(deleteTaskList(taskListId));
  };

  const handleAddTask = async (taskListId: string, title: string) => {
    return dispatch(addTask({ taskListId, title }));
  };

  const handleToggleTask = async (taskListId: string, taskId: string, isCompleted: boolean) => {
    return dispatch(toggleTask({ taskListId, taskId, isCompleted }));
  };

  const handleEditTask = async (taskListId: string, taskId: string, title: string) => {
    return dispatch(editTask({ taskListId, taskId, title }));
  };

  const handleDeleteTask = async (taskListId: string, taskId: string) => {
    return dispatch(deleteTask({ taskListId, taskId }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleSetCurrentTaskList = (taskList: any) => {
    dispatch(setCurrentTaskList(taskList));
  };

  return {
    taskLists,
    currentTaskList,
    isLoading,
    error,
    loadTaskList: handleLoadTaskList,
    createTaskList: handleCreateTaskList,
    generateFromAI: handleGenerateFromAI,
    updateTaskList: handleUpdateTaskList,
    deleteTaskList: handleDeleteTaskList,
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    editTask: handleEditTask,
    deleteTask: handleDeleteTask,
    clearError: handleClearError,
    setCurrentTaskList: handleSetCurrentTaskList,
  };
};
