import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

import '../../modules/tasks/task.openapi';
import '../../modules/projects/project.openapi';

import { config } from '../../config/env';

export function generateOpenApiSpec(): ReturnType<
  OpenApiGeneratorV3['generateDocument']
> {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Tasks & Projects API',
      version: '1.0.0',
      description:
        'CRUD API for Tasks and Projects, persisted in SQLite. Tasks may optionally belong to a Project.',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    tags: [
      { name: 'Tasks', description: 'Operations on tasks' },
      { name: 'Projects', description: 'Operations on projects' },
    ],
  });
}
