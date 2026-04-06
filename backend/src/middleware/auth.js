import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { config } from '../lib/config.js';
import { verifyAdminToken } from '../services/auth.service.js';

function extractBearerToken(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return undefined;
  }

  return authorization.slice('Bearer '.length).trim();
}

export async function requireAdminAuth(req, _res, next) {
  try {
    const token = req.cookies?.[config.auth.cookieName] || extractBearerToken(req);

    if (!token) {
      throw new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required.');
    }

    const payload = verifyAdminToken(token);
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      throw new HttpError(401, 'INVALID_AUTH', 'This admin account no longer exists.');
    }

    req.admin = admin;
    req.adminToken = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireCsrfToken(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const expectedToken = req.cookies?.[config.auth.csrfCookieName];
  const providedToken = req.headers['x-csrf-token'];

  if (!expectedToken || !providedToken || expectedToken !== providedToken) {
    return next(new HttpError(403, 'INVALID_CSRF_TOKEN', 'A valid CSRF token is required.'));
  }

  return next();
}
