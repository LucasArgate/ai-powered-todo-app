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

class ApiClient {
  private client: AxiosInstance;
  private userId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load userId from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {};
    if (this.userId) {
      headers['X-User-ID'] = this.userId;
    }
    return headers;
  }

  // User endpoints
  async createSession(data: CreateSessionRequest): Promise<User> {
    const response = await this.client.post('/users/session', data);
    this.userId = response.data.id;
    
    // Save userId to localStorage
    if (typeof window !== 'undefined' && this.userId) {
      localStorage.setItem('userId', this.userId);
    }
    
    return response.data;
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await this.client.patch('/users/me', data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Task List endpoints
  async getTaskLists(): Promise<TaskList[]> {
    const response = await this.client.get('/lists', {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getTaskList(listId: string): Promise<TaskList> {
    const response = await this.client.get(`/lists/${listId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createTaskList(data: CreateTaskListRequest): Promise<TaskList> {
    const response = await this.client.post('/lists', data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async generateFromAI(data: GenerateFromAIRequest): Promise<TaskList> {
    const response = await this.client.post('/lists/generate-from-ai', data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateTaskList(listId: string, data: UpdateTaskListRequest): Promise<TaskList> {
    const response = await this.client.patch(`/lists/${listId}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteTaskList(listId: string): Promise<void> {
    await this.client.delete(`/lists/${listId}`, {
      headers: this.getHeaders(),
    });
  }

  // Task endpoints
  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post(`/lists/${listId}/tasks`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateTask(listId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.patch(`/lists/${listId}/tasks/${taskId}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteTask(listId: string, taskId: string): Promise<void> {
    await this.client.delete(`/lists/${listId}/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
