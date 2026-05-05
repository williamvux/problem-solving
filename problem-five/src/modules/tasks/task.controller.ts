import type { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { HttpError } from '../../shared/errors';
import {
  TASK_SERVICE_TOKEN,
  type ITaskService,
} from './task.interface';
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from './task.schema';

@injectable()
export class TaskController {
  constructor(
    @inject(TASK_SERVICE_TOKEN) private readonly tasks: ITaskService,
  ) {}

  create = (req: Request, res: Response): void => {
    const input = createTaskSchema.parse(req.body);
    const task = this.tasks.create(input);
    res.status(201).json(task);
  };

  list = (req: Request, res: Response): void => {
    const query = listTasksQuerySchema.parse(req.query);
    const result = this.tasks.list(query);
    res.json(result);
  };

  get = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const task = this.tasks.findById(id);
    if (!task) throw new HttpError(404, `Task ${id} not found`);
    res.json(task);
  };

  update = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateTaskSchema.parse(req.body);
    const task = this.tasks.update(id, input);
    if (!task) throw new HttpError(404, `Task ${id} not found`);
    res.json(task);
  };

  remove = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const ok = this.tasks.remove(id);
    if (!ok) throw new HttpError(404, `Task ${id} not found`);
    res.status(204).send();
  };
}
