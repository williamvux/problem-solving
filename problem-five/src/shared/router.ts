import { Router } from 'express';
import { tasksRouter } from '../modules/tasks';
import { projectsRouter } from '../modules/projects';

export const apiRouter = Router();

apiRouter.use('/tasks', tasksRouter);
apiRouter.use('/projects', projectsRouter);
