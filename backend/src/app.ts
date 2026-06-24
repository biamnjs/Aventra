import express from 'express';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { helmetConfig, corsConfig, sanitizeInput } from './middleware/security.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';

const app = express();

app.use(helmetConfig);
app.use(corsConfig);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use(generalRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'aventra-api', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

if (env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
