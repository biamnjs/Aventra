export const env = {
  NODE_ENV: 'test',
  PORT: 3001,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret-at-least-32-chars-long!!',
  JWT_EXPIRES_IN: '7d',
  FRONTEND_URL: 'http://localhost:5173',
  CLAUDE_BASE_URL: 'http://localhost:4099/v1',
  CLAUDE_API_KEY: 'dummy',
  CLAUDE_MODEL: 'claude-sonnet-4-6',
  LASTFM_API_KEY: undefined,
  GOOGLE_MAPS_API_KEY: undefined,
  WEATHER_API_KEY: undefined,
};
