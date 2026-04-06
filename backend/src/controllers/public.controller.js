import { asyncHandler } from '../lib/async-handler.js';
import { validateBookingPayload, validateContactPayload } from '../lib/validation.js';
import { createBooking } from '../services/booking.service.js';
import { createContact } from '../services/contact.service.js';

export const submitBooking = asyncHandler(async (req, res) => {
  const payload = validateBookingPayload(req.body);
  const booking = await createBooking(payload);

  res.status(201).json({
    success: true,
    message: 'Votre demande de reservation a bien ete recue.',
    data: {
      id: booking.id,
      status: booking.status,
      createdAt: booking.createdAt,
    },
  });
});

export const submitContact = asyncHandler(async (req, res) => {
  const payload = validateContactPayload(req.body);
  const contact = await createContact(payload);

  res.status(201).json({
    success: true,
    message: 'Votre message a bien ete recu.',
    data: {
      id: contact.id,
      status: contact.status,
      createdAt: contact.createdAt,
    },
  });
});
