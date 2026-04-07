import { config } from '../lib/config.js';
import { HttpError } from '../lib/http-error.js';
import {
  clearAdminSessionCookie,
  getAdminSessionByToken,
  touchAdminSession,
} from '../services/auth.service.js';

export async function requireAdminAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[config.auth.cookieName];

    if (!sessionToken) {
      throw new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required.');
    }

    let session = await getAdminSessionByToken(sessionToken);
    if (!session) {
      clearAdminSessionCookie(res);
      throw new HttpError(401, 'INVALID_AUTH', 'Your session is invalid or has expired.');
    }

    session = await touchAdminSession(session);
    req.admin = session.admin;
    req.adminSession = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdminRole(...allowedRoles) {
  return function enforceAdminRole(req, _res, next) {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return next(new HttpError(403, 'FORBIDDEN', 'You are not allowed to perform this action.'));
    }

    return next();
  };
}

export function requireCsrfToken(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const providedToken = String(req.headers[config.auth.csrfHeaderName] || '').trim();
  const expectedToken = req.adminSession?.csrfToken;

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return next(new HttpError(403, 'INVALID_CSRF_TOKEN', 'A valid CSRF token is required.'));
  }

  return next();
}
