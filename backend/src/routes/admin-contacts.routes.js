import { Router } from 'express';
import { requireAdminRole } from '../middleware/auth.js';
import {
  getContact,
  getContacts,
  patchContact,
  removeContact,
} from '../controllers/admin-contacts.controller.js';

const router = Router();

router.get('/', getContacts);
router.get('/:id', getContact);
router.patch('/:id', requireAdminRole('ADMIN', 'SUPER_ADMIN'), patchContact);
router.delete('/:id', requireAdminRole('SUPER_ADMIN'), removeContact);

export default router;
