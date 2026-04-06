import { BookingServiceType, BookingStatus, ContactStatus } from '@prisma/client';
import { z } from 'zod';
import { coerceBoolean, compactObject, sanitizeEmail, sanitizePhone, sanitizeText } from './sanitize.js';

const PASSENGER_VALUES = ['1', '2', '3', '4', '5+'];

const BOOKING_SERVICE_VALUE_BY_LABEL = {
  local_taxi: BookingServiceType.LOCAL_TAXI,
  'taxi de proximite': BookingServiceType.LOCAL_TAXI,
  airport_shuttle: BookingServiceType.AIRPORT_SHUTTLE,
  'navette aeroport': BookingServiceType.AIRPORT_SHUTTLE,
  business: BookingServiceType.BUSINESS,
  'transport business': BookingServiceType.BUSINESS,
  pmr: BookingServiceType.PMR,
  'transport pmr': BookingServiceType.PMR,
  parcel_delivery: BookingServiceType.PARCEL_DELIVERY,
  'livraison de colis': BookingServiceType.PARCEL_DELIVERY,
  quick_request: BookingServiceType.QUICK_REQUEST,
  'demande rapide': BookingServiceType.QUICK_REQUEST,
};

const KNOWN_VEHICLE_TYPE_KEYS = new Set([
  'berline standard',
  'berline premium',
  'vehicule avec grand coffre',
  'transport adapte selon la demande',
]);

const phoneSchema = z
  .string()
  .min(6, 'Le numero de telephone est trop court.')
  .max(25, 'Le numero de telephone est trop long.')
  .regex(/^[0-9+()./\-\s]+$/, 'Le numero de telephone est invalide.')
  .refine((value) => value.replace(/[^0-9]/g, '').length >= 6, {
    message: 'Le numero de telephone est invalide.',
  });

const bookingMetadataSchema = z
  .object({
    company: z.string().max(120, "Le nom de l'entreprise est trop long.").optional(),
    vehicleType: z.string().max(120, 'Le type de vehicule est invalide.').optional(),
    luggage: z.string().max(160, 'La description des bagages est trop longue.').optional(),
    childSeatNeeded: z.boolean().optional(),
    accessibilityNeeded: z.boolean().optional(),
    requestVariant: z.string().max(40).optional(),
    rawContactQuick: z.string().max(160).optional(),
    airportDetails: z
      .object({
        flightNumber: z
          .string()
          .min(2, 'Le numero de vol est invalide.')
          .max(20, 'Le numero de vol est trop long.')
          .regex(/^[A-Z0-9 -]+$/, 'Le numero de vol est invalide.')
          .optional(),
        airportName: z.string().max(120, "Le nom de l'aeroport est trop long.").optional(),
        terminal: z.string().max(40, 'Le terminal est trop long.').optional(),
        direction: z.string().max(40, 'Le sens du transfert est invalide.').optional(),
      })
      .partial()
      .optional(),
  })
  .partial()
  .superRefine((value, ctx) => {
    if (value.vehicleType && !KNOWN_VEHICLE_TYPE_KEYS.has(normalizeLookupKey(value.vehicleType))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vehicleType'],
        message: 'Le type de vehicule selectionne est invalide.',
      });
    }
  })
  .optional();

const bookingSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caracteres.').max(100).optional(),
    phone: phoneSchema.optional(),
    email: z.string().email("L'adresse email est invalide.").max(160).optional(),
    pickupLocation: z.string().min(3, "L'adresse de prise en charge est trop courte.").max(255).optional(),
    dropoffLocation: z.string().min(3, "L'adresse de destination est trop courte.").max(255).optional(),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date souhaitee est invalide.').optional(),
    pickupTime: z.string().regex(/^\d{2}:\d{2}$/, "L'heure souhaitee est invalide.").optional(),
    passengers: z.enum(PASSENGER_VALUES).optional(),
    serviceType: z.nativeEnum(BookingServiceType).optional(),
    notes: z.string().max(500, 'Les precisions utiles ne doivent pas depasser 500 caracteres.').optional(),
    sourcePage: z.string().max(80).optional(),
    website: z.string().max(120).optional(),
    metadata: bookingMetadataSchema,
  })
  .superRefine((value, ctx) => {
    const requestVariant = normalizeRequestVariant(value.metadata?.requestVariant);
    const isQuickRequest = value.serviceType === BookingServiceType.QUICK_REQUEST || requestVariant === 'quick';

    if (!value.serviceType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['serviceType'],
        message: 'Veuillez selectionner un type de service valide.',
      });
    }

    if (!value.pickupLocation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pickupLocation'],
        message: "L'adresse de prise en charge est obligatoire.",
      });
    }

    if (!value.dropoffLocation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dropoffLocation'],
        message: "L'adresse de destination est obligatoire.",
      });
    }

    if (isQuickRequest) {
      if (!value.phone && !value.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactQuick'],
          message: 'Veuillez indiquer un telephone ou un email valide.',
        });
      }

      return;
    }

    if (!value.fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fullName'],
        message: 'Le nom complet est obligatoire.',
      });
    }

    if (!value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Le numero de telephone est obligatoire.',
      });
    }

    if (!value.pickupDate || !value.pickupTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['datetime'],
        message: "La date et l'heure souhaitees sont obligatoires.",
      });
    }

    if (!value.passengers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passengers'],
        message: 'Veuillez indiquer le nombre de passagers.',
      });
    }
  });

const contactSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet est obligatoire.').max(120),
    email: z.string().email("L'adresse email est invalide.").max(160).optional(),
    phone: phoneSchema.optional(),
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
  .superRefine((value, ctx) => {
    if (!value.phone && !value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Veuillez renseigner un numero de telephone ou une adresse email.',
      });
    }
  });

const bookingUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
    email: z.string().email().max(160).optional(),
    pickupLocation: z.string().min(3).max(255).optional(),
    dropoffLocation: z.string().min(3).max(255).optional().nullable(),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    passengers: z.enum(PASSENGER_VALUES).optional().nullable(),
    serviceType: z.nativeEnum(BookingServiceType).optional(),
    notes: z.string().max(500).optional().nullable(),
    status: z.nativeEnum(BookingStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Aucune mise a jour a appliquer.',
  });

const contactUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    phone: phoneSchema.optional(),
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

export const bookingServiceValueByLabel = BOOKING_SERVICE_VALUE_BY_LABEL;

function normalizeLookupKey(value) {
  const sanitized = sanitizeText(value, { maxLength: 160 });
  if (!sanitized) {
    return '';
  }

  return sanitized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeRequestVariant(value) {
  const normalized = normalizeLookupKey(value);

  if (normalized === 'quick' || normalized === 'demande rapide') {
    return 'quick';
  }

  if (normalized === 'standard' || normalized === 'full' || normalized === 'booking') {
    return 'full';
  }

  return normalized || undefined;
}

function normalizeDateTime(input) {
  const rawDateTime = sanitizeText(input.dateTime ?? input.datetime, { maxLength: 32 });
  const explicitDate = sanitizeText(input.pickupDate, { maxLength: 10 });
  const explicitTime = sanitizeText(input.pickupTime, { maxLength: 5 });

  if (explicitDate && explicitTime) {
    return {
      pickupDate: explicitDate,
      pickupTime: explicitTime,
    };
  }

  if (!rawDateTime || !rawDateTime.includes('T')) {
    return {
      pickupDate: explicitDate,
      pickupTime: explicitTime,
    };
  }

  const [pickupDate, pickupTime] = rawDateTime.split('T');
  return {
    pickupDate: pickupDate || explicitDate,
    pickupTime: pickupTime ? pickupTime.slice(0, 5) : explicitTime,
  };
}

function mapServiceType(value) {
  const normalized = normalizeLookupKey(value);
  return normalized ? BOOKING_SERVICE_VALUE_BY_LABEL[normalized] : undefined;
}

function buildAirportDetails(input) {
  const airportDetails = compactObject({
    flightNumber: sanitizeText(input.flightNumber ?? input.flight_number, { maxLength: 20 })?.toUpperCase(),
    airportName: sanitizeText(
      input.airportName ?? input.airport_name ?? input.airport ?? input.pickupAirport ?? input.dropoffAirport,
      { maxLength: 120 }
    ),
    terminal: sanitizeText(input.terminal ?? input.airportTerminal ?? input.airport_terminal, { maxLength: 40 }),
    direction: sanitizeText(
      input.airportDirection ?? input.airport_direction ?? input.transferDirection ?? input.transfer_direction,
      { maxLength: 40 }
    ),
  });

  return Object.keys(airportDetails).length > 0 ? airportDetails : undefined;
}

export function normalizeBookingPayload(input) {
  const contactQuick = sanitizeText(input.contactQuick ?? input.contact_quick, { maxLength: 160 });
  const mappedServiceType = mapServiceType(input.serviceType ?? input.service);
  const requestVariant = normalizeRequestVariant(
    input.requestVariant ?? input.request_variant ?? (mappedServiceType === BookingServiceType.QUICK_REQUEST || contactQuick ? 'quick' : 'full')
  );
  const normalizedDateTime = normalizeDateTime(input);
  const airportDetails = buildAirportDetails(input);
  const phone = sanitizePhone(input.phone);
  const email = sanitizeEmail(input.email);
  const derivedEmail = !email && contactQuick && contactQuick.includes('@') ? sanitizeEmail(contactQuick) : undefined;
  const derivedPhone = !phone && contactQuick && !contactQuick.includes('@') ? sanitizePhone(contactQuick) : undefined;
  const serviceType = mappedServiceType || (requestVariant === 'quick' ? BookingServiceType.QUICK_REQUEST : undefined);
  const metadata = compactObject({
    company: sanitizeText(input.company, { maxLength: 120 }),
    vehicleType: sanitizeText(input.vehicleType ?? input.vehiclePreference ?? input.vehicle, { maxLength: 120 }),
    luggage: sanitizeText(input.luggage, { maxLength: 160 }),
    childSeatNeeded:
      input.childSeat != null || input.child_seat != null ? coerceBoolean(input.childSeat ?? input.child_seat) : undefined,
    accessibilityNeeded:
      input.accessibilityNeeded != null || input.accessibility != null
        ? coerceBoolean(input.accessibilityNeeded ?? input.accessibility)
        : undefined,
    requestVariant,
    rawContactQuick: contactQuick,
    airportDetails,
  });

  return compactObject({
    fullName:
      sanitizeText(input.fullName ?? input.name, { maxLength: 100 }) ??
      (requestVariant === 'quick' ? 'Client web' : undefined),
    phone: phone || derivedPhone,
    email: email || derivedEmail,
    pickupLocation: sanitizeText(input.pickupLocation ?? input.pickup, { maxLength: 255 }),
    dropoffLocation: sanitizeText(input.dropoffLocation ?? input.dropoff ?? input.destination, { maxLength: 255 }),
    pickupDate: normalizedDateTime.pickupDate,
    pickupTime: normalizedDateTime.pickupTime,
    passengers: sanitizeText(input.passengers, { maxLength: 16 }),
    serviceType,
    notes: sanitizeText(input.notes, { maxLength: 500, multiline: true }),
    sourcePage: sanitizeText(input.sourcePage ?? input.source_page, { maxLength: 80 }),
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
    fullName: sanitizeText(input.fullName, { maxLength: 100 }),
    phone: sanitizePhone(input.phone),
    email: sanitizeEmail(input.email),
    pickupLocation: sanitizeText(input.pickupLocation, { maxLength: 255 }),
    dropoffLocation: input.dropoffLocation === null ? null : sanitizeText(input.dropoffLocation, { maxLength: 255 }),
    pickupDate: input.pickupDate === null ? null : sanitizeText(input.pickupDate, { maxLength: 10 }),
    pickupTime: input.pickupTime === null ? null : sanitizeText(input.pickupTime, { maxLength: 5 }),
    passengers: input.passengers === null ? null : sanitizeText(input.passengers, { maxLength: 16 }),
    serviceType: input.serviceType ? mapServiceType(input.serviceType) : undefined,
    notes: input.notes === null ? null : sanitizeText(input.notes, { maxLength: 500, multiline: true }),
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
  const mappedServiceType = allowedServiceTypes && serviceType ? mapServiceType(serviceType) : undefined;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 1), 100) : 10,
    status: allowedStatuses.includes(status) ? status : undefined,
    search,
    serviceType: mappedServiceType,
  };
}
