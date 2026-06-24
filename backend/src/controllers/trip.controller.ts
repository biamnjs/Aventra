import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { TripStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import * as tripService from '../services/trip.service';

const createTripSchema = z.object({
  destinationId: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  notes: z.string().optional(),
});

export async function createTrip(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createTripSchema.parse(req.body);
    const trip = await tripService.createTrip(req.userId!, data);
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function getUserTrips(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trips = await tripService.getUserTrips(req.userId!);
    res.json({ success: true, data: trips });
  } catch (err) {
    next(err);
  }
}

export async function getTripById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getTripById(req.params['id'] as string, req.userId!);
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      title: z.string().min(1).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      status: z.nativeEnum(TripStatus).optional(),
      budget: z.number().positive().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const trip = await tripService.updateTrip(req.params['id'] as string, req.userId!, data);
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tripService.deleteTrip(req.params['id'] as string, req.userId!);
    res.json({ success: true, message: 'Viagem eliminada com sucesso' });
  } catch (err) {
    next(err);
  }
}

export async function saveItinerary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      days: z.array(z.object({
        dayNumber: z.number().int().positive(),
        activities: z.array(z.unknown()),
      })),
    });

    const { days } = schema.parse(req.body);
    const itinerary = await tripService.saveItinerary(req.params['id'] as string, req.userId!, days);
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
}
