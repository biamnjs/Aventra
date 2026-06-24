import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, idParamSchema, createTripSchema, updateTripSchema, paginationSchema } from '../middleware/validation.middleware';
import { requireOwnership } from '../middleware/ownership.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validate(paginationSchema, 'query'), tripController.getUserTrips);
router.post('/', validate(createTripSchema), tripController.createTrip);
router.get('/:id', validate(idParamSchema, 'params'), tripController.getTripById);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateTripSchema), requireOwnership('trip'), tripController.updateTrip);
router.delete('/:id', validate(idParamSchema, 'params'), requireOwnership('trip'), tripController.deleteTrip);
router.post('/:id/itinerary', validate(idParamSchema, 'params'), requireOwnership('trip'), tripController.saveItinerary);

export default router;
