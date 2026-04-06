import { ContactStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';

function buildContactWhere({ status, search }) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function createContact(data) {
  const { website, ...contactData } = data;

  return prisma.contact.create({
    data: {
      ...contactData,
      status: website ? ContactStatus.SPAM : ContactStatus.NEW,
    },
  });
}

export async function listContacts({ page, pageSize, status, search }) {
  const where = buildContactWhere({ status, search });
  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
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

export async function getContactById(id) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new HttpError(404, 'CONTACT_NOT_FOUND', 'Contact not found.');
  }

  return contact;
}

export async function updateContact(id, data) {
  await getContactById(id);
  return prisma.contact.update({
    where: { id },
    data,
  });
}

export async function deleteContact(id) {
  await getContactById(id);
  await prisma.contact.delete({ where: { id } });
}
