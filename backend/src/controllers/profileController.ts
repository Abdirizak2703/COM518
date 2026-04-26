import { Request, Response } from 'express';
import { listBookingsByUser } from '../dao/bookingDao';
import { getProfileByUserId, upsertProfile } from '../dao/profileDao';
import { ApiError } from '../middleware/apiError';

interface ProfilePayload {
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = req.session.user;
  if (!user) {
    throw new ApiError(401, 'You must be logged in to access your profile.');
  }

  const storedProfile = await getProfileByUserId(user.id);
  if (!storedProfile) {
    res.status(200).json({
      profile: {
        userID: user.id,
        fullName: '',
        phone: '',
        homeCity: '',
        bio: '',
        updatedAt: null
      }
    });
    return;
  }

  res.status(200).json({ profile: storedProfile });
}

export async function saveProfile(req: Request, res: Response): Promise<void> {
  const user = req.session.user;
  if (!user) {
    throw new ApiError(401, 'You must be logged in to save your profile.');
  }

  const payload = req.body as ProfilePayload;

  const profile = await upsertProfile({
    userID: user.id,
    fullName: payload.fullName,
    phone: payload.phone,
    homeCity: payload.homeCity,
    bio: payload.bio
  });

  res.status(200).json({ profile });
}

export async function getProfileTrips(req: Request, res: Response): Promise<void> {
  const user = req.session.user;
  if (!user) {
    throw new ApiError(401, 'You must be logged in to access trip history.');
  }

  const trips = await listBookingsByUser(user.id);
  res.status(200).json({ trips });
}
