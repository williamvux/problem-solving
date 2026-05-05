import type { Task, TaskFilters } from './task.types';
import type { CreateTaskInput, UpdateTaskInput } from './task.schema';

export interface TaskListResult {
  data: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface ITaskService {
  create(input: CreateTaskInput): Task;
  findById(id: number): Task | undefined;
  list(filters: TaskFilters): TaskListResult;
  update(id: number, input: UpdateTaskInput): Task | undefined;
  remove(id: number): boolean;
}

export const TASK_SERVICE_TOKEN = Symbol('ITaskService');
