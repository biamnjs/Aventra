import { Router } from 'express';
import * as playlistController from '../controllers/playlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, idParamSchema } from '../middleware/validation.middleware';
import { requireOwnership } from '../middleware/ownership.middleware';

const router = Router();

router.use(authenticate);

router.get('/', playlistController.getUserPlaylists);
router.post('/', playlistController.createPlaylist);
router.get('/:id', validate(idParamSchema, 'params'), playlistController.getPlaylistById);
router.delete('/:id', validate(idParamSchema, 'params'), requireOwnership('playlist'), playlistController.deletePlaylist);

export default router;
