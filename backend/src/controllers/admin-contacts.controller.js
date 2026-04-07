import { ContactStatus } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
import { buildAuditContext, logAuditEvent } from '../lib/audit.js';
import { parseListQuery, validateContactUpdatePayload } from '../lib/validation.js';
import { deleteContact, getContactById, listContacts, updateContact } from '../services/contact.service.js';

export const getContacts = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query, {
    allowedStatuses: Object.values(ContactStatus),
  });
  const result = await listContacts(query);

  res.json({
    success: true,
    data: result.items,
    meta: result.meta,
  });
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await getContactById(req.params.id);

  res.json({
    success: true,
    data: contact,
  });
});

export const patchContact = asyncHandler(async (req, res) => {
  const previousContact = await getContactById(req.params.id);
  const payload = validateContactUpdatePayload(req.body);
  const contact = await updateContact(req.params.id, payload);

  logAuditEvent(
    payload.status && payload.status !== previousContact.status
      ? 'admin.contact.status_changed'
      : 'admin.contact.updated',
    buildAuditContext(req, {
      adminId: req.admin.id,
      contactId: contact.id,
      previousStatus: previousContact.status,
      nextStatus: contact.status,
    })
  );

  res.json({
    success: true,
    message: 'Contact updated.',
    data: contact,
  });
});

export const removeContact = asyncHandler(async (req, res) => {
  const contact = await getContactById(req.params.id);
  await deleteContact(req.params.id);

  logAuditEvent(
    'admin.contact.deleted',
    buildAuditContext(req, {
      adminId: req.admin.id,
      contactId: contact.id,
      previousStatus: contact.status,
    })
  );

  res.json({
    success: true,
    message: 'Contact deleted.',
  });
});
