import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', favoriteController.getUserFavorites);
router.get('/check', favoriteController.checkFavorite);
router.post('/toggle', favoriteController.toggleFavorite);

export default router;
