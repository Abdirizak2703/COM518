import { getDb } from '../db/database';
import { BookingHistoryItem } from '../types/models';

interface DateAvailability {
  id: number;
  availability: number;
}

export async function getDateAvailability(accID: number, date: string): Promise<DateAvailability | undefined> {
  const db = await getDb();
  return db.get<DateAvailability>(
    `SELECT id, availability
     FROM acc_dates
     WHERE accID = ? AND thedate = ?`,
    [accID, date]
  );
}

export async function createBookingAndDecreaseAvailability(params: {
  accID: number;
  date: string;
  userID: number;
  npeople: number;
}): Promise<void> {
  const db = await getDb();

  // Execute booking write operations atomically to avoid race conditions.
  await db.exec('BEGIN TRANSACTION');
  try {
    await db.run(
      `INSERT INTO acc_bookings (accID, thedate, userID, npeople)
       VALUES (?, ?, ?, ?)`,
      [params.accID, params.date, params.userID, params.npeople]
    );

    await db.run(
      `UPDATE acc_dates
       SET availability = availability - ?
       WHERE accID = ? AND thedate = ?`,
      [params.npeople, params.accID, params.date]
    );

    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

interface BookingHistoryRow {
  bookingID: number;
  accID: number;
  accommodationName: string;
  accommodationType: string;
  location: string;
  date: string;
  units: number;
}

export async function listBookingsByUser(userID: number): Promise<BookingHistoryItem[]> {
  const db = await getDb();
  const rows = await db.all<BookingHistoryRow[]>(
    `SELECT
       b.id AS bookingID,
       b.accID,
       a.name AS accommodationName,
       a.type AS accommodationType,
       a.location,
       b.thedate AS date,
       b.npeople AS units
     FROM acc_bookings b
     INNER JOIN accommodation a ON a.id = b.accID
     WHERE b.userID = ?
     ORDER BY b.thedate DESC, b.id DESC`,
    [userID]
  );

  return rows.map((row) => ({
    bookingID: row.bookingID,
    accID: row.accID,
    accommodationName: row.accommodationName,
    accommodationType: row.accommodationType,
    location: row.location,
    date: row.date,
    units: row.units
  }));
}
