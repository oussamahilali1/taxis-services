import crypto from 'node:crypto';
import { config } from '../lib/config.js';
import { getClientIp } from '../lib/audit.js';
import { prisma } from '../lib/prisma.js';
import { sanitizeEmail, sanitizePhone, sanitizeText } from '../lib/sanitize.js';

function hashIdentifier(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getWindowStart(windowMs) {
  const now = Date.now();
  const aligned = Math.floor(now / windowMs) * windowMs;
  return new Date(aligned);
}

async function consumeRateLimitBucket({ scope, identifier, windowMs }) {
  const windowStart = getWindowStart(windowMs);
  const identifierHash = hashIdentifier(identifier);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      scope_identifierHash_windowStart: {
        scope,
        identifierHash,
        windowStart,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      scope,
      identifierHash,
      windowStart,
    },
    select: {
      count: true,
    },
  });

  return {
    count: bucket.count,
    resetAt: new Date(windowStart.getTime() + windowMs),
  };
}

function setRateLimitHeaders(res, { limit, count, resetAt, windowMs }) {
  const remaining = Math.max(limit - count, 0);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));

  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(remaining));
  res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt.getTime() / 1000)));
  res.setHeader('RateLimit-Policy', `${limit};w=${Math.ceil(windowMs / 1000)}`);
  if (remaining === 0) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
  }
}

function buildRateLimitError(message) {
  return {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message,
    },
  };
}

function createRateLimitMiddleware({ scope, windowMs, limit, keyGenerator, message }) {
  return async function rateLimitMiddleware(req, res, next) {
    try {
      const identifier = keyGenerator(req);
      if (!identifier) {
        return next();
      }

      const result = await consumeRateLimitBucket({
        scope,
        identifier,
        windowMs,
      });

      setRateLimitHeaders(res, {
        limit,
        count: result.count,
        resetAt: result.resetAt,
        windowMs,
      });

      if (result.count > limit) {
        return res.status(429).json(buildRateLimitError(message));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function getNormalizedAdminPrincipal(req) {
  return sanitizeEmail(req.body?.email);
}

function getPublicSubmissionFingerprint(req) {
  const email = sanitizeEmail(req.body?.email ?? req.body?.contactQuick ?? req.body?.contact_quick);
  const phone = sanitizePhone(req.body?.phone ?? req.body?.contactQuick ?? req.body?.contact_quick);
  const pickup = sanitizeText(req.body?.pickupLocation ?? req.body?.pickup, { maxLength: 120 });
  const subject = sanitizeText(req.body?.subject ?? req.body?.service, { maxLength: 120 });
  const fingerprintParts = [req.path, email, phone, pickup, subject].filter(Boolean);

  return fingerprintParts.length >= 2 ? fingerprintParts.join('|') : undefined;
}

const adminLoginIpLimiter = createRateLimitMiddleware({
  scope: 'admin-login-ip',
  windowMs: config.rateLimit.adminWindowMs,
  limit: config.rateLimit.adminIpMax,
  keyGenerator(req) {
    return getClientIp(req);
  },
  message: 'Too many admin login attempts. Please try again in a few minutes.',
});

const adminLoginPrincipalLimiter = createRateLimitMiddleware({
  scope: 'admin-login-principal',
  windowMs: config.rateLimit.adminWindowMs,
  limit: config.rateLimit.adminPrincipalMax,
  keyGenerator(req) {
    return getNormalizedAdminPrincipal(req);
  },
  message: 'Too many admin login attempts. Please try again in a few minutes.',
});

const publicSubmissionIpLimiter = createRateLimitMiddleware({
  scope: 'public-submission-ip',
  windowMs: config.rateLimit.publicWindowMs,
  limit: config.rateLimit.publicMax,
  keyGenerator(req) {
    return getClientIp(req);
  },
  message: 'Too many requests from this IP. Please try again in a few minutes.',
});

const publicSubmissionFingerprintLimiter = createRateLimitMiddleware({
  scope: 'public-submission-fingerprint',
  windowMs: config.rateLimit.publicWindowMs,
  limit: config.rateLimit.publicFingerprintMax,
  keyGenerator(req) {
    return getPublicSubmissionFingerprint(req);
  },
  message: 'Too many similar submissions were received. Please wait a few minutes before trying again.',
});

export const publicSubmissionLimiter = [publicSubmissionIpLimiter, publicSubmissionFingerprintLimiter];
export const adminLoginLimiter = [adminLoginIpLimiter, adminLoginPrincipalLimiter];
