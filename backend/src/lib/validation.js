import { BookingServiceType, BookingStatus, ContactStatus } from '@prisma/client';
import { z } from 'zod';
import { coerceBoolean, compactObject, sanitizeEmail, sanitizePhone, sanitizeText } from './sanitize.js';

export const bookingServiceValueByLabel = {
  LOCAL_TAXI: BookingServiceType.LOCAL_TAXI,
  'Taxi de proximité': BookingServiceType.LOCAL_TAXI,
  AIRPORT_SHUTTLE: BookingServiceType.AIRPORT_SHUTTLE,
  'Navette aéroport': BookingServiceType.AIRPORT_SHUTTLE,
  BUSINESS: BookingServiceType.BUSINESS,
  'Transport business': BookingServiceType.BUSINESS,
  PMR: BookingServiceType.PMR,
  'Transport PMR': BookingServiceType.PMR,
  PARCEL_DELIVERY: BookingServiceType.PARCEL_DELIVERY,
  'Livraison de colis': BookingServiceType.PARCEL_DELIVERY,
  QUICK_REQUEST: BookingServiceType.QUICK_REQUEST,
  'Demande rapide': BookingServiceType.QUICK_REQUEST,
};

const bookingSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    phone: z.string().max(40).optional(),
    email: z.string().email().max(160).optional(),
    pickupLocation: z.string().min(3).max(180),
    dropoffLocation: z.string().max(180).optional(),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    passengers: z.string().max(16).optional(),
    serviceType: z.nativeEnum(BookingServiceType),
    notes: z.string().max(2500).optional(),
    sourcePage: z.string().max(80).optional(),
    website: z.string().max(120).optional(),
    metadata: z
      .object({
        company: z.string().max(120).optional(),
        vehiclePreference: z.string().max(120).optional(),
        luggage: z.string().max(180).optional(),
        childSeatNeeded: z.boolean().optional(),
        accessibilityNeeded: z.boolean().optional(),
        requestVariant: z.string().max(40).optional(),
        rawContactQuick: z.string().max(160).optional(),
      })
      .partial()
      .optional(),
  })
  .refine((value) => value.phone || value.email, {
    message: 'Veuillez renseigner un numero de telephone ou une adresse email.',
    path: ['phone'],
  });

const contactSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email().max(160).optional(),
    phone: z.string().max(40).optional(),
    subject: z.string().min(3).max(160),
    message: z.string().min(10).max(2500),
    sourcePage: z.string().max(80).optional(),
    website: z.string().max(120).optional(),
    metadata: z
      .object({
        serviceInterest: z.string().max(120).optional(),
      })
      .partial()
      .optional(),
  })
  .refine((value) => value.phone || value.email, {
    message: 'Veuillez renseigner un numero de telephone ou une adresse email.',
    path: ['phone'],
  });

const bookingUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().email().max(160).optional(),
    pickupLocation: z.string().min(3).max(180).optional(),
    dropoffLocation: z.string().max(180).optional().nullable(),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    passengers: z.string().max(16).optional().nullable(),
    serviceType: z.nativeEnum(BookingServiceType).optional(),
    notes: z.string().max(2500).optional().nullable(),
    status: z.nativeEnum(BookingStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Aucune mise a jour a appliquer.',
  });

const contactUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().email().max(160).optional(),
    subject: z.string().min(3).max(160).optional(),
    message: z.string().min(10).max(2500).optional(),
    status: z.nativeEnum(ContactStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Aucune mise a jour a appliquer.',
  });

const adminLoginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
});

function normalizeDateTime(datetimeValue) {
  const normalized = sanitizeText(datetimeValue, { maxLength: 32 });
  if (!normalized || !normalized.includes('T')) {
    return {};
  }

  const [pickupDate, pickupTime] = normalized.split('T');
  return {
    pickupDate: pickupDate || undefined,
    pickupTime: pickupTime ? pickupTime.slice(0, 5) : undefined,
  };
}

function mapServiceType(value) {
  const sanitized = sanitizeText(value, { maxLength: 60 });
  return bookingServiceValueByLabel[sanitized] || BookingServiceType.QUICK_REQUEST;
}

export function normalizeBookingPayload(input) {
  const fullName = sanitizeText(input.fullName ?? input.name, { maxLength: 120 });
  const sourcePage = sanitizeText(input.sourcePage ?? input.source_page, { maxLength: 80 });
  const pickupLocation = sanitizeText(input.pickupLocation ?? input.pickup, { maxLength: 180 });
  const dropoffLocation = sanitizeText(input.dropoffLocation ?? input.dropoff, { maxLength: 180 });
  const phone = sanitizePhone(input.phone);
  const email = sanitizeEmail(input.email);
  const contactQuick = sanitizeText(input.contactQuick ?? input.contact_quick, { maxLength: 160 });
  const normalizedDateTime = normalizeDateTime(input.datetime);

  const metadata = compactObject({
    company: sanitizeText(input.company, { maxLength: 120 }),
    vehiclePreference: sanitizeText(input.vehiclePreference ?? input.vehicle, { maxLength: 120 }),
    luggage: sanitizeText(input.luggage, { maxLength: 180 }),
    childSeatNeeded:
      input.childSeat != null || input.child_seat != null ? coerceBoolean(input.childSeat ?? input.child_seat) : undefined,
    accessibilityNeeded:
      input.accessibilityNeeded != null || input.accessibility != null
        ? coerceBoolean(input.accessibilityNeeded ?? input.accessibility)
        : undefined,
    requestVariant: sanitizeText(input.requestVariant ?? input.request_variant ?? (contactQuick ? 'quick' : 'standard'), {
      maxLength: 40,
    }),
    rawContactQuick: contactQuick,
  });

  const contactEmail = email || (contactQuick && contactQuick.includes('@') ? sanitizeEmail(contactQuick) : undefined);
  const contactPhone = phone || (contactQuick && !contactQuick.includes('@') ? sanitizePhone(contactQuick) : undefined);

  const notesParts = [
    sanitizeText(input.notes, { maxLength: 1800, multiline: true }),
    metadata.company ? `Entreprise: ${metadata.company}` : undefined,
    metadata.vehiclePreference ? `Vehicule prefere: ${metadata.vehiclePreference}` : undefined,
    metadata.luggage ? `Bagages: ${metadata.luggage}` : undefined,
    metadata.childSeatNeeded ? 'Siege enfant requis.' : undefined,
    metadata.accessibilityNeeded ? 'Besoin d assistance ou d accessibilite.' : undefined,
  ].filter(Boolean);

  return compactObject({
    fullName,
    phone: contactPhone,
    email: contactEmail,
    pickupLocation,
    dropoffLocation,
    pickupDate: sanitizeText(input.pickupDate, { maxLength: 10 }) ?? normalizedDateTime.pickupDate,
    pickupTime: sanitizeText(input.pickupTime, { maxLength: 5 }) ?? normalizedDateTime.pickupTime,
    passengers: sanitizeText(input.passengers, { maxLength: 16 }),
    serviceType: mapServiceType(input.serviceType ?? input.service),
    notes: notesParts.length > 0 ? notesParts.join('\n') : undefined,
    sourcePage,
    website: sanitizeText(input.website, { maxLength: 120 }),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}

export function normalizeContactPayload(input) {
  const serviceLabel = sanitizeText(input.service, { maxLength: 120 });
  const explicitSubject = sanitizeText(input.subject, { maxLength: 160 });
  const subject = explicitSubject || serviceLabel || 'Demande generale';
  const contactQuick = sanitizeText(input.contactQuick ?? input.contact_quick, { maxLength: 160 });
  const email = sanitizeEmail(input.email) || (contactQuick && contactQuick.includes('@') ? sanitizeEmail(contactQuick) : undefined);
  const phone = sanitizePhone(input.phone) || (contactQuick && !contactQuick.includes('@') ? sanitizePhone(contactQuick) : undefined);

  return compactObject({
    fullName: sanitizeText(input.fullName ?? input.name, { maxLength: 120 }),
    email,
    phone,
    subject,
    message: sanitizeText(input.message ?? input.notes, { maxLength: 2500, multiline: true }),
    sourcePage: sanitizeText(input.sourcePage ?? input.source_page, { maxLength: 80 }),
    website: sanitizeText(input.website, { maxLength: 120 }),
    metadata: serviceLabel ? { serviceInterest: serviceLabel } : undefined,
  });
}

export function validateBookingPayload(input) {
  return bookingSchema.parse(normalizeBookingPayload(input));
}

export function validateContactPayload(input) {
  return contactSchema.parse(normalizeContactPayload(input));
}

export function validateBookingUpdatePayload(input) {
  const payload = compactObject({
    fullName: sanitizeText(input.fullName, { maxLength: 120 }),
    phone: sanitizePhone(input.phone),
    email: sanitizeEmail(input.email),
    pickupLocation: sanitizeText(input.pickupLocation, { maxLength: 180 }),
    dropoffLocation:
      input.dropoffLocation === null ? null : sanitizeText(input.dropoffLocation, { maxLength: 180 }),
    pickupDate: input.pickupDate === null ? null : sanitizeText(input.pickupDate, { maxLength: 10 }),
    pickupTime: input.pickupTime === null ? null : sanitizeText(input.pickupTime, { maxLength: 5 }),
    passengers: input.passengers === null ? null : sanitizeText(input.passengers, { maxLength: 16 }),
    serviceType: input.serviceType ? mapServiceType(input.serviceType) : undefined,
    notes: input.notes === null ? null : sanitizeText(input.notes, { maxLength: 2500, multiline: true }),
    status: sanitizeText(input.status, { maxLength: 30 }),
  });

  return bookingUpdateSchema.parse(payload);
}

export function validateContactUpdatePayload(input) {
  const payload = compactObject({
    fullName: sanitizeText(input.fullName, { maxLength: 120 }),
    phone: sanitizePhone(input.phone),
    email: sanitizeEmail(input.email),
    subject: sanitizeText(input.subject, { maxLength: 160 }),
    message: sanitizeText(input.message, { maxLength: 2500, multiline: true }),
    status: sanitizeText(input.status, { maxLength: 30 }),
  });

  return contactUpdateSchema.parse(payload);
}

export function validateAdminLoginPayload(input) {
  return adminLoginSchema.parse({
    email: sanitizeEmail(input.email),
    password: String(input.password ?? '').slice(0, 128),
  });
}

export function parseListQuery(query, { allowedStatuses = [], allowedServiceTypes = false } = {}) {
  const page = Number.parseInt(String(query.page || '1'), 10);
  const pageSize = Number.parseInt(String(query.pageSize || query.limit || '10'), 10);
  const status = sanitizeText(query.status, { maxLength: 40 });
  const search = sanitizeText(query.search, { maxLength: 80 });
  const serviceType = allowedServiceTypes ? sanitizeText(query.serviceType, { maxLength: 40 }) : undefined;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 1), 100) : 10,
    status: allowedStatuses.includes(status) ? status : undefined,
    search,
    serviceType: allowedServiceTypes && serviceType ? mapServiceType(serviceType) : undefined,
  };
}
