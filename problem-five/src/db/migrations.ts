import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed')),
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
  `);

  // For databases created before project_id existed, add the column in place.
  const cols = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
  if (!cols.some((c) => c.name === 'project_id')) {
    db.exec(
      `ALTER TABLE tasks ADD COLUMN project_id INTEGER
         REFERENCES projects(id) ON DELETE SET NULL;
       CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);`,
    );
  }
}
