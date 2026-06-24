import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Palavra-passe deve ter pelo menos 8 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Palavra-passe obrigatória'),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const result = await authService.register(name, email, password);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.message === 'Email já registado') {
      res.status(409).json({ success: false, error: err.message });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.message === 'Credenciais inválidas') {
      res.status(401).json({ success: false, error: err.message });
      return;
    }
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
