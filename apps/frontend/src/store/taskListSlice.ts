import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskList, Task } from '@/types';
import { apiClient } from '@/lib/api';

interface TaskListState {
  taskLists: TaskList[];
  currentTaskList: TaskList | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskListState = {
  taskLists: [],
  currentTaskList: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loadTaskLists = createAsyncThunk(
  'taskList/loadTaskLists',
  async (_, { rejectWithValue }) => {
    try {
      const taskLists = await apiClient.getTaskLists();
      return taskLists;
    } catch (error) {
      return rejectWithValue('Falha ao carregar listas de tarefas');
    }
  }
);

export const loadTaskList = createAsyncThunk(
  'taskList/loadTaskList',
  async (taskListId: string, { rejectWithValue }) => {
    try {
      const taskList = await apiClient.getTaskList(taskListId);
      return taskList;
    } catch (error) {
      return rejectWithValue('Falha ao carregar lista de tarefas');
    }
  }
);

export const createTaskList = createAsyncThunk(
  'taskList/createTaskList',
  async ({ name, description }: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const newTaskList = await apiClient.createTaskList({ name, description });
      return newTaskList;
    } catch (error) {
      return rejectWithValue('Falha ao criar lista de tarefas');
    }
  }
);

export const generateFromAI = createAsyncThunk(
  'taskList/generateFromAI',
  async ({ listName, prompt }: { listName: string; prompt: string }, { rejectWithValue }) => {
    try {
      const newTaskList = await apiClient.generateFromAI({ listName, prompt });
      return newTaskList;
    } catch (error) {
      return rejectWithValue('Falha ao gerar tarefas da IA');
    }
  }
);

export const updateTaskList = createAsyncThunk(
  'taskList/updateTaskList',
  async ({ taskListId, name, description }: { taskListId: string; name: string; description?: string }, { rejectWithValue }) => {
    try {
      const updatedTaskList = await apiClient.updateTaskList(taskListId, { name, description });
      return updatedTaskList;
    } catch (error) {
      return rejectWithValue('Falha ao atualizar lista de tarefas');
    }
  }
);

export const deleteTaskList = createAsyncThunk(
  'taskList/deleteTaskList',
  async (taskListId: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteTaskList(taskListId);
      return taskListId;
    } catch (error) {
      return rejectWithValue('Falha ao excluir lista de tarefas');
    }
  }
);

export const addTask = createAsyncThunk(
  'taskList/addTask',
  async ({ taskListId, title }: { taskListId: string; title: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { taskList: TaskListState };
      
      // Find the specific task list to calculate position
      const targetTaskList = state.taskList.taskLists.find(tl => tl.id === taskListId) || 
                             state.taskList.currentTaskList;
      
      // Calculate position based on target task list tasks length
      const position = targetTaskList?.tasks?.length || 0;
      
      // Create task via API
      const newTask = await apiClient.createTask(taskListId, { title, position });
      
      return { taskListId, task: newTask };
    } catch (error) {
      return rejectWithValue('Falha ao adicionar tarefa');
    }
  }
);

export const toggleTask = createAsyncThunk(
  'taskList/toggleTask',
  async ({ taskListId, taskId, isCompleted }: { taskListId: string; taskId: string; isCompleted: boolean }, { rejectWithValue }) => {
    try {
      const updatedTask = await apiClient.updateTask(taskListId, taskId, { isCompleted });
      return { taskListId, taskId, task: updatedTask };
    } catch (error) {
      return rejectWithValue('Falha ao atualizar tarefa');
    }
  }
);

export const editTask = createAsyncThunk(
  'taskList/editTask',
  async ({ taskListId, taskId, title }: { taskListId: string; taskId: string; title: string }, { rejectWithValue }) => {
    try {
      const updatedTask = await apiClient.updateTask(taskListId, taskId, { title });
      return { taskListId, taskId, task: updatedTask };
    } catch (error) {
      return rejectWithValue('Falha ao editar tarefa');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'taskList/deleteTask',
  async ({ taskListId, taskId }: { taskListId: string; taskId: string }, { rejectWithValue }) => {
    try {
      await apiClient.deleteTask(taskListId, taskId);
      return { taskListId, taskId };
    } catch (error) {
      return rejectWithValue('Falha ao excluir tarefa');
    }
  }
);

const taskListSlice = createSlice({
  name: 'taskList',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTaskList: (state, action: PayloadAction<TaskList | null>) => {
      state.currentTaskList = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load Task Lists
    builder
      .addCase(loadTaskLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTaskLists.fulfilled, (state, action) => {
        state.isLoading = false;
        // Preserve existing tasks when updating task lists
        const updatedTaskLists = action.payload.map(newTaskList => {
          const existingTaskList = state.taskLists.find(tl => tl.id === newTaskList.id);
          return {
            ...newTaskList,
            tasks: existingTaskList?.tasks || newTaskList.tasks || []
          };
        });
        state.taskLists = updatedTaskLists;
        state.error = null;
      })
      .addCase(loadTaskLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load Task List
    builder
      .addCase(loadTaskList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaskList = action.payload;
        state.error = null;
      })
      .addCase(loadTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task List
    builder
      .addCase(createTaskList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskLists.push(action.payload);
        // Don't set currentTaskList - let user stay on home page
        state.error = null;
      })
      .addCase(createTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate from AI
    builder
      .addCase(generateFromAI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFromAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskLists.push(action.payload);
        // Don't set currentTaskList - let user stay on home page
        state.error = null;
      })
      .addCase(generateFromAI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Task List
    builder
      .addCase(updateTaskList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskLists = state.taskLists.map(tl => 
          tl.id === action.payload.id ? action.payload : tl
        );
        if (state.currentTaskList?.id === action.payload.id) {
          state.currentTaskList = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Task List
    builder
      .addCase(deleteTaskList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskLists = state.taskLists.filter(tl => tl.id !== action.payload);
        if (state.currentTaskList?.id === action.payload) {
          state.currentTaskList = null;
        }
        state.error = null;
      })
      .addCase(deleteTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Task
    builder
      .addCase(addTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update only the current task list if it matches
        if (state.currentTaskList?.id === action.payload.taskListId) {
          state.currentTaskList.tasks = [...(state.currentTaskList.tasks || []), action.payload.task];
        }
        // Also update the task list in the taskLists array
        const taskListIndex = state.taskLists.findIndex(tl => tl.id === action.payload.taskListId);
        if (taskListIndex !== -1) {
          state.taskLists[taskListIndex].tasks = [...(state.taskLists[taskListIndex].tasks || []), action.payload.task];
        }
        state.error = null;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Task
    builder
      .addCase(toggleTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentTaskList?.id === action.payload.taskListId) {
          state.currentTaskList.tasks = state.currentTaskList.tasks?.map(task => 
            task.id === action.payload.taskId ? action.payload.task : task
          ) || [];
        }
        // Also update the task list in the taskLists array
        const taskListIndex = state.taskLists.findIndex(tl => tl.id === action.payload.taskListId);
        if (taskListIndex !== -1) {
          state.taskLists[taskListIndex].tasks = state.taskLists[taskListIndex].tasks?.map(task => 
            task.id === action.payload.taskId ? action.payload.task : task
          ) || [];
        }
        state.error = null;
      })
      .addCase(toggleTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Edit Task
    builder
      .addCase(editTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentTaskList?.id === action.payload.taskListId) {
          state.currentTaskList.tasks = state.currentTaskList.tasks?.map(task => 
            task.id === action.payload.taskId ? action.payload.task : task
          ) || [];
        }
        // Also update the task list in the taskLists array
        const taskListIndex = state.taskLists.findIndex(tl => tl.id === action.payload.taskListId);
        if (taskListIndex !== -1) {
          state.taskLists[taskListIndex].tasks = state.taskLists[taskListIndex].tasks?.map(task => 
            task.id === action.payload.taskId ? action.payload.task : task
          ) || [];
        }
        state.error = null;
      })
      .addCase(editTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentTaskList?.id === action.payload.taskListId) {
          state.currentTaskList.tasks = state.currentTaskList.tasks?.filter(task => task.id !== action.payload.taskId) || [];
        }
        // Also update the task list in the taskLists array
        const taskListIndex = state.taskLists.findIndex(tl => tl.id === action.payload.taskListId);
        if (taskListIndex !== -1) {
          state.taskLists[taskListIndex].tasks = state.taskLists[taskListIndex].tasks?.filter(task => task.id !== action.payload.taskId) || [];
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTaskList } = taskListSlice.actions;
export default taskListSlice.reducer;
