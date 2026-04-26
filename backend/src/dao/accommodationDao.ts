import { getDb } from '../db/database';
import { Accommodation } from '../types/models';

interface AccommodationRow {
  id: number;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  roomsTotal: number;
  roomsAvailableToday: number;
  amenities: string;
  facilities: string;
  images: string;
}

function mapAccommodation(row: AccommodationRow): Accommodation {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    roomsTotal: row.roomsTotal,
    roomsAvailableToday: row.roomsAvailableToday,
    amenities: JSON.parse(row.amenities) as string[],
    facilities: JSON.parse(row.facilities) as string[],
    images: JSON.parse(row.images) as string[]
  };
}

function todayYYMMDD(): string {
  const today = new Date();
  const yy = String(today.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export async function getAccommodationsByFilters(location: string, type?: string): Promise<Accommodation[]> {
  const db = await getDb();
  const availabilityDate = todayYYMMDD();
  const baseQuery = `
    SELECT
      a.id,
      a.name,
      a.type,
      a.location,
      a.latitude,
      a.longitude,
      a.roomsTotal,
      COALESCE(d.availability, a.roomsTotal) AS roomsAvailableToday,
      a.amenities,
      a.facilities,
      a.images
    FROM accommodation a
    LEFT JOIN acc_dates d ON d.accID = a.id AND d.thedate = ?
    WHERE a.location = ?
  `;

  if (type) {
    const rows = await db.all<AccommodationRow[]>(`${baseQuery} AND a.type = ?`, [availabilityDate, location, type]);
    return rows.map(mapAccommodation);
  }

  const rows = await db.all<AccommodationRow[]>(baseQuery, [availabilityDate, location]);
  return rows.map(mapAccommodation);
}

export async function getAccommodationLocations(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.all<{ location: string }[]>(`
    SELECT DISTINCT location
    FROM accommodation
    ORDER BY location ASC
  `);

  return rows.map((row) => row.location);
}

export async function getAccommodationTypes(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.all<{ type: string }[]>(`
    SELECT DISTINCT type
    FROM accommodation
    ORDER BY type ASC
  `);

  return rows.map((row) => row.type);
}

export async function findAccommodationById(accID: number): Promise<Accommodation | undefined> {
  const db = await getDb();
  const availabilityDate = todayYYMMDD();
  const row = await db.get<AccommodationRow>(
    `
      SELECT
        a.id,
        a.name,
        a.type,
        a.location,
        a.latitude,
        a.longitude,
        a.roomsTotal,
        COALESCE(d.availability, a.roomsTotal) AS roomsAvailableToday,
        a.amenities,
        a.facilities,
        a.images
      FROM accommodation a
      LEFT JOIN acc_dates d ON d.accID = a.id AND d.thedate = ?
      WHERE a.id = ?
    `,
    [availabilityDate, accID]
  );

  return row ? mapAccommodation(row) : undefined;
}
