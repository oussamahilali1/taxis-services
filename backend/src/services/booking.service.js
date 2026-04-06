import { BookingStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';

function buildBookingWhere({ status, serviceType, search }) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (serviceType) {
    where.serviceType = serviceType;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { pickupLocation: { contains: search, mode: 'insensitive' } },
      { dropoffLocation: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function createBooking(data) {
  const { website, ...bookingData } = data;

  return prisma.booking.create({
    data: {
      ...bookingData,
      status: website ? BookingStatus.SPAM : BookingStatus.PENDING,
    },
  });
}

export async function listBookings({ page, pageSize, status, search, serviceType }) {
  const where = buildBookingWhere({ status, search, serviceType });
  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

export async function getBookingById(id) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  return booking;
}

export async function updateBooking(id, data) {
  await getBookingById(id);
  return prisma.booking.update({
    where: { id },
    data,
  });
}

export async function deleteBooking(id) {
  await getBookingById(id);
  await prisma.booking.delete({ where: { id } });
}
