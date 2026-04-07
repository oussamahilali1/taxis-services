import { BookingStatus } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
import { buildAuditContext, logAuditEvent } from '../lib/audit.js';
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
  const previousBooking = await getBookingById(req.params.id);
  const payload = validateBookingUpdatePayload(req.body);
  const booking = await updateBooking(req.params.id, payload);

  logAuditEvent(
    payload.status && payload.status !== previousBooking.status
      ? 'admin.booking.status_changed'
      : 'admin.booking.updated',
    buildAuditContext(req, {
      adminId: req.admin.id,
      bookingId: booking.id,
      previousStatus: previousBooking.status,
      nextStatus: booking.status,
    })
  );

  res.json({
    success: true,
    message: 'Booking updated.',
    data: booking,
  });
});

export const removeBooking = asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.params.id);
  await deleteBooking(req.params.id);

  logAuditEvent(
    'admin.booking.deleted',
    buildAuditContext(req, {
      adminId: req.admin.id,
      bookingId: booking.id,
      previousStatus: booking.status,
    })
  );

  res.json({
    success: true,
    message: 'Booking deleted.',
  });
});
