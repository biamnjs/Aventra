import { Router } from 'express';
import * as destinationController from '../controllers/destination.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, idParamSchema, destinationQuerySchema, searchQuerySchema } from '../middleware/validation.middleware';
import { searchRateLimiter, authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', validate(destinationQuerySchema, 'query'), destinationController.listDestinations);
router.get('/featured', destinationController.getFeaturedDestinations);
router.get('/search', searchRateLimiter, validate(searchQuerySchema, 'query'), destinationController.searchDestinations);
router.get('/:id', validate(idParamSchema, 'params'), destinationController.getDestinationById);
router.get('/:id/visa', validate(idParamSchema, 'params'), destinationController.getDestinationVisaInfo);
// criação limitada: apenas utilizadores autenticados, com rate limit
router.post('/', authenticate, authRateLimiter, destinationController.createDestination);

export default router;
