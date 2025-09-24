import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Check if userId exists in localStorage
      if (authService.hasUserId()) {
        // Case 1: userId exists in localStorage
        const userId = authService.getUserId();
        console.log('User ID found in localStorage:', userId);
        
        // Create session with existing userId
        const user = await apiClient.createSession({ userId: userId! });
        authService.setUser(user);
        
        return user;
      } else {
        // Case 2: No userId in localStorage
        console.log('No user ID in localStorage, creating new user');
        
        const user = await apiClient.createSession({});
        authService.setUser(user);
        
        return user;
      }
    } catch (error) {
      return rejectWithValue('Falha ao inicializar autenticação');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData: {
    name?: string;
    aiIntegrationType?: 'huggingface' | 'openrouter';
    aiToken?: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.user) {
        return rejectWithValue('Usuário não encontrado');
      }

      const updatedUser = await apiClient.updateUser(userData);
      authService.setUser(updatedUser);
      
      console.log('User updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      return rejectWithValue('Falha ao atualizar usuário');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      authService.clearUser();
      return null;
    } catch (error) {
      return rejectWithValue('Falha ao fazer logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
