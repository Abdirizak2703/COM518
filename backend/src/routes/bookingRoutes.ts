import { Router } from 'express';
import { createBooking } from '../controllers/bookingController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { bookingSchema } from '../validators/bookingSchemas';

const bookingRouter = Router();

bookingRouter.post('/book', requireAuth, validateBody(bookingSchema), (req, res, next) => {
  createBooking(req, res).catch(next);
});

export { bookingRouter };
