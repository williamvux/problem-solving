import { z } from 'zod';

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: taskStatusSchema.optional(),
  project_id: z.number().int().positive().nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: taskStatusSchema.optional(),
    project_id: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one field must be provided',
  });

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  q: z.string().trim().min(1).max(200).optional(),
  project_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
