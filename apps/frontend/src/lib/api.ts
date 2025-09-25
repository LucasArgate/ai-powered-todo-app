import axios, { AxiosInstance } from 'axios';
import {
  User,
  TaskList,
  Task,
  CreateSessionRequest,
  UpdateUserRequest,
  CreateTaskListRequest,
  GenerateFromAIRequest,
  UpdateTaskListRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types';
import { authService } from './auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getHeaders() {
    return authService.getAuthHeaders();
  }

  // User endpoints
  async createSession(data: CreateSessionRequest): Promise<User> {
    // If userId exists, try to get user by ID, otherwise create new user
    if (data.userId) {
      try {
        const response = await this.client.get(`/users/${data.userId}`);
        const user = response.data;
        authService.setUser(user);
        return user;
      } catch (error) {
        // If user not found, create new user
        console.log('User not found, creating new user');
      }
    }
    
    // Create new user
    const response = await this.client.post('/users', {
      name: undefined,
      isAnonymous: true,
    });
    const user = response.data;
    
    // Save user to auth service (which handles localStorage)
    authService.setUser(user);
    
    return user;
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    const response = await this.client.patch(`/users/${userId}`, data, {
      headers: this.getHeaders(),
    });
    const user = response.data;
    
    // Update user in auth service
    authService.setUser(user);
    
    return user;
  }

  // Task List endpoints
  async getTaskLists(): Promise<TaskList[]> {
    const response = await this.client.get('/task-lists', {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getTaskList(listId: string): Promise<TaskList> {
    const response = await this.client.get(`/task-lists/${listId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createTaskList(data: CreateTaskListRequest): Promise<TaskList> {
    const response = await this.client.post('/task-lists', data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async generateFromAI(data: GenerateFromAIRequest): Promise<TaskList> {
    const response = await this.client.post('/ai/generate-tasklist', data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async generateTasksPreview(data: GenerateFromAIRequest): Promise<{ listName: string; listDescription: string; tasks: any[] }> {
    const response = await this.client.post('/ai/generate-tasklist-preview', data, {
      headers: this.getHeaders(),
    });
    return {
      listName: response.data.name,
      listDescription: response.data.description,
      tasks: response.data.tasks
    };
  }

  async updateTaskList(listId: string, data: UpdateTaskListRequest): Promise<TaskList> {
    const response = await this.client.patch(`/task-lists/${listId}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteTaskList(listId: string): Promise<void> {
    await this.client.delete(`/task-lists/${listId}`, {
      headers: this.getHeaders(),
    });
  }

  // Task endpoints
  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post('/tasks', {
      ...data,
      listId: listId,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateTask(listId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.patch(`/tasks/${taskId}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteTask(listId: string, taskId: string): Promise<void> {
    await this.client.delete(`/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });
  }

  // AI endpoints
  async testApiKey(apiKey: string, provider: 'huggingface' | 'openrouter', model?: string): Promise<any> {
    const response = await this.client.post('/ai-public/test-api-key', {
      apiKey,
      provider,
      model,
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
