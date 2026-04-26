import { Router } from 'express';
import { getProfile, getProfileTrips, saveProfile } from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { updateProfileSchema } from '../validators/profileSchemas';

const profileRouter = Router();

profileRouter.get('/profile', requireAuth, (req, res, next) => {
  getProfile(req, res).catch(next);
});

profileRouter.put('/profile', requireAuth, validateBody(updateProfileSchema), (req, res, next) => {
  saveProfile(req, res).catch(next);
});

profileRouter.get('/profile/trips', requireAuth, (req, res, next) => {
  getProfileTrips(req, res).catch(next);
});

export { profileRouter };
