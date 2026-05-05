import type { Project, ProjectFilters } from './project.types';
import type { CreateProjectInput, UpdateProjectInput } from './project.schema';

export interface ProjectListResult {
  data: Project[];
  total: number;
  limit: number;
  offset: number;
}

export interface IProjectService {
  create(input: CreateProjectInput): Project;
  findById(id: number): Project | undefined;
  list(filters: ProjectFilters): ProjectListResult;
  update(id: number, input: UpdateProjectInput): Project | undefined;
  remove(id: number): boolean;
}

export const PROJECT_SERVICE_TOKEN = Symbol('IProjectService');
