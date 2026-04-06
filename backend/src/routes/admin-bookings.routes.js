import { Router } from 'express';
import {
  getBooking,
  getBookings,
  patchBooking,
  removeBooking,
} from '../controllers/admin-bookings.controller.js';

const router = Router();

router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id', patchBooking);
router.delete('/:id', removeBooking);

export default router;
