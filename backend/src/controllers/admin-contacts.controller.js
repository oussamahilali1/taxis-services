import { ContactStatus } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
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
  const payload = validateContactUpdatePayload(req.body);
  const contact = await updateContact(req.params.id, payload);

  res.json({
    success: true,
    message: 'Contact updated.',
    data: contact,
  });
});

export const removeContact = asyncHandler(async (req, res) => {
  await deleteContact(req.params.id);

  res.json({
    success: true,
    message: 'Contact deleted.',
  });
});
