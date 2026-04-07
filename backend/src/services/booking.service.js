import { BookingStatus } from '@prisma/client';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { compactObject } from '../lib/sanitize.js';
import { applyBookingBusinessRules } from './booking-rules.service.js';

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

async function hasRecentBookingDuplicate(data) {
  const identifiers = [];

  if (data.email) {
    identifiers.push({ email: data.email });
  }

  if (data.phone) {
    identifiers.push({ phone: data.phone });
  }

  if (identifiers.length === 0) {
    return false;
  }

  const since = new Date(Date.now() - config.abuse.duplicateWindowMs);
  const existingBooking = await prisma.booking.findFirst({
    where: {
      createdAt: {
        gte: since,
      },
      serviceType: data.serviceType,
      pickupLocation: data.pickupLocation,
      OR: identifiers,
    },
    select: { id: true },
  });

  return Boolean(existingBooking);
}

export async function createBooking(data, { captcha } = {}) {
  const { website, ...bookingData } = data;
  const enrichedBookingData = applyBookingBusinessRules(bookingData);
  const duplicateDetected = await hasRecentBookingDuplicate(enrichedBookingData);
  const securitySignals = compactObject({
    honeypotTriggered: website ? true : undefined,
    duplicateDetected: duplicateDetected || undefined,
    captchaVerified: captcha?.verified ? true : undefined,
    captchaProvider: captcha?.verified ? captcha.provider : undefined,
  });
  const nextMetadata = compactObject({
    ...(enrichedBookingData.metadata && typeof enrichedBookingData.metadata === 'object' ? enrichedBookingData.metadata : {}),
    submissionSecurity: Object.keys(securitySignals).length > 0 ? securitySignals : undefined,
  });

  return prisma.booking.create({
    data: {
      ...enrichedBookingData,
      metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined,
      status: website || duplicateDetected ? BookingStatus.SPAM : BookingStatus.PENDING,
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
