import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { config } from '../lib/config.js';

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: config.auth.cookieSameSite,
    domain: config.auth.cookieDomain,
    path: '/',
  };
}

export function signAdminToken(admin) {
  return jwt.sign(
    {
      role: admin.role,
    },
    config.auth.jwtSecret,
    {
      subject: admin.id,
      expiresIn: config.auth.jwtExpiresIn,
    }
  );
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch (_error) {
    throw new HttpError(401, 'INVALID_AUTH', 'Your session is invalid or has expired.');
  }
}

export function createCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function setAdminAuthCookies(res, token, csrfToken) {
  res.cookie(config.auth.cookieName, token, {
    ...buildCookieOptions(),
    maxAge: 1000 * 60 * 60 * 12,
  });

  res.cookie(config.auth.csrfCookieName, csrfToken, {
    ...buildCookieOptions(),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 12,
  });
}

export function clearAdminAuthCookies(res) {
  res.clearCookie(config.auth.cookieName, buildCookieOptions());
  res.clearCookie(config.auth.csrfCookieName, {
    ...buildCookieOptions(),
    httpOnly: false,
  });
}

export async function authenticateAdminCredentials(email, password) {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new HttpError(401, 'INVALID_LOGIN', 'Les identifiants fournis sont invalides.');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    throw new HttpError(401, 'INVALID_LOGIN', 'Les identifiants fournis sont invalides.');
  }

  return prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}
