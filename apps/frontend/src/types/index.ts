// User types
export interface User {
  id: string;
  name?: string;
  isAnonymous: boolean;
  aiIntegrationType?: 'huggingface' | 'openrouter';
  aiToken?: string;
}

// Task List types
export interface TaskList {
  id: string;
  name: string;
  description?: string;
  iaPrompt?: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

// Task types
export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// API Request types
export interface CreateSessionRequest {
  userId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  aiIntegrationType?: 'huggingface' | 'openrouter';
  aiToken?: string;
}

export interface CreateTaskListRequest {
  name: string;
  description?: string;
}

export interface GenerateFromAIRequest {
  listName: string;
  prompt: string;
}

export interface UpdateTaskListRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  position: number;
}

export interface UpdateTaskRequest {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

// UI State types
export interface AppState {
  user: User | null;
  taskLists: TaskList[];
  currentTaskList: TaskList | null;
  isLoading: boolean;
  error: string | null;
}
