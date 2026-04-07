import { prisma } from '../lib/prisma.js';
import { config } from '../lib/config.js';

let cleanupTimer = null;
let cleanupInFlight = false;

async function cleanupExpiredSessions(now = new Date()) {
  const result = await prisma.adminSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { idleExpiresAt: { lt: now } },
      ],
    },
  });

  return result.count;
}

async function cleanupStaleRateLimitBuckets(now = new Date()) {
  const cutoff = new Date(now.getTime() - config.maintenance.rateLimitBucketRetentionMs);
  const result = await prisma.rateLimitBucket.deleteMany({
    where: {
      windowStart: { lt: cutoff },
    },
  });

  return result.count;
}

export async function runMaintenanceSweep() {
  if (cleanupInFlight) {
    return null;
  }

  cleanupInFlight = true;

  try {
    const [expiredSessionsDeleted, staleBucketsDeleted] = await Promise.all([
      cleanupExpiredSessions(),
      cleanupStaleRateLimitBuckets(),
    ]);

    if (expiredSessionsDeleted || staleBucketsDeleted) {
      console.info(
        JSON.stringify({
          type: 'maintenance',
          timestamp: new Date().toISOString(),
          expiredSessionsDeleted,
          staleBucketsDeleted,
        })
      );
    }

    return {
      expiredSessionsDeleted,
      staleBucketsDeleted,
    };
  } finally {
    cleanupInFlight = false;
  }
}

export function startMaintenanceLoop() {
  if (cleanupTimer) {
    return cleanupTimer;
  }

  void runMaintenanceSweep().catch((error) => {
    console.error(
      JSON.stringify({
        type: 'maintenance_error',
        timestamp: new Date().toISOString(),
        message: error?.message,
      })
    );
  });

  cleanupTimer = setInterval(() => {
    void runMaintenanceSweep().catch((error) => {
      console.error(
        JSON.stringify({
          type: 'maintenance_error',
          timestamp: new Date().toISOString(),
          message: error?.message,
        })
      );
    });
  }, config.maintenance.cleanupIntervalMs);

  cleanupTimer.unref?.();
  return cleanupTimer;
}
