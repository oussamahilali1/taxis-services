import crypto from 'node:crypto';
import { getClientIp, getUserAgent } from '../lib/audit.js';

export function assignRequestContext(req, res, next) {
  req.requestId = crypto.randomUUID();
  req.auditContext = {
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  };
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
