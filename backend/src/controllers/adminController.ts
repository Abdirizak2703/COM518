import { Request, Response } from 'express';
import {
  createAccommodationByAdmin,
  deleteAccommodationByAdmin,
  deleteClientByAdmin,
  getAdminActorFlags,
  getClientForAdmin,
  listAccommodationsForAdmin,
  listClientsForAdmin,
  saveClientProfileFromAdmin,
  setClientBlockedStatus,
  updateAccommodationByAdmin
} from '../dao/adminDao';
import { ApiError } from '../middleware/apiError';

interface UpdateClientPayload {
  username: string;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}

interface UpdateAccommodationPayload {
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}

function parseUserId(rawId: string): number {
  const userId = Number(rawId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'Invalid user id.');
  }

  return userId;
}

function parseAccommodationId(rawId: string): number {
  const accID = Number(rawId);
  if (!Number.isInteger(accID) || accID <= 0) {
    throw new ApiError(400, 'Invalid accommodation id.');
  }

  return accID;
}

async function assertCanModerateTarget(actorUserID: number, targetUserID: number): Promise<void> {
  const actor = await getAdminActorFlags(actorUserID);
  if (!actor || !actor.admin) {
    throw new ApiError(403, 'Admin access is required for this action.');
  }

  const target = await getClientForAdmin(targetUserID);
  if (!target) {
    throw new ApiError(404, 'Client not found.');
  }

  if (target.admin && !actor.superAdmin) {
    throw new ApiError(403, 'Only a super-admin can moderate another admin account.');
  }
}

export async function getAdminClients(_req: Request, res: Response): Promise<void> {
  const clients = await listClientsForAdmin();
  res.status(200).json({ clients });
}

export async function updateAdminClient(req: Request, res: Response): Promise<void> {
  const userID = parseUserId(req.params.userID ?? '');
  const payload = req.body as UpdateClientPayload;

  const updated = await saveClientProfileFromAdmin({
    userID,
    username: payload.username,
    fullName: payload.fullName,
    phone: payload.phone,
    homeCity: payload.homeCity,
    bio: payload.bio
  });

  if (!updated) {
    throw new ApiError(404, 'Client not found.');
  }

  res.status(200).json({ client: updated });
}

export async function blockAdminClient(req: Request, res: Response): Promise<void> {
  const userID = parseUserId(req.params.userID ?? '');
  const actorUserID = req.session.user?.id;

  if (!actorUserID) {
    throw new ApiError(401, 'You must be logged in to perform this action.');
  }

  if (actorUserID === userID) {
    throw new ApiError(400, 'You cannot block your own admin account.');
  }

  await assertCanModerateTarget(actorUserID, userID);

  const updated = await setClientBlockedStatus(userID, true);
  if (!updated) {
    throw new ApiError(404, 'Client not found.');
  }

  res.status(200).json({ client: updated });
}

export async function unblockAdminClient(req: Request, res: Response): Promise<void> {
  const userID = parseUserId(req.params.userID ?? '');
  const actorUserID = req.session.user?.id;
  if (!actorUserID) {
    throw new ApiError(401, 'You must be logged in to perform this action.');
  }

  await assertCanModerateTarget(actorUserID, userID);

  const updated = await setClientBlockedStatus(userID, false);
  if (!updated) {
    throw new ApiError(404, 'Client not found.');
  }

  res.status(200).json({ client: updated });
}

export async function removeAdminClient(req: Request, res: Response): Promise<void> {
  const userID = parseUserId(req.params.userID ?? '');
  const actorUserID = req.session.user?.id;

  if (!actorUserID) {
    throw new ApiError(401, 'You must be logged in to perform this action.');
  }

  if (actorUserID === userID) {
    throw new ApiError(400, 'You cannot delete your own admin account.');
  }

  await assertCanModerateTarget(actorUserID, userID);

  const deleted = await deleteClientByAdmin(userID);
  if (!deleted) {
    throw new ApiError(404, 'Client not found.');
  }

  res.status(204).send();
}

export async function getAdminAccommodations(_req: Request, res: Response): Promise<void> {
  const accommodations = await listAccommodationsForAdmin();
  res.status(200).json({ accommodations });
}

export async function createAdminAccommodation(req: Request, res: Response): Promise<void> {
  const payload = req.body as UpdateAccommodationPayload;
  const created = await createAccommodationByAdmin({
    name: payload.name,
    type: payload.type,
    location: payload.location,
    roomsTotal: payload.roomsTotal,
    images: payload.images
  });

  res.status(201).json({ accommodation: created });
}

export async function editAdminAccommodation(req: Request, res: Response): Promise<void> {
  const accID = parseAccommodationId(req.params.accID ?? '');
  const payload = req.body as UpdateAccommodationPayload;

  const updated = await updateAccommodationByAdmin({
    id: accID,
    name: payload.name,
    type: payload.type,
    location: payload.location,
    roomsTotal: payload.roomsTotal,
    images: payload.images
  });

  if (!updated) {
    throw new ApiError(404, 'Accommodation not found.');
  }

  res.status(200).json({ accommodation: updated });
}

export async function removeAdminAccommodation(req: Request, res: Response): Promise<void> {
  const accID = parseAccommodationId(req.params.accID ?? '');
  const deleted = await deleteAccommodationByAdmin(accID);
  if (!deleted) {
    throw new ApiError(404, 'Accommodation not found.');
  }

  res.status(204).send();
}
