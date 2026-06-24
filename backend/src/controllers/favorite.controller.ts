import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { FavoriteType } from '@prisma/client';
import { AuthRequest } from '../types';
import * as favoriteService from '../services/favorite.service';

const toggleSchema = z.object({
  type: z.nativeEnum(FavoriteType),
  referenceId: z.string().trim().min(1),
  metadata: z.record(z.unknown()).optional(),
});

const checkQuerySchema = z.object({
  type: z.nativeEnum(FavoriteType, { message: 'Tipo de favorito inválido' }),
  referenceId: z.string().trim().min(1, 'referenceId obrigatório'),
});

const listQuerySchema = z.object({
  type: z.nativeEnum(FavoriteType).optional(),
});

export async function toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type, referenceId, metadata } = toggleSchema.parse(req.body);
    const result = await favoriteService.toggleFavorite(req.userId!, type, referenceId, metadata);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUserFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type } = listQuerySchema.parse(req.query);
    const favorites = await favoriteService.getUserFavorites(req.userId!, type);
    res.json({ success: true, data: favorites });
  } catch (err) {
    next(err);
  }
}

export async function checkFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type, referenceId } = checkQuerySchema.parse(req.query);
    const favorited = await favoriteService.isFavorited(req.userId!, type, referenceId);
    res.json({ success: true, data: { favorited } });
  } catch (err) {
    next(err);
  }
}
