import { z } from 'zod';
import { registry } from '../../shared/openapi/registry';
import { errorResponse } from '../../shared/openapi/common';
import {
  createProjectSchema,
  idParamSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from './project.schema';

const ProjectSchema = registry.register(
  'Project',
  z.object({
    id: z.number().int().positive(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
);

const ProjectListSchema = registry.register(
  'ProjectList',
  z.object({
    data: z.array(ProjectSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }),
);

const TAG = 'Projects';

registry.registerPath({
  method: 'post',
  path: '/api/projects',
  tags: [TAG],
  summary: 'Create a project',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: createProjectSchema } },
    },
  },
  responses: {
    201: {
      description: 'Project created',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    400: errorResponse('Validation failed'),
    409: errorResponse('Project name already exists'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/projects',
  tags: [TAG],
  summary: 'List projects (with filters)',
  request: { query: listProjectsQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of projects',
      content: { 'application/json': { schema: ProjectListSchema } },
    },
    400: errorResponse('Invalid query parameter'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/projects/{id}',
  tags: [TAG],
  summary: 'Get a project by id',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Project',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    404: errorResponse('Project not found'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/projects/{id}',
  tags: [TAG],
  summary: 'Update a project (partial)',
  request: {
    params: idParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: updateProjectSchema } },
    },
  },
  responses: {
    200: {
      description: 'Updated project',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    400: errorResponse('Validation failed'),
    404: errorResponse('Project not found'),
    409: errorResponse('Project name already exists'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/projects/{id}',
  tags: [TAG],
  summary: 'Delete a project',
  request: { params: idParamSchema },
  responses: {
    204: { description: 'Project deleted' },
    404: errorResponse('Project not found'),
  },
});
