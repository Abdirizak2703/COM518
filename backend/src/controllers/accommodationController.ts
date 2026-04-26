import { Request, Response } from 'express';
import { getAccommodationLocations, getAccommodationTypes, getAccommodationsByFilters } from '../dao/accommodationDao';
import { ApiError } from '../middleware/apiError';

export async function getAccommodations(req: Request, res: Response): Promise<void> {
  const rawLocation = req.query.location;
  const rawType = req.query.type;

  if (typeof rawLocation !== 'string' || rawLocation.trim().length === 0) {
    throw new ApiError(400, 'location query parameter is required.');
  }

  if (rawType !== undefined && typeof rawType !== 'string') {
    throw new ApiError(400, 'type query parameter must be a string.');
  }

  const location = rawLocation.trim();
  const type = typeof rawType === 'string' ? rawType.trim() : undefined;

  const accommodations = await getAccommodationsByFilters(location, type || undefined);

  if (accommodations.length === 0) {
    res.status(404).json({ error: 'No accommodations found for the given filters.' });
    return;
  }

  res.status(200).json({ data: accommodations });
}

export async function getAccommodationLocationList(_req: Request, res: Response): Promise<void> {
  const locations = await getAccommodationLocations();
  res.status(200).json({ data: locations });
}

export async function getAccommodationTypeList(_req: Request, res: Response): Promise<void> {
  const types = await getAccommodationTypes();
  res.status(200).json({ data: types });
}
