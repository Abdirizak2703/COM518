import path from 'node:path';

interface EnvConfig {
  port: number;
  sessionSecret: string;
  corsOrigin: string;
  dbPath: string;
}

function parsePort(rawPort: string | undefined): number {
  if (!rawPort) {
    return 4000;
  }

  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return parsed;
}

function resolveDbPath(rawPath: string | undefined): string {
  const fallback = path.resolve(process.cwd(), 'data', 'placestostay.db');
  return rawPath ? path.resolve(process.cwd(), rawPath) : fallback;
}

export const env: EnvConfig = {
  port: parsePort(process.env.PORT),
  sessionSecret: process.env.SESSION_SECRET ?? 'development-only-secret-change-me',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dbPath: resolveDbPath(process.env.DB_PATH)
};
