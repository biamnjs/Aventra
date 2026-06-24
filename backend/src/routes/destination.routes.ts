import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', destinationController.listDestinations);
router.get('/featured', destinationController.getFeaturedDestinations);
router.get('/search', destinationController.searchDestinations);
router.get('/:id', destinationController.getDestinationById);
router.post('/', authenticate, destinationController.createDestination);

export default router;
