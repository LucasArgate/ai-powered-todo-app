import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, updateUser, logout, clearError } from '@/store/authSlice';

export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleUpdateUser = async (userData: {
    name?: string;
    aiIntegrationType?: 'huggingface' | 'openrouter';
    aiToken?: string;
  }) => {
    return dispatch(updateUser(userData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    updateUser: handleUpdateUser,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
