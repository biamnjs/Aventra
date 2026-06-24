import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, chatSchema } from '../middleware/validation.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.get('/recommendations', aiController.getRecommendations);
router.post('/itinerary', aiController.generateItinerary);
router.post('/playlist', aiController.generatePlaylist);
router.post('/instagram', aiController.generateInstagramContent);
router.post('/chat', validate(chatSchema), aiController.chat);
router.post('/traveler-type', aiController.determineTravelerType);

export default router;
