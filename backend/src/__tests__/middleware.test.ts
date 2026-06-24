import express, { Application } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { validate, loginSchema, registerSchema, idParamSchema, chatSchema } from '../middleware/validation.middleware';
import { requireOwnership } from '../middleware/ownership.middleware';
import { sanitizeInput } from '../middleware/security.middleware';
import { errorHandler, AppError } from '../middleware/error.middleware';
import { requestLogger } from '../middleware/logger.middleware';
import { prisma } from '../config/database';

const JWT_SECRET = 'test-secret-at-least-32-chars-long!!';

function makeApp(middleware: express.RequestHandler[], route?: (req: express.Request, res: express.Response) => void) {
  const app = express();
  app.use(express.json());
  middleware.forEach((m) => app.use(m));
  app.get('/test', route ?? ((_req, res) => res.json({ ok: true })));
  app.post('/test', route ?? ((_req, res) => res.json({ ok: true })));
  app.use(errorHandler);
  return app;
}

function makeToken(payload: object = { userId: 'user-1', email: 'test@test.com' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

describe('authenticate', () => {
  const app = makeApp([authenticate as express.RequestHandler]);

  it('rejects request with no Authorization header', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects malformed Authorization header', async () => {
    const res = await request(app).get('/test').set('Authorization', 'InvalidHeader');
    expect(res.status).toBe(401);
  });

  it('rejects expired token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, JWT_SECRET, { expiresIn: -1 });
    const res = await request(app).get('/test').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expirado/i);
  });

  it('rejects invalid token', async () => {
    const res = await request(app).get('/test').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inválido/i);
  });

  it('accepts valid token and sets userId', async () => {
    const token = makeToken();
    const app2 = express();
    app2.use(express.json());
    app2.use(authenticate as express.RequestHandler);
    app2.get('/test', (req: express.Request & { userId?: string }, res) => {
      res.json({ userId: req.userId });
    });
    const res = await request(app2).get('/test').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-1');
  });
});

describe('optionalAuthenticate', () => {
  it('proceeds without token and does not set userId', async () => {
    const app2 = express();
    app2.use(optionalAuthenticate as express.RequestHandler);
    app2.get('/test', (req: express.Request & { userId?: string }, res) => {
      res.json({ userId: req.userId ?? null });
    });
    const res = await request(app2).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.userId).toBeNull();
  });

  it('sets userId when valid token provided', async () => {
    const token = makeToken();
    const app2 = express();
    app2.use(optionalAuthenticate as express.RequestHandler);
    app2.get('/test', (req: express.Request & { userId?: string }, res) => {
      res.json({ userId: req.userId ?? null });
    });
    const res = await request(app2).get('/test').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-1');
  });
});

// ─── Validation Middleware ────────────────────────────────────────────────────

describe('validate — loginSchema', () => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(loginSchema), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  it('rejects missing email', async () => {
    const res = await request(app).post('/test').send({ password: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.details?.email).toBeDefined();
  });

  it('rejects invalid email format', async () => {
    const res = await request(app).post('/test').send({ email: 'notanemail', password: 'abc' });
    expect(res.status).toBe(400);
  });

  it('accepts valid credentials', async () => {
    const res = await request(app).post('/test').send({ email: 'a@b.com', password: 'pass' });
    expect(res.status).toBe(200);
  });
});

describe('validate — registerSchema', () => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(registerSchema), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  it('rejects password without uppercase', async () => {
    const res = await request(app).post('/test').send({ name: 'Ana', email: 'a@b.com', password: 'password1' });
    expect(res.status).toBe(400);
  });

  it('rejects password without number', async () => {
    const res = await request(app).post('/test').send({ name: 'Ana', email: 'a@b.com', password: 'Password' });
    expect(res.status).toBe(400);
  });

  it('rejects password shorter than 8 chars', async () => {
    const res = await request(app).post('/test').send({ name: 'Ana', email: 'a@b.com', password: 'Ab1' });
    expect(res.status).toBe(400);
  });

  it('accepts valid registration data', async () => {
    const res = await request(app).post('/test').send({ name: 'Ana', email: 'a@b.com', password: 'Password1' });
    expect(res.status).toBe(200);
  });
});

describe('validate — idParamSchema (params)', () => {
  const app = express();
  app.use(express.json());
  app.get('/items/:id', validate(idParamSchema, 'params'), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  it('rejects empty id', async () => {
    const res = await request(app).get('/items/%20');
    expect(res.status).toBe(400);
  });

  it('accepts valid id', async () => {
    const res = await request(app).get('/items/abc-123');
    expect(res.status).toBe(200);
  });
});

describe('validate — chatSchema', () => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(chatSchema), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  it('rejects empty message', async () => {
    const res = await request(app).post('/test').send({ message: '' });
    expect(res.status).toBe(400);
  });

  it('rejects message longer than 1000 chars', async () => {
    const res = await request(app).post('/test').send({ message: 'a'.repeat(1001) });
    expect(res.status).toBe(400);
  });

  it('accepts valid chat message', async () => {
    const res = await request(app).post('/test').send({ message: 'Olá!' });
    expect(res.status).toBe(200);
  });
});

// ─── Ownership Middleware ─────────────────────────────────────────────────────

describe('requireOwnership', () => {
  const mockPrismaTrip = prisma.trip.findUnique as jest.MockedFunction<typeof prisma.trip.findUnique>;

  const makeOwnershipApp = () => {
    const app = express();
    app.use(express.json());
    app.delete('/trips/:id', (req: express.Request & { userId?: string }, _res, next) => {
      req.userId = 'user-1';
      next();
    }, requireOwnership('trip') as express.RequestHandler, (_req, res) => {
      res.json({ ok: true });
    });
    app.use(errorHandler);
    return app;
  };

  it('returns 404 when resource not found', async () => {
    mockPrismaTrip.mockResolvedValueOnce(null);
    const res = await request(makeOwnershipApp()).delete('/trips/nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 403 when user does not own resource', async () => {
    mockPrismaTrip.mockResolvedValueOnce({ userId: 'other-user' } as never);
    const res = await request(makeOwnershipApp()).delete('/trips/trip-1');
    expect(res.status).toBe(403);
  });

  it('calls next when user owns resource', async () => {
    mockPrismaTrip.mockResolvedValueOnce({ userId: 'user-1' } as never);
    const res = await request(makeOwnershipApp()).delete('/trips/trip-1');
    expect(res.status).toBe(200);
  });
});

// ─── Security Middleware ──────────────────────────────────────────────────────

describe('sanitizeInput', () => {
  const app = express();
  app.use(express.json());
  app.use(sanitizeInput);
  app.post('/test', (req, res) => res.json(req.body));
  app.use(errorHandler);

  it('strips XSS from string fields', async () => {
    const res = await request(app).post('/test').send({ name: '<script>alert(1)</script>hello' });
    expect(res.status).toBe(200);
    expect(res.body.name).not.toContain('<script>');
  });

  it('sanitizes nested objects', async () => {
    const res = await request(app).post('/test').send({ user: { bio: '<img src=x onerror=alert(1)>' } });
    expect(res.status).toBe(200);
    expect(res.body.user.bio).not.toContain('onerror');
  });

  it('leaves safe content untouched', async () => {
    const res = await request(app).post('/test').send({ message: 'Olá, mundo!' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Olá, mundo!');
  });
});

// ─── Error Middleware ─────────────────────────────────────────────────────────

describe('errorHandler', () => {
  it('handles AppError with correct status and message', async () => {
    const app = express();
    app.get('/test', (_req, _res, next) => next(new AppError(422, 'Entidade inválida')));
    app.use(errorHandler);
    const res = await request(app).get('/test');
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Entidade inválida');
  });

  it('hides internals for unexpected errors (returns 500)', async () => {
    const app = express();
    app.get('/test', (_req, _res, next) => next(new Error('DB connection string leaked')));
    app.use(errorHandler);
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Erro interno do servidor');
    expect(res.body.error).not.toContain('DB connection string leaked');
  });

  it('handles ECONNREFUSED as 503', async () => {
    const app = express();
    app.get('/test', (_req, _res, next) => {
      const err = new Error('fetch failed');
      (err as Error & { cause: { code: string } }).cause = { code: 'ECONNREFUSED' };
      next(err);
    });
    app.use(errorHandler);
    const res = await request(app).get('/test');
    expect(res.status).toBe(503);
  });
});

// ─── Logger Middleware ────────────────────────────────────────────────────────

describe('requestLogger', () => {
  it('adds X-Request-Id header to response', async () => {
    const app = express();
    app.use(requestLogger);
    app.get('/test', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/test');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('passes the request through without blocking', async () => {
    const app = express();
    app.use(requestLogger);
    app.get('/test', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
  });
});
