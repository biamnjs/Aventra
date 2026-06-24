import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as userService from '../services/user.service';

const profileSchema = z.object({
  budget: z.number().positive().optional(),
  accommodationType: z.enum(['hotel', 'hostel', 'airbnb', 'resort', 'glamping', 'qualquer']).optional(),
  favoriteCountries: z.array(z.string()).optional(),
  musicGenres: z.array(z.string()).optional(),
  foodStyle: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  climateType: z.enum(['tropical', 'frio', 'temperado', 'árido', 'qualquer']).optional(),
  travelFrequency: z.enum(['mensal', 'trimestral', 'semestral', 'anual']).optional(),
  travelStyle: z.enum(['praia', 'cidade', 'natureza', 'misto']).optional(),
  photography: z.boolean().optional(),
  socialMedia: z.boolean().optional(),
  adventureLevel: z.enum(['aventura', 'conforto', 'equilibrado']).optional(),
  travelerType: z.string().optional(),
});

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({ name: z.string().min(2).optional(), avatar: z.string().url().optional() }).parse(req.body);
    const user = await userService.updateProfile(req.userId!, data);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function saveTravelerProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = profileSchema.parse(req.body);
    const profile = await userService.saveTravelerProfile(req.userId!, data);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getTravelerProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getTravelerProfile(req.userId!);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await userService.getNotifications(req.userId!);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params['id'] as string;
    await userService.markNotificationRead(id, req.userId!);
    res.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (err) {
    next(err);
  }
}
