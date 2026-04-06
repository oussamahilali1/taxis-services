import rateLimit from 'express-rate-limit';
import { config } from '../lib/config.js';

function jsonRateLimitHandler(req, res, _next, options) {
  res.status(options.statusCode).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP. Please try again in a few minutes.',
    },
  });
}

export const publicSubmissionLimiter = rateLimit({
  windowMs: config.rateLimit.publicWindowMs,
  limit: config.rateLimit.publicMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const adminLoginLimiter = rateLimit({
  windowMs: config.rateLimit.adminWindowMs,
  limit: config.rateLimit.adminMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonRateLimitHandler,
});
