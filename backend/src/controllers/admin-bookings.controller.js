import { BookingStatus } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
import { parseListQuery, validateBookingUpdatePayload } from '../lib/validation.js';
import { deleteBooking, getBookingById, listBookings, updateBooking } from '../services/booking.service.js';

export const getBookings = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query, {
    allowedStatuses: Object.values(BookingStatus),
    allowedServiceTypes: true,
  });
  const result = await listBookings(query);

  res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.params.id);

  res.json({
    success: true,
    data: booking,
  });
});

export const patchBooking = asyncHandler(async (req, res) => {
  const payload = validateBookingUpdatePayload(req.body);
  const booking = await updateBooking(req.params.id, payload);

  res.json({
    success: true,
    message: 'Booking updated.',
    data: booking,
  });
});

export const removeBooking = asyncHandler(async (req, res) => {
  await deleteBooking(req.params.id);

  res.json({
    success: true,
    message: 'Booking deleted.',
  });
});
