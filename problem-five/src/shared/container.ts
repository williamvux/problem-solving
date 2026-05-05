import { container } from 'tsyringe';
import { db } from '../db';
import { DB_TOKEN } from './tokens';
import { TASK_SERVICE_TOKEN } from '../modules/tasks/task.interface';
import { TaskService } from '../modules/tasks/task.service';
import { PROJECT_SERVICE_TOKEN } from '../modules/projects/project.interface';
import { ProjectService } from '../modules/projects/project.service';

container.register(DB_TOKEN, { useValue: db });

container.registerSingleton(TASK_SERVICE_TOKEN, TaskService);
container.registerSingleton(PROJECT_SERVICE_TOKEN, ProjectService);

export { container };
