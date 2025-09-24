import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';

// Schema para validação das tarefas geradas
export const TaskSchema = z.object({
  title: z.string().min(1).max(100).describe('A clear, actionable task title'),
  description: z.string().optional().describe('Optional detailed description'),
  priority: z.enum(['low', 'medium', 'high']).default('medium').describe('Task priority level'),
  category: z.string().optional().describe('A relevant category name'),
});

export const TaskArraySchema = z.array(TaskSchema);

export type TaskSuggestion = z.infer<typeof TaskSchema>;

// Parser estruturado para respostas JSON das tarefas
export const taskParser = StructuredOutputParser.fromZodSchema(TaskArraySchema);

// Template de prompt estruturado
export const TASK_GENERATION_PROMPT = `
You are a task management assistant. Given a high-level goal or objective, break it down into specific, actionable tasks.

{format_instructions}

Goal: {goal}

Return ONLY the JSON array of tasks as specified in the format instructions.
`;
