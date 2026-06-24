import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.patch('/profile', userController.updateProfile);
router.get('/traveler-profile', userController.getTravelerProfile);
router.post('/traveler-profile', userController.saveTravelerProfile);
router.get('/notifications', userController.getNotifications);
router.patch('/notifications/:id/read', userController.markNotificationRead);

export default router;
