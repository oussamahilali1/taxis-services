import { Router } from 'express';
import { submitBooking, submitContact } from '../controllers/public.controller.js';
import { publicSubmissionLimiter } from '../middleware/rate-limiters.js';

const router = Router();

router.post('/bookings', publicSubmissionLimiter, submitBooking);
router.post('/contacts', publicSubmissionLimiter, submitContact);

export default router;
