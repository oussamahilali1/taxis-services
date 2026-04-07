import { asyncHandler } from '../lib/async-handler.js';
import { buildAuditContext, hashAuditValue, logAuditEvent } from '../lib/audit.js';
import { validateAdminLoginPayload } from '../lib/validation.js';
import { applyLogoutCleanupHeaders } from '../middleware/response-security.js';
import {
  authenticateAdminCredentials,
  clearAdminSessionCookie,
  createAdminSession,
  destroyAdminSession,
  setAdminSessionCookie,
} from '../services/auth.service.js';

export const loginAdmin = asyncHandler(async (req, res) => {
  const payload = validateAdminLoginPayload(req.body);

  try {
    const admin = await authenticateAdminCredentials(payload.email, payload.password);
    const session = await createAdminSession({
      adminId: admin.id,
      ipAddress: req.auditContext.ipAddress,
      userAgent: req.auditContext.userAgent,
    });

    setAdminSessionCookie(res, session.sessionToken);

    logAuditEvent(
      'admin.auth.login_success',
      buildAuditContext(req, {
        adminId: admin.id,
        role: admin.role,
      })
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        admin,
        csrfToken: session.csrfToken,
      },
    });
  } catch (error) {
    if (error?.statusCode === 401) {
      logAuditEvent(
        'admin.auth.login_failed',
        buildAuditContext(req, {
          principalHash: hashAuditValue(payload.email),
        })
      );
    }

    throw error;
  }
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  await destroyAdminSession(req.adminSession?.id);
  clearAdminSessionCookie(res);
  applyLogoutCleanupHeaders(res);

  logAuditEvent(
    'admin.auth.logout',
    buildAuditContext(req, {
      adminId: req.admin?.id,
      role: req.admin?.role,
    })
  );

  res.json({
    success: true,
    message: 'You have been logged out.',
  });
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      admin: req.admin,
      csrfToken: req.adminSession?.csrfToken || null,
    },
  });
});
