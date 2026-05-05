import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { runMigrations } from './migrations';

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

runMigrations(db);
