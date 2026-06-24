import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from './logger.middleware';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string | undefined;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

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
    const isProxyDown =
      cause?.code === 'ECONNREFUSED' ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('fetch failed');

    if (isProxyDown) {
      res.status(503).json({
        success: false,
        error: 'Serviço de IA temporariamente indisponível. Tente novamente em breve.',
      });
      return;
    }

    logger.error(err.message, { requestId, stack: err.stack });
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }

  logger.error('Unknown error', { requestId, err });
  res.status(500).json({ success: false, error: 'Erro desconhecido' });
}
