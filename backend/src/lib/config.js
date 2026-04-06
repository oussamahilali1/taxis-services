import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function parseBoolean(value, fallback = false) {
  if (value == null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseSameSite(value) {
  const normalized = String(value || 'lax').trim().toLowerCase();
  if (['lax', 'strict', 'none'].includes(normalized)) {
    return normalized;
  }

  return 'lax';
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: parseNumber(process.env.PORT, 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000'),
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
    cookieName: process.env.COOKIE_NAME || 'taxi_admin_session',
    csrfCookieName: process.env.COOKIE_CSRF_NAME || 'taxi_admin_csrf',
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSecure: parseBoolean(process.env.COOKIE_SECURE, (process.env.NODE_ENV || 'development') === 'production'),
    cookieSameSite: parseSameSite(process.env.COOKIE_SAME_SITE),
  },
  rateLimit: {
    publicWindowMs: parseNumber(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    publicMax: parseNumber(process.env.PUBLIC_RATE_LIMIT_MAX, 10),
    adminWindowMs: parseNumber(process.env.ADMIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    adminMax: parseNumber(process.env.ADMIN_RATE_LIMIT_MAX, 5),
  },
};

if (!config.auth.jwtSecret) {
  throw new Error('JWT_SECRET is required to start the backend.');
}
