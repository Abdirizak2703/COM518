import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { env } from '../types/env';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (db) {
    return db;
  }

  const dir = path.dirname(env.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = await open({
    filename: env.dbPath,
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON');
  return db;
}
