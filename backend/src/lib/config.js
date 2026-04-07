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

function parseDurationMs(value, fallback) {
  if (value == null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (/^\d+$/.test(normalized)) {
    return Number.parseInt(normalized, 10);
  }

  const match = normalized.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    return fallback;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multiplierByUnit = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multiplierByUnit[unit];
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

function parseCaptchaMode(value) {
  const normalized = String(value || 'off').trim().toLowerCase();
  if (['off', 'optional', 'required'].includes(normalized)) {
    return normalized;
  }

  return 'off';
}

function parseCaptchaProvider(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['turnstile', 'hcaptcha'].includes(normalized)) {
    return normalized;
  }

  return '';
}

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

export const config = {
  env,
  isProduction,
  port: parseNumber(process.env.PORT, 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000'),
  auth: {
    cookieName: process.env.COOKIE_NAME || 'taxi_admin_session',
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSecure: parseBoolean(process.env.COOKIE_SECURE, isProduction),
    cookieSameSite: parseSameSite(process.env.COOKIE_SAME_SITE),
    csrfHeaderName: 'x-csrf-token',
    sessionAbsoluteTtlMs: parseDurationMs(process.env.ADMIN_SESSION_ABSOLUTE_TTL_MS, 12 * 60 * 60 * 1000),
    sessionIdleTtlMs: parseDurationMs(process.env.ADMIN_SESSION_IDLE_TTL_MS, 2 * 60 * 60 * 1000),
    sessionTouchAfterMs: parseDurationMs(process.env.ADMIN_SESSION_TOUCH_AFTER_MS, 5 * 60 * 1000),
  },
  rateLimit: {
    publicWindowMs: parseDurationMs(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    publicMax: parseNumber(process.env.PUBLIC_RATE_LIMIT_MAX, 10),
    publicFingerprintMax: parseNumber(process.env.PUBLIC_FINGERPRINT_RATE_LIMIT_MAX, 6),
    adminWindowMs: parseDurationMs(process.env.ADMIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    adminIpMax: parseNumber(process.env.ADMIN_IP_RATE_LIMIT_MAX, 8),
    adminPrincipalMax: parseNumber(process.env.ADMIN_PRINCIPAL_RATE_LIMIT_MAX, 5),
  },
  abuse: {
    duplicateWindowMs: parseDurationMs(process.env.PUBLIC_DUPLICATE_WINDOW_MS, 10 * 60 * 1000),
    captchaMode: parseCaptchaMode(process.env.PUBLIC_CAPTCHA_MODE),
    captchaProvider: parseCaptchaProvider(process.env.PUBLIC_CAPTCHA_PROVIDER),
    captchaSecret: process.env.PUBLIC_CAPTCHA_SECRET || '',
  },
  maintenance: {
    cleanupIntervalMs: parseDurationMs(process.env.MAINTENANCE_CLEANUP_INTERVAL_MS, 30 * 60 * 1000),
    rateLimitBucketRetentionMs: parseDurationMs(process.env.RATE_LIMIT_BUCKET_RETENTION_MS, 2 * 24 * 60 * 60 * 1000),
  },
};

if (config.auth.cookieSameSite === 'none' && !config.auth.cookieSecure) {
  throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true.');
}

if (config.isProduction && !config.auth.cookieSecure) {
  throw new Error('COOKIE_SECURE must be true in production.');
}

if (config.isProduction && config.corsOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be configured in production.');
}

if (config.abuse.captchaMode !== 'off' && (!config.abuse.captchaProvider || !config.abuse.captchaSecret)) {
  throw new Error('PUBLIC_CAPTCHA_PROVIDER and PUBLIC_CAPTCHA_SECRET are required when PUBLIC_CAPTCHA_MODE is enabled.');
}
