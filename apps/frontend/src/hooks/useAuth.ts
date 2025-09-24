import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  });

  /**
   * Initialize authentication - implements the perfect auth flow
   * 1) Check if userId exists in localStorage
   * 2) If not -> create user via API -> save to localStorage -> set headers
   * 3) If yes -> get userId -> set headers
   */
  const initializeAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if userId exists in localStorage
      if (authService.hasUserId()) {
        // Case 1: userId exists in localStorage
        // Get user data and set headers for API requests
        const userId = authService.getUserId();
        console.log('User ID found in localStorage:', userId);
        
        // Create session with existing userId
        const user = await apiClient.createSession({ userId: userId! });
        authService.setUser(user);
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Case 2: No userId in localStorage
        // Create new user via API -> save to localStorage -> set headers
        console.log('No user ID in localStorage, creating new user');
        
        const user = await apiClient.createSession({});
        authService.setUser(user);
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Falha ao inicializar autenticação',
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback(async (userData: {
    name?: string;
    aiIntegrationType?: 'huggingface' | 'openrouter';
    aiToken?: string;
  }) => {
    if (!state.user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedUser = await apiClient.updateUser(userData);
      authService.setUser(updatedUser);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      console.log('User updated successfully:', updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      setState(prev => ({
        ...prev,
        error: 'Falha ao atualizar usuário',
        isLoading: false,
      }));
    }
  }, [state.user]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.clearUser();
    setState({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...state,
    initializeAuth,
    updateUser,
    logout,
    clearError,
  };
};
