import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PlaylistType } from '@prisma/client';
import { AuthRequest } from '../types';
import * as aiService from '../services/ai.service';
import * as userService from '../services/user.service';
import * as playlistService from '../services/playlist.service';
import { enrichSongs } from '../services/lastfm.service';

export async function getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getTravelerProfile(req.userId!);
    if (!profile) {
      res.status(400).json({ success: false, error: 'Completa o teu perfil de viajante primeiro' });
      return;
    }
    const recommendations = await aiService.recommendDestinations(profile);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
}

export async function generateItinerary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      destination: z.string().min(1),
      days: z.number().int().min(1).max(30),
    });

    const { destination, days } = schema.parse(req.body);
    const profile = await userService.getTravelerProfile(req.userId!);
    const itinerary = await aiService.generateItinerary(destination, days, profile ?? {});
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
}

export async function generatePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      destination: z.string().min(1),
      type: z.nativeEnum(PlaylistType),
      genres: z.array(z.string()).min(1).optional(),
      tripId: z.string().optional(),
    });

    const { destination, type, genres, tripId } = schema.parse(req.body);
    const profile = await userService.getTravelerProfile(req.userId!);
    const musicGenres = genres?.length ? genres : (profile?.musicGenres ?? ['pop', 'indie']);

    const result = await aiService.generatePlaylist(destination, musicGenres, type) as { name: string; description: string; songs: Array<{ title: string; artist: string; [key: string]: unknown }> };

    const enrichedSongs = await enrichSongs(result.songs);

    const playlist = await playlistService.createPlaylist(req.userId!, {
      name: result.name,
      type,
      tripId,
      songs: enrichedSongs,
    });

    res.status(201).json({ success: true, data: { playlist, description: result.description } });
  } catch (err) {
    next(err);
  }
}

export async function generateInstagramContent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      destination: z.string().min(1),
      activityDescription: z.string().min(1),
    });

    const { destination, activityDescription } = schema.parse(req.body);
    const content = await aiService.generateInstagramContent(destination, activityDescription);
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function chat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      message: z.string().min(1).max(1000),
      destination: z.string().optional(),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    });

    const { message, destination, history } = schema.parse(req.body);
    const profile = await userService.getTravelerProfile(req.userId!);

    const reply = await aiService.chatWithAssistant(
      message,
      { destination, profile: profile ?? undefined },
      history ?? []
    );

    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
}

export async function determineTravelerType(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getTravelerProfile(req.userId!);
    if (!profile) {
      res.status(400).json({ success: false, error: 'Perfil não encontrado' });
      return;
    }
    const travelerType = await aiService.determineTravelerType(profile);
    await userService.saveTravelerProfile(req.userId!, { travelerType });
    res.json({ success: true, data: { travelerType } });
  } catch (err) {
    next(err);
  }
}
