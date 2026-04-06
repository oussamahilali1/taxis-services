import { BookingServiceType } from '@prisma/client';
import { compactObject } from '../lib/sanitize.js';

function buildLocalTaxiRules() {
  return {
    coverageMode: 'local_service_area',
    summary: 'Local taxi requests are prepared for polygon-based service-area validation.',
    requiresManualReview: false,
    localAreaValidation: {
      status: 'pending_geocoding',
      blocked: false,
      message: 'Backend polygon validation can be enabled once address geocoding is wired.',
    },
  };
}

function buildAirportShuttleRules(metadata) {
  const airportDetails = metadata.airportDetails && typeof metadata.airportDetails === 'object' ? metadata.airportDetails : undefined;

  return compactObject({
    coverageMode: 'belgium_airport_shuttle',
    summary: 'Airport shuttle requests are not restricted by the local service area.',
    requiresManualReview: false,
    airportSupport: {
      nationwideCoverage: true,
      flightNumberSupported: true,
      detailsProvided: Boolean(airportDetails && Object.keys(airportDetails).length > 0),
    },
  });
}

function buildBusinessRules() {
  return {
    coverageMode: 'business_on_demand',
    summary: 'Business transport requests can support broader destinations and are reviewed per itinerary.',
    requiresManualReview: true,
  };
}

function buildPmrRules(metadata) {
  return {
    coverageMode: 'pmr_support',
    summary: 'PMR requests preserve accessibility details and are reviewed with the announced assistance needs.',
    requiresManualReview: true,
    accessibilityRequested: Boolean(metadata.accessibilityNeeded),
  };
}

function buildParcelRules() {
  return {
    coverageMode: 'parcel_route',
    summary: 'Parcel delivery uses the booking pipeline with pickup and destination kept together.',
    requiresManualReview: true,
  };
}

function buildQuickRequestRules() {
  return {
    coverageMode: 'quick_request',
    summary: 'Quick requests are captured from the shortcut form for manual follow-up.',
    requiresManualReview: true,
  };
}

function buildServiceRules(bookingData, metadata) {
  switch (bookingData.serviceType) {
    case BookingServiceType.LOCAL_TAXI:
      return buildLocalTaxiRules();
    case BookingServiceType.AIRPORT_SHUTTLE:
      return buildAirportShuttleRules(metadata);
    case BookingServiceType.BUSINESS:
      return buildBusinessRules();
    case BookingServiceType.PMR:
      return buildPmrRules(metadata);
    case BookingServiceType.PARCEL_DELIVERY:
      return buildParcelRules();
    case BookingServiceType.QUICK_REQUEST:
    default:
      return buildQuickRequestRules();
  }
}

export function applyBookingBusinessRules(bookingData) {
  const metadata = bookingData.metadata && typeof bookingData.metadata === 'object' ? { ...bookingData.metadata } : {};
  const serviceRules = buildServiceRules(bookingData, metadata);

  const nextMetadata = compactObject({
    ...metadata,
    serviceRules,
  });

  return {
    ...bookingData,
    metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined,
  };
}
