import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PlaylistType } from '@prisma/client';
import { AuthRequest } from '../types';
import * as playlistService from '../services/playlist.service';

const createSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(PlaylistType),
  tripId: z.string().optional(),
  songs: z.array(z.unknown()),
});

export async function createPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const playlist = await playlistService.createPlaylist(req.userId!, data);
    res.status(201).json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function getUserPlaylists(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const playlists = await playlistService.getUserPlaylists(req.userId!);
    res.json({ success: true, data: playlists });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylistById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const playlist = await playlistService.getPlaylistById(req.params['id'] as string, req.userId!);
    res.json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function deletePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await playlistService.deletePlaylist(req.params['id'] as string, req.userId!);
    res.json({ success: true, message: 'Playlist eliminada com sucesso' });
  } catch (err) {
    next(err);
  }
}
