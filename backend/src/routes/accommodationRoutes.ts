import { Router } from 'express';
import { getAccommodationLocationList, getAccommodationTypeList, getAccommodations } from '../controllers/accommodationController';

const accommodationRouter = Router();

accommodationRouter.get('/locations', (req, res, next) => {
  getAccommodationLocationList(req, res).catch(next);
});

accommodationRouter.get('/types', (req, res, next) => {
  getAccommodationTypeList(req, res).catch(next);
});

accommodationRouter.get('/', (req, res, next) => {
  getAccommodations(req, res).catch(next);
});

export { accommodationRouter };
