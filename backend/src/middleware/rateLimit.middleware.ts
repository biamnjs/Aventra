import rateLimit from 'express-rate-limit';

const json429 = (retryAfter: number) => ({
  success: false,
  error: `Demasiadas tentativas. Tenta novamente em ${retryAfter} segundos.`,
});

// Login e registo — 10 tentativas por 15 minutos por IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(Number(res.getHeader('Retry-After') ?? 900));
    res.status(429).json(json429(retryAfter));
  },
});

// Endpoints de IA — 20 requests por minuto por utilizador
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => {
    // usa userId se autenticado, senão IP
    const authReq = req as { userId?: string };
    return authReq.userId ?? req.ip ?? 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(Number(res.getHeader('Retry-After') ?? 60));
    res.status(429).json(json429(retryAfter));
  },
});

// Pesquisa — 60 requests por minuto por IP
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(Number(res.getHeader('Retry-After') ?? 60));
    res.status(429).json(json429(retryAfter));
  },
});

// Geral — 200 requests por 15 minutos por IP
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  handler: (req, res) => {
    const retryAfter = Math.ceil(Number(res.getHeader('Retry-After') ?? 900));
    res.status(429).json(json429(retryAfter));
  },
});
