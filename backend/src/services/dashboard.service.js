import { prisma } from '../lib/prisma.js';

function toStatusCountMap(rows) {
  return rows.reduce((accumulator, row) => {
    accumulator[row.status] = row._count._all;
    return accumulator;
  }, {});
}

export async function getDashboardSnapshot() {
  const [bookingTotal, contactTotal, bookingCounts, contactCounts, recentBookings, recentContacts] = await Promise.all([
    prisma.booking.count(),
    prisma.contact.count(),
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.contact.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    totals: {
      bookings: bookingTotal,
      contacts: contactTotal,
    },
    bookingStatusCounts: toStatusCountMap(bookingCounts),
    contactStatusCounts: toStatusCountMap(contactCounts),
    recentBookings,
    recentContacts,
  };
}
