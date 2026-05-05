import type { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { HttpError } from '../../shared/errors';
import {
  PROJECT_SERVICE_TOKEN,
  type IProjectService,
} from './project.interface';
import {
  createProjectSchema,
  idParamSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from './project.schema';

@injectable()
export class ProjectController {
  constructor(
    @inject(PROJECT_SERVICE_TOKEN) private readonly projects: IProjectService,
  ) {}

  create = (req: Request, res: Response): void => {
    const input = createProjectSchema.parse(req.body);
    const project = this.projects.create(input);
    res.status(201).json(project);
  };

  list = (req: Request, res: Response): void => {
    const query = listProjectsQuerySchema.parse(req.query);
    const result = this.projects.list(query);
    res.json(result);
  };

  get = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const project = this.projects.findById(id);
    if (!project) throw new HttpError(404, `Project ${id} not found`);
    res.json(project);
  };

  update = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateProjectSchema.parse(req.body);
    const project = this.projects.update(id, input);
    if (!project) throw new HttpError(404, `Project ${id} not found`);
    res.json(project);
  };

  remove = (req: Request, res: Response): void => {
    const { id } = idParamSchema.parse(req.params);
    const ok = this.projects.remove(id);
    if (!ok) throw new HttpError(404, `Project ${id} not found`);
    res.status(204).send();
  };
}
