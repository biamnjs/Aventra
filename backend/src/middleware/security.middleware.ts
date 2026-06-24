import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { filterXSS } from 'xss';
import { env } from '../config/env';

const isHttps = env.FRONTEND_URL?.startsWith('https');

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  // desativa HSTS em HTTP (só ativar com HTTPS real)
  strictTransportSecurity: isHttps ? { maxAge: 31536000, includeSubDomains: true } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
});

export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowed = [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3001'];
    // sem origin = mesmo servidor; allowed = origins conhecidos; callback(null,false) = sem CORS headers (não 500)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'Retry-After'],
});

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return filterXSS(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeValue(v)]),
    );
  }
  return value;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as typeof req.query;
  next();
}
