import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import publicRoutes from './public.routes.js';

const router = Router();

router.use(publicRoutes);
router.use(adminRoutes);

export default router;
