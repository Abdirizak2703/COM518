import { getDb } from '../db/database';

export interface UserProfileRecord {
  userID: number;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string;
}

interface UpsertProfileInput {
  userID: number;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}

export async function getProfileByUserId(userID: number): Promise<UserProfileRecord | undefined> {
  const db = await getDb();
  return db.get<UserProfileRecord>(
    `SELECT userID, fullName, phone, homeCity, bio, updatedAt
     FROM user_profiles
     WHERE userID = ?`,
    [userID]
  );
}

export async function upsertProfile(input: UpsertProfileInput): Promise<UserProfileRecord> {
  const db = await getDb();

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

  const profile = await getProfileByUserId(input.userID);
  if (!profile) {
    throw new Error('Failed to persist profile.');
  }

  return profile;
}
