import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';

type Resource = 'trip' | 'playlist' | 'notification';

const resourceQueries: Record<Resource, (id: string) => Promise<{ userId: string } | null>> = {
  trip: (id) => prisma.trip.findUnique({ where: { id }, select: { userId: true } }),
  playlist: (id) => prisma.playlist.findUnique({ where: { id }, select: { userId: true } }),
  notification: (id) => prisma.notification.findUnique({ where: { id }, select: { userId: true } }),
};

export function requireOwnership(resource: Resource) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'];
    const userId = req.userId!;

    if (!id) {
      res.status(400).json({ success: false, error: 'ID do recurso não fornecido' });
      return;
    }

    try {
      const record = await resourceQueries[resource](id);

      if (!record) {
        res.status(404).json({ success: false, error: 'Recurso não encontrado' });
        return;
      }

      if (record.userId !== userId) {
        res.status(403).json({ success: false, error: 'Acesso negado' });
        return;
      }

      next();
    } catch {
      res.status(500).json({ success: false, error: 'Erro ao verificar permissões' });
    }
  };
}
