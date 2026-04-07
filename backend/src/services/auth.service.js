import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { config } from '../lib/config.js';

export const adminPublicSelect = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: config.auth.cookieSameSite,
    domain: config.auth.cookieDomain,
    path: '/',
  };
}

function createOpaqueToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildSessionExpirations(now = new Date()) {
  return {
    expiresAt: new Date(now.getTime() + config.auth.sessionAbsoluteTtlMs),
    idleExpiresAt: new Date(now.getTime() + config.auth.sessionIdleTtlMs),
  };
}

export function setAdminSessionCookie(res, sessionToken) {
  res.cookie(config.auth.cookieName, sessionToken, {
    ...buildCookieOptions(),
    maxAge: config.auth.sessionAbsoluteTtlMs,
  });
}

export function clearAdminSessionCookie(res) {
  res.clearCookie(config.auth.cookieName, buildCookieOptions());
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
    select: adminPublicSelect,
  });
}

export async function createAdminSession({ adminId, ipAddress, userAgent }) {
  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const now = new Date();
  const { expiresAt, idleExpiresAt } = buildSessionExpirations(now);

  await prisma.$transaction(async (tx) => {
    await tx.adminSession.deleteMany({
      where: { adminId },
    });

    await tx.adminSession.create({
      data: {
        adminId,
        sessionTokenHash: hashToken(sessionToken),
        csrfToken,
        ipAddress,
        userAgent,
        expiresAt,
        idleExpiresAt,
        lastActivityAt: now,
      },
    });
  });

  return {
    sessionToken,
    csrfToken,
    expiresAt,
    idleExpiresAt,
  };
}

export async function getAdminSessionByToken(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: {
      sessionTokenHash: hashToken(sessionToken),
    },
    include: {
      admin: {
        select: adminPublicSelect,
      },
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  if (session.expiresAt <= now || session.idleExpiresAt <= now) {
    await prisma.adminSession
      .delete({
        where: { id: session.id },
      })
      .catch(() => {});

    return null;
  }

  return session;
}

export async function touchAdminSession(session) {
  const now = new Date();
  if (now.getTime() - session.lastActivityAt.getTime() < config.auth.sessionTouchAfterMs) {
    return session;
  }

  return prisma.adminSession.update({
    where: { id: session.id },
    data: {
      lastActivityAt: now,
      idleExpiresAt: new Date(now.getTime() + config.auth.sessionIdleTtlMs),
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    },
    include: {
      admin: {
        select: adminPublicSelect,
      },
    },
  });
}

export async function destroyAdminSession(sessionId) {
  if (!sessionId) {
    return;
  }

  await prisma.adminSession.deleteMany({
    where: { id: sessionId },
  });
}
