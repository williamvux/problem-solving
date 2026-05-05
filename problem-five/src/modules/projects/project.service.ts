import type Database from 'better-sqlite3';
import { inject, injectable } from 'tsyringe';
import { DB_TOKEN } from '../../shared/tokens';
import { HttpError } from '../../shared/errors';
import type { Project, ProjectFilters } from './project.types';
import type { CreateProjectInput, UpdateProjectInput } from './project.schema';
import type { IProjectService, ProjectListResult } from './project.interface';

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'SQLITE_CONSTRAINT_UNIQUE'
  );
}

@injectable()
export class ProjectService implements IProjectService {
  constructor(@inject(DB_TOKEN) private readonly db: Database.Database) {}

  create(input: CreateProjectInput): Project {
    try {
      const stmt = this.db.prepare(
        `INSERT INTO projects (name, description)
         VALUES (@name, @description)
         RETURNING *`,
      );
      return stmt.get({
        name: input.name,
        description: input.description ?? null,
      }) as Project;
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new HttpError(409, `Project name "${input.name}" already exists`);
      }
      throw err;
    }
  }

  findById(id: number): Project | undefined {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
      | Project
      | undefined;
  }

  list(filters: ProjectFilters): ProjectListResult {
    const where: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.q) {
      where.push('(name LIKE @q OR description LIKE @q)');
      params.q = `%${filters.q}%`;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = (
      this.db
        .prepare(`SELECT COUNT(*) AS c FROM projects ${whereSql}`)
        .get(params) as { c: number }
    ).c;

    const data = this.db
      .prepare(
        `SELECT * FROM projects
         ${whereSql}
         ORDER BY created_at DESC, id DESC
         LIMIT @limit OFFSET @offset`,
      )
      .all({
        ...params,
        limit: filters.limit,
        offset: filters.offset,
      }) as Project[];

    return { data, total, limit: filters.limit, offset: filters.offset };
  }

  update(id: number, input: UpdateProjectInput): Project | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (input.name !== undefined) {
      fields.push('name = @name');
      params.name = input.name;
    }
    if (input.description !== undefined) {
      fields.push('description = @description');
      params.description = input.description;
    }

    fields.push("updated_at = datetime('now')");

    try {
      const stmt = this.db.prepare(
        `UPDATE projects SET ${fields.join(', ')}
         WHERE id = @id
         RETURNING *`,
      );
      return stmt.get(params) as Project;
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new HttpError(409, `Project name "${input.name}" already exists`);
      }
      throw err;
    }
  }

  remove(id: number): boolean {
    const result = this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
