import { getDb } from '../db/database';

let blockedColumnReady = false;

async function ensureBlockedColumn(): Promise<void> {
  if (blockedColumnReady) {
    return;
  }

  const db = await getDb();
  const columns = await db.all<{ name: string }[]>(`PRAGMA table_info(acc_users)`);
  const hasBlocked = columns.some((column) => column.name === 'blocked');
  const hasSuperAdmin = columns.some((column) => column.name === 'superAdmin');
  if (!hasBlocked) {
    await db.exec(`ALTER TABLE acc_users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0`);
  }

  if (!hasSuperAdmin) {
    await db.exec(`ALTER TABLE acc_users ADD COLUMN superAdmin INTEGER NOT NULL DEFAULT 0`);
  }

  const superAdminRow = await db.get<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM acc_users
     WHERE admin = 1 AND superAdmin = 1`
  );

  if ((superAdminRow?.count ?? 0) === 0) {
    await db.run(
      `UPDATE acc_users
       SET superAdmin = 1
       WHERE id = (
         SELECT id
         FROM acc_users
         WHERE admin = 1
         ORDER BY id ASC
         LIMIT 1
       )`
    );
  }

  blockedColumnReady = true;
}

export async function getAdminActorFlags(userID: number): Promise<{ admin: boolean; superAdmin: boolean } | undefined> {
  await ensureBlockedColumn();
  const db = await getDb();
  const row = await db.get<{ admin: number; superAdmin: number }>(
    `SELECT admin, superAdmin
     FROM acc_users
     WHERE id = ?`,
    [userID]
  );

  if (!row) {
    return undefined;
  }

  return {
    admin: row.admin === 1,
    superAdmin: row.superAdmin === 1
  };
}

export interface AdminClientRecord {
  userID: number;
  username: string;
  admin: boolean;
  blocked: boolean;
  superAdmin: boolean;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string | null;
}

export interface AdminAccommodationRecord {
  id: number;
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}

interface CreateAdminAccommodationInput {
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}

interface AdminAccommodationRow {
  id: number;
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string;
}

function mapAdminAccommodation(row: AdminAccommodationRow): AdminAccommodationRecord {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(row.images) as unknown;
    if (Array.isArray(parsed)) {
      images = parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    images = [];
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    roomsTotal: row.roomsTotal,
    images
  };
}

interface SaveAdminClientInput {
  userID: number;
  username: string;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}

function mapAdminClient(row: {
  userID: number;
  username: string;
  admin: number;
  blocked: number;
  superAdmin: number;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string | null;
}): AdminClientRecord {
  return {
    userID: row.userID,
    username: row.username,
    admin: row.admin === 1,
    blocked: row.blocked === 1,
    superAdmin: row.superAdmin === 1,
    fullName: row.fullName,
    phone: row.phone,
    homeCity: row.homeCity,
    bio: row.bio,
    updatedAt: row.updatedAt
  };
}

export async function listClientsForAdmin(): Promise<AdminClientRecord[]> {
  await ensureBlockedColumn();
  const db = await getDb();
  const rows = await db.all<Array<{
    userID: number;
    username: string;
    admin: number;
    blocked: number;
    superAdmin: number;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
    updatedAt: string | null;
  }>>(
    `SELECT
       u.id AS userID,
       u.username,
       u.admin,
      u.blocked,
      u.superAdmin,
       COALESCE(p.fullName, '') AS fullName,
       COALESCE(p.phone, '') AS phone,
       COALESCE(p.homeCity, '') AS homeCity,
       COALESCE(p.bio, '') AS bio,
       p.updatedAt AS updatedAt
     FROM acc_users u
     LEFT JOIN user_profiles p ON p.userID = u.id
     ORDER BY u.id ASC`
  );

  return rows.map(mapAdminClient);
}

export async function getClientForAdmin(userID: number): Promise<AdminClientRecord | undefined> {
  await ensureBlockedColumn();
  const db = await getDb();
  const row = await db.get<{
    userID: number;
    username: string;
    admin: number;
    blocked: number;
    superAdmin: number;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
    updatedAt: string | null;
  }>(
    `SELECT
       u.id AS userID,
       u.username,
       u.admin,
      u.blocked,
      u.superAdmin,
       COALESCE(p.fullName, '') AS fullName,
       COALESCE(p.phone, '') AS phone,
       COALESCE(p.homeCity, '') AS homeCity,
       COALESCE(p.bio, '') AS bio,
       p.updatedAt AS updatedAt
     FROM acc_users u
     LEFT JOIN user_profiles p ON p.userID = u.id
     WHERE u.id = ?`,
    [userID]
  );

  return row ? mapAdminClient(row) : undefined;
}

export async function saveClientProfileFromAdmin(input: SaveAdminClientInput): Promise<AdminClientRecord | undefined> {
  const db = await getDb();

  await db.run('BEGIN TRANSACTION');
  try {
    await db.run(
      `UPDATE acc_users
       SET username = ?
       WHERE id = ?`,
      [input.username, input.userID]
    );

    await db.run(
      `INSERT INTO user_profiles (userID, fullName, phone, homeCity, bio)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(userID) DO UPDATE SET
         fullName = excluded.fullName,
         phone = excluded.phone,
         homeCity = excluded.homeCity,
         bio = excluded.bio,
         updatedAt = CURRENT_TIMESTAMP`,
      [input.userID, input.fullName, input.phone, input.homeCity, input.bio]
    );

    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }

  return getClientForAdmin(input.userID);
}

export async function setClientBlockedStatus(userID: number, blocked: boolean): Promise<AdminClientRecord | undefined> {
  await ensureBlockedColumn();
  const db = await getDb();
  await db.run(
    `UPDATE acc_users
     SET blocked = ?
     WHERE id = ?`,
    [blocked ? 1 : 0, userID]
  );

  return getClientForAdmin(userID);
}

export async function deleteClientByAdmin(userID: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(
    `DELETE FROM acc_users
     WHERE id = ?`,
    [userID]
  );

  return (result.changes ?? 0) > 0;
}

export async function listAccommodationsForAdmin(): Promise<AdminAccommodationRecord[]> {
  const db = await getDb();
  const rows = await db.all<AdminAccommodationRow[]>(
    `SELECT id, name, type, location, roomsTotal, images
     FROM accommodation
     ORDER BY id ASC`
  );

  return rows.map(mapAdminAccommodation);
}

export async function createAccommodationByAdmin(input: CreateAdminAccommodationInput): Promise<AdminAccommodationRecord> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO accommodation (name, type, location, latitude, longitude, roomsTotal, amenities, facilities, images)
     VALUES (?, ?, ?, 0, 0, ?, '[]', '[]', ?)`,
    [input.name, input.type, input.location, input.roomsTotal, JSON.stringify(input.images)]
  );

  const created = await getAccommodationForAdmin(result.lastID as number);
  if (!created) {
    throw new Error('Failed to create accommodation.');
  }

  return created;
}

export async function getAccommodationForAdmin(accID: number): Promise<AdminAccommodationRecord | undefined> {
  const db = await getDb();
  const row = await db.get<AdminAccommodationRow>(
    `SELECT id, name, type, location, roomsTotal, images
     FROM accommodation
     WHERE id = ?`,
    [accID]
  );

  return row ? mapAdminAccommodation(row) : undefined;
}

export async function updateAccommodationByAdmin(input: AdminAccommodationRecord): Promise<AdminAccommodationRecord | undefined> {
  const db = await getDb();
  await db.run(
    `UPDATE accommodation
     SET name = ?, type = ?, location = ?, roomsTotal = ?, images = ?
     WHERE id = ?`,
    [input.name, input.type, input.location, input.roomsTotal, JSON.stringify(input.images), input.id]
  );

  return getAccommodationForAdmin(input.id);
}

export async function deleteAccommodationByAdmin(accID: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(
    `DELETE FROM accommodation
     WHERE id = ?`,
    [accID]
  );

  return (result.changes ?? 0) > 0;
}
