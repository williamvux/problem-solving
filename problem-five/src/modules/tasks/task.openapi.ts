import { z } from 'zod';
import { registry } from '../../shared/openapi/registry';
import { errorResponse } from '../../shared/openapi/common';
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  taskStatusSchema,
  updateTaskSchema,
} from './task.schema';

const TaskSchema = registry.register(
  'Task',
  z.object({
    id: z.number().int().positive(),
    title: z.string(),
    description: z.string().nullable(),
    status: taskStatusSchema,
    project_id: z.number().int().positive().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
);

const TaskListSchema = registry.register(
  'TaskList',
  z.object({
    data: z.array(TaskSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }),
);

const TAG = 'Tasks';

registry.registerPath({
  method: 'post',
  path: '/api/tasks',
  tags: [TAG],
  summary: 'Create a task',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: createTaskSchema } },
    },
  },
  responses: {
    201: {
      description: 'Task created',
      content: { 'application/json': { schema: TaskSchema } },
    },
    400: errorResponse('Validation failed or project_id does not exist'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks',
  tags: [TAG],
  summary: 'List tasks (with filters)',
  request: { query: listTasksQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of tasks',
      content: { 'application/json': { schema: TaskListSchema } },
    },
    400: errorResponse('Invalid query parameter'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}',
  tags: [TAG],
  summary: 'Get a task by id',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Task',
      content: { 'application/json': { schema: TaskSchema } },
    },
    404: errorResponse('Task not found'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}',
  tags: [TAG],
  summary: 'Update a task (partial)',
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: updateTaskSchema } },
    },
  },
  responses: {
    200: {
      description: 'Updated task',
      content: { 'application/json': { schema: TaskSchema } },
    },
    400: errorResponse('Validation failed or project_id does not exist'),
    404: errorResponse('Task not found'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/tasks/{id}',
  tags: [TAG],
  summary: 'Delete a task',
  request: { params: idParamSchema },
  responses: {
    204: { description: 'Task deleted' },
    404: errorResponse('Task not found'),
  },
});
