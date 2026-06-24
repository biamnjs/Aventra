import { Router } from 'express';
import * as playlistController from '../controllers/playlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', playlistController.getUserPlaylists);
router.post('/', playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylistById);
router.delete('/:id', playlistController.deletePlaylist);

export default router;
