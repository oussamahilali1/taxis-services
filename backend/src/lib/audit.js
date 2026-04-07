import crypto from 'node:crypto';
import { sanitizeText } from './sanitize.js';

export function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function getUserAgent(req) {
  return sanitizeText(req.get('user-agent'), { maxLength: 255 }) || 'unknown';
}

export function hashAuditValue(value) {
  const normalized = sanitizeText(value, { maxLength: 512 })?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export function buildAuditContext(req, extra = {}) {
  return {
    requestId: req.requestId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    ...extra,
  };
}

export function logAuditEvent(event, details = {}) {
  console.info(
    JSON.stringify({
      type: 'audit',
      timestamp: new Date().toISOString(),
      event,
      ...details,
    })
  );
}
