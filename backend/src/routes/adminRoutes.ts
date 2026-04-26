import { Router } from 'express';
import {
  blockAdminClient,
  createAdminAccommodation,
  editAdminAccommodation,
  getAdminAccommodations,
  getAdminClients,
  removeAdminAccommodation,
  removeAdminClient,
  unblockAdminClient,
  updateAdminClient
} from '../controllers/adminController';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { updateAccommodationByAdminSchema, updateClientByAdminSchema } from '../validators/adminSchemas';

const adminRouter = Router();

adminRouter.get('/admin/clients', requireAuth, requireAdmin, (req, res, next) => {
  getAdminClients(req, res).catch(next);
});

adminRouter.put('/admin/clients/:userID', requireAuth, requireAdmin, validateBody(updateClientByAdminSchema), (req, res, next) => {
  updateAdminClient(req, res).catch(next);
});

adminRouter.patch('/admin/clients/:userID/block', requireAuth, requireAdmin, (req, res, next) => {
  blockAdminClient(req, res).catch(next);
});

adminRouter.patch('/admin/clients/:userID/unblock', requireAuth, requireAdmin, (req, res, next) => {
  unblockAdminClient(req, res).catch(next);
});

adminRouter.delete('/admin/clients/:userID', requireAuth, requireAdmin, (req, res, next) => {
  removeAdminClient(req, res).catch(next);
});

adminRouter.get('/admin/accommodations', requireAuth, requireAdmin, (req, res, next) => {
  getAdminAccommodations(req, res).catch(next);
});

adminRouter.post('/admin/accommodations', requireAuth, requireAdmin, validateBody(updateAccommodationByAdminSchema), (req, res, next) => {
  createAdminAccommodation(req, res).catch(next);
});

adminRouter.put('/admin/accommodations/:accID', requireAuth, requireAdmin, validateBody(updateAccommodationByAdminSchema), (req, res, next) => {
  editAdminAccommodation(req, res).catch(next);
});

adminRouter.delete('/admin/accommodations/:accID', requireAuth, requireAdmin, (req, res, next) => {
  removeAdminAccommodation(req, res).catch(next);
});

export { adminRouter };
