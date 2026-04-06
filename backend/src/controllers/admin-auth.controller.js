import { asyncHandler } from '../lib/async-handler.js';
import { config } from '../lib/config.js';
import { validateAdminLoginPayload } from '../lib/validation.js';
import {
  authenticateAdminCredentials,
  clearAdminAuthCookies,
  createCsrfToken,
  setAdminAuthCookies,
  signAdminToken,
} from '../services/auth.service.js';

export const loginAdmin = asyncHandler(async (req, res) => {
  const payload = validateAdminLoginPayload(req.body);
  const admin = await authenticateAdminCredentials(payload.email, payload.password);
  const token = signAdminToken(admin);
  const csrfToken = createCsrfToken();

  setAdminAuthCookies(res, token, csrfToken);

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      admin,
      csrfToken,
    },
  });
});

export const logoutAdmin = asyncHandler(async (_req, res) => {
  clearAdminAuthCookies(res);
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
      csrfToken: req.cookies?.[config.auth.csrfCookieName] || null,
    },
  });
});
