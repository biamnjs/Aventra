import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Registo já existe' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Registo não encontrado' });
      return;
    }
  }

  if (err instanceof Error) {
    const cause = (err as Error & { cause?: { code?: string } }).cause;
    if (cause?.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
      res.status(503).json({ success: false, error: 'Proxy Eter inacessível — verifica o túnel SSH (porta 4099)' });
      return;
    }
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }

  res.status(500).json({ success: false, error: 'Erro desconhecido' });
}
