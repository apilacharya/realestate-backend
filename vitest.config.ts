import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
      JWT_SECRET: 'test-jwt-secret-key',
      COOKIE_SECRET: 'test-cookie-secret-key',
      NODE_ENV: 'test',
    },
  },
});
