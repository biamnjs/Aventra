import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/recommendations', aiController.getRecommendations);
router.post('/itinerary', aiController.generateItinerary);
router.post('/playlist', aiController.generatePlaylist);
router.post('/instagram', aiController.generateInstagramContent);
router.post('/chat', aiController.chat);
router.post('/traveler-type', aiController.determineTravelerType);

export default router;
