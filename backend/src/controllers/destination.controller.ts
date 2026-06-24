import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as destinationService from '../services/destination.service';

export async function listDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const country = req.query['country'] as string | undefined;
    const climate = req.query['climate'] as string | undefined;
    const tags = req.query['tags'] as string | undefined;
    const destinations = await destinationService.listDestinations({
      country,
      climate,
      tags: tags ? tags.split(',') : undefined,
    });
    res.json({ success: true, data: destinations });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedDestinations(_req: Request, res: Response, next: NextFunction) {
  try {
    const destinations = await destinationService.getFeaturedDestinations();
    res.json({ success: true, data: destinations });
  } catch (err) {
    next(err);
  }
}

export async function getDestinationById(req: Request, res: Response, next: NextFunction) {
  try {
    const destination = await destinationService.getDestinationById(req.params['id'] as string);
    res.json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
}

export async function searchDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query['q'] as string | undefined;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: 'Parâmetro de pesquisa obrigatório' });
      return;
    }
    const destinations = await destinationService.searchDestinations(q);
    res.json({ success: true, data: destinations });
  } catch (err) {
    next(err);
  }
}

export async function createDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      name: z.string().min(1),
      country: z.string().min(1),
      description: z.string().min(1),
      imageUrl: z.string().url().optional(),
      climate: z.string().optional(),
      tags: z.array(z.string()).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      featured: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const destination = await destinationService.createDestination(data);
    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
}
