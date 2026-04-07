import { ContactStatus } from '@prisma/client';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http-error.js';
import { compactObject } from '../lib/sanitize.js';

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

async function hasRecentContactDuplicate(data) {
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
  const existingContact = await prisma.contact.findFirst({
    where: {
      createdAt: {
        gte: since,
      },
      subject: data.subject,
      message: data.message,
      OR: identifiers,
    },
    select: { id: true },
  });

  return Boolean(existingContact);
}

export async function createContact(data, { captcha } = {}) {
  const { website, ...contactData } = data;
  const duplicateDetected = await hasRecentContactDuplicate(contactData);
  const securitySignals = compactObject({
    honeypotTriggered: website ? true : undefined,
    duplicateDetected: duplicateDetected || undefined,
    captchaVerified: captcha?.verified ? true : undefined,
    captchaProvider: captcha?.verified ? captcha.provider : undefined,
  });
  const nextMetadata = compactObject({
    ...(contactData.metadata && typeof contactData.metadata === 'object' ? contactData.metadata : {}),
    submissionSecurity: Object.keys(securitySignals).length > 0 ? securitySignals : undefined,
  });

  return prisma.contact.create({
    data: {
      ...contactData,
      metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined,
      status: website || duplicateDetected ? ContactStatus.SPAM : ContactStatus.NEW,
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
