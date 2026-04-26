import { getDb } from '../db/database';
import { User } from '../types/models';

interface CreateUserInput {
  username: string;
  passwordHash: string;
  admin: boolean;
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  try {
    return await db.get<User>(
      `SELECT id, username, password, admin, blocked, superAdmin
       FROM acc_users
       WHERE username = ?`,
      [username]
    );
  } catch {
    const legacyUser = await db.get<Omit<User, 'blocked' | 'superAdmin'>>(
      `SELECT id, username, password, admin
       FROM acc_users
       WHERE username = ?`,
      [username]
    );

    return legacyUser ? { ...legacyUser, blocked: 0, superAdmin: 0 } : undefined;
  }
}

export async function createUser(input: CreateUserInput): Promise<number> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO acc_users (username, password, admin, blocked, superAdmin)
     VALUES (?, ?, ?, 0, 0)`,
    [input.username, input.passwordHash, input.admin ? 1 : 0]
  );

  return result.lastID as number;
}

export async function updateUserPassword(userID: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE acc_users
     SET password = ?
     WHERE id = ?`,
    [passwordHash, userID]
  );
}

export async function setUserAdminByUsername(username: string, admin: boolean): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE acc_users
     SET admin = ?
     WHERE username = ?`,
    [admin ? 1 : 0, username]
  );
}
