import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodSchema, target: RequestTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: formatErrors(result.error),
      });
      return;
    }

    // substitui pelo valor parseado/coercido
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}

function formatErrors(err: ZodError): Record<string, string[]> {
  return err.flatten().fieldErrors as Record<string, string[]>;
}

// schemas reutilizáveis comuns
import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'ID inválido'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Palavra-passe obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Palavra-passe deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
});

export const createTripSchema = z.object({
  destinationId: z.string().min(1, 'Destino obrigatório'),
  title: z.string().min(1, 'Título obrigatório').max(200),
  startDate: z.string().datetime({ message: 'Data de partida inválida' }).optional(),
  endDate: z.string().datetime({ message: 'Data de regresso inválida' }).optional(),
  budget: z.number().positive('Orçamento deve ser positivo').optional(),
  notes: z.string().max(2000).optional(),
}).refine(
  (d) => !d.startDate || !d.endDate || new Date(d.endDate) >= new Date(d.startDate),
  { message: 'Data de regresso deve ser posterior à data de partida', path: ['endDate'] },
);

export const updateTripSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['PLANNING', 'BOOKED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  budget: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
}).refine(
  (d) => !d.startDate || !d.endDate || new Date(d.endDate) >= new Date(d.startDate),
  { message: 'Data de regresso deve ser posterior à data de partida', path: ['endDate'] },
);

export const chatSchema = z.object({
  message: z.string().min(1, 'Mensagem obrigatória').max(1000, 'Mensagem demasiado longa'),
  destination: z.string().max(200).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(20, 'Histórico demasiado longo').optional(),
});

export const destinationQuerySchema = z.object({
  country: z.string().max(100).optional(),
  climate: z.enum(['tropical', 'temperado', 'árido', 'frio']).optional(),
  tags: z.string().max(500).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Pesquisa deve ter pelo menos 2 caracteres').max(200),
});
