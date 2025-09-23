import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TasksService } from '../tasks/tasks.service';
import { GenerateTasksDto } from './dto/ai.dto';

interface TaskSuggestion {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tasksService: TasksService,
  ) {}

  async generateTasksFromPrompt(dto: GenerateTasksDto): Promise<any[]> {
    const { prompt, apiKey, provider = 'huggingface' } = dto;
    
    try {
      const tasks = await this.callAiApi(prompt, apiKey, provider);
      
      // Save generated tasks to database
      const savedTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const taskData = tasks[i];
        const task = await this.tasksService.create({
          listId: 'default-list', // TODO: Implement proper list management
          title: taskData.title,
          position: i,
        });
        savedTasks.push(task);
      }

      this.logger.log(`Generated ${savedTasks.length} tasks from prompt: "${prompt}"`);
      return savedTasks;
    } catch (error) {
      this.logger.error('Error generating tasks:', error.message);
      throw new BadRequestException('Failed to generate tasks from AI service');
    }
  }

  private async callAiApi(prompt: string, apiKey: string, provider: string): Promise<TaskSuggestion[]> {
    const systemPrompt = `You are a task management assistant. Given a high-level goal or objective, break it down into specific, actionable tasks. 

Return ONLY a JSON array of tasks, where each task has:
- title: A clear, actionable task title (max 100 characters)
- description: Optional detailed description
- priority: "low", "medium", or "high"
- category: A relevant category name

Example format:
[
  {
    "title": "Research destination options",
    "description": "Look up travel destinations that match budget and preferences",
    "priority": "high",
    "category": "Research"
  },
  {
    "title": "Book flights",
    "description": "Compare prices and book round-trip flights",
    "priority": "high", 
    "category": "Booking"
  }
]

Goal: ${prompt}`;

    if (provider === 'huggingface') {
      return await this.callHuggingFace(systemPrompt, apiKey);
    } else if (provider === 'openrouter') {
      return await this.callOpenRouter(systemPrompt, apiKey);
    } else {
      throw new BadRequestException('Invalid AI provider');
    }
  }

  private async callHuggingFace(prompt: string, apiKey: string): Promise<TaskSuggestion[]> {
    const model = 'microsoft/DialoGPT-medium'; // Free model for text generation
    
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            return_full_text: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const generatedText = response.data[0]?.generated_text || '';
      return this.parseAiResponse(generatedText);
    } catch (error) {
      this.logger.error('Hugging Face API error:', error.response?.data || error.message);
      throw new BadRequestException('Hugging Face API request failed');
    }
  }

  private async callOpenRouter(prompt: string, apiKey: string): Promise<TaskSuggestion[]> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that breaks down goals into actionable tasks. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'AI Todo App',
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      return this.parseAiResponse(content);
    } catch (error) {
      this.logger.error('OpenRouter API error:', error.response?.data || error.message);
      throw new BadRequestException('OpenRouter API request failed');
    }
  }

  private parseAiResponse(response: string): TaskSuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsed = JSON.parse(jsonString);
        
        if (Array.isArray(parsed)) {
          return parsed.map(task => ({
            title: task.title || 'Untitled Task',
            description: task.description || '',
            priority: task.priority || 'medium',
            category: task.category || 'General',
          }));
        }
      }

      // Fallback: create tasks from text lines
      const lines = response.split('\n').filter(line => line.trim());
      return lines.slice(0, 10).map((line, index) => ({
        title: line.trim().substring(0, 100),
        description: '',
        priority: 'medium' as const,
        category: 'AI Generated',
      }));
    } catch (error) {
      this.logger.warn('Failed to parse AI response, using fallback');
      
      // Ultimate fallback: create basic tasks
      return [
        {
          title: 'Review generated tasks',
          description: 'Check and refine the AI-generated task list',
          priority: 'high' as const,
          category: 'Review',
        },
        {
          title: 'Add specific details',
          description: 'Add more specific information to each task',
          priority: 'medium' as const,
          category: 'Planning',
        },
      ];
    }
  }

  async getAvailableProviders(): Promise<{ name: string; description: string; free: boolean }[]> {
    return [
      {
        name: 'huggingface',
        description: 'Hugging Face Inference API - Free tier available',
        free: true,
      },
      {
        name: 'openrouter',
        description: 'OpenRouter - Access to multiple LLMs',
        free: false,
      },
    ];
  }
}
