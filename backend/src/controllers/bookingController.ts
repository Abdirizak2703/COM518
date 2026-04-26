import { Request, Response } from 'express';
import { findAccommodationById } from '../dao/accommodationDao';
import { createBookingAndDecreaseAvailability, getDateAvailability } from '../dao/bookingDao';
import { ApiError } from '../middleware/apiError';
import { BookingInput } from '../types/models';
import { isPastYYMMDD, isYYMMDD } from '../utils';

export async function createBooking(req: Request, res: Response): Promise<void> {
  const { accID, date, npeople } = req.body as BookingInput;

  if (!req.session.user) {
    throw new ApiError(401, 'You must be logged in to book.');
  }

  if (!isYYMMDD(date) || isPastYYMMDD(date)) {
    throw new ApiError(400, 'date must be a valid YYMMDD value and cannot be in the past.');
  }

  const accommodation = await findAccommodationById(accID);
  if (!accommodation) {
    throw new ApiError(404, 'Accommodation not found.');
  }

  const availability = await getDateAvailability(accID, date);
  if (!availability) {
    throw new ApiError(404, 'No availability record found for this date.');
  }

  if (availability.availability < npeople) {
    throw new ApiError(409, 'Not enough availability for selected date.');
  }

  await createBookingAndDecreaseAvailability({
    accID,
    date,
    npeople,
    userID: req.session.user.id
  });

  res.status(201).json({ message: 'Booking confirmed.' });
}
