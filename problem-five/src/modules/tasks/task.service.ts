import type Database from 'better-sqlite3';
import { inject, injectable } from 'tsyringe';
import { DB_TOKEN } from '../../shared/tokens';
import { HttpError } from '../../shared/errors';
import type { Task, TaskFilters } from './task.types';
import type { CreateTaskInput, UpdateTaskInput } from './task.schema';
import type { ITaskService, TaskListResult } from './task.interface';

@injectable()
export class TaskService implements ITaskService {
  constructor(@inject(DB_TOKEN) private readonly db: Database.Database) {}

  private assertProjectExists(projectId: number): void {
    const row = this.db
      .prepare('SELECT 1 AS x FROM projects WHERE id = ?')
      .get(projectId);
    if (!row) {
      throw new HttpError(400, `Project ${projectId} does not exist`);
    }
  }

  create(input: CreateTaskInput): Task {
    if (input.project_id != null) this.assertProjectExists(input.project_id);

    const stmt = this.db.prepare(
      `INSERT INTO tasks (title, description, status, project_id)
       VALUES (@title, @description, @status, @project_id)
       RETURNING *`,
    );
    return stmt.get({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'pending',
      project_id: input.project_id ?? null,
    }) as Task;
  }

  findById(id: number): Task | undefined {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      | Task
      | undefined;
  }

  list(filters: TaskFilters): TaskListResult {
    const where: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.status) {
      where.push('status = @status');
      params.status = filters.status;
    }
    if (filters.q) {
      where.push('(title LIKE @q OR description LIKE @q)');
      params.q = `%${filters.q}%`;
    }
    if (filters.project_id !== undefined) {
      where.push('project_id = @project_id');
      params.project_id = filters.project_id;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = (
      this.db
        .prepare(`SELECT COUNT(*) AS c FROM tasks ${whereSql}`)
        .get(params) as { c: number }
    ).c;

    const data = this.db
      .prepare(
        `SELECT * FROM tasks
         ${whereSql}
         ORDER BY created_at DESC, id DESC
         LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit: filters.limit, offset: filters.offset }) as Task[];

    return { data, total, limit: filters.limit, offset: filters.offset };
  }

  update(id: number, input: UpdateTaskInput): Task | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    if (input.project_id != null) this.assertProjectExists(input.project_id);

    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (input.title !== undefined) {
      fields.push('title = @title');
      params.title = input.title;
    }
    if (input.description !== undefined) {
      fields.push('description = @description');
      params.description = input.description;
    }
    if (input.status !== undefined) {
      fields.push('status = @status');
      params.status = input.status;
    }
    if (input.project_id !== undefined) {
      fields.push('project_id = @project_id');
      params.project_id = input.project_id;
    }

    fields.push("updated_at = datetime('now')");

    const stmt = this.db.prepare(
      `UPDATE tasks SET ${fields.join(', ')}
       WHERE id = @id
       RETURNING *`,
    );
    return stmt.get(params) as Task;
  }

  remove(id: number): boolean {
    const result = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
