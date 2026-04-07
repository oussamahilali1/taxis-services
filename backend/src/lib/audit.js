import crypto from 'node:crypto';
import { sanitizeText } from './sanitize.js';

function normalizeIp(value) {
  const normalized = sanitizeText(value, { maxLength: 120 }) || 'unknown';
  return normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
}

export function getClientIp(req) {
  return normalizeIp(req.ip || req.socket?.remoteAddress || '');
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
