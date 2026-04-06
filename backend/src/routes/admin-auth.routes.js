import { Router } from 'express';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '../controllers/admin-auth.controller.js';
import { requireAdminAuth, requireCsrfToken } from '../middleware/auth.js';
import { adminLoginLimiter } from '../middleware/rate-limiters.js';

const router = Router();

router.post('/login', adminLoginLimiter, loginAdmin);
router.post('/logout', requireAdminAuth, requireCsrfToken, logoutAdmin);
router.get('/me', requireAdminAuth, getCurrentAdmin);

export default router;
