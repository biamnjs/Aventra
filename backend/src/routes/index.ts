import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import destinationRoutes from './destination.routes';
import tripRoutes from './trip.routes';
import favoriteRoutes from './favorite.routes';
import playlistRoutes from './playlist.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/destinations', destinationRoutes);
router.use('/trips', tripRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/playlists', playlistRoutes);
router.use('/ai', aiRoutes);

export default router;
