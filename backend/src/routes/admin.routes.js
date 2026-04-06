import { Router } from 'express';
import { getAdminDashboard } from '../controllers/admin-dashboard.controller.js';
import { requireAdminAuth, requireCsrfToken } from '../middleware/auth.js';
import adminAuthRoutes from './admin-auth.routes.js';
import adminBookingRoutes from './admin-bookings.routes.js';
import adminContactRoutes from './admin-contacts.routes.js';

const router = Router();

router.use('/admin', adminAuthRoutes);
router.use('/admin', requireAdminAuth);
router.get('/admin/dashboard', getAdminDashboard);
router.use('/admin/bookings', requireCsrfToken, adminBookingRoutes);
router.use('/admin/contacts', requireCsrfToken, adminContactRoutes);

export default router;
