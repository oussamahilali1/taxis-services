import { Router } from 'express';
import { requireAdminRole } from '../middleware/auth.js';
import {
  getBooking,
  getBookings,
  patchBooking,
  removeBooking,
} from '../controllers/admin-bookings.controller.js';

const router = Router();

router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id', requireAdminRole('ADMIN', 'SUPER_ADMIN'), patchBooking);
router.delete('/:id', requireAdminRole('SUPER_ADMIN'), removeBooking);

export default router;
