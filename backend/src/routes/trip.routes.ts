import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', tripController.getUserTrips);
router.post('/', tripController.createTrip);
router.get('/:id', tripController.getTripById);
router.patch('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.post('/:id/itinerary', tripController.saveItinerary);

export default router;
