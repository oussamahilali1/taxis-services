import { Router } from 'express';
import {
  getContact,
  getContacts,
  patchContact,
  removeContact,
} from '../controllers/admin-contacts.controller.js';

const router = Router();

router.get('/', getContacts);
router.get('/:id', getContact);
router.patch('/:id', patchContact);
router.delete('/:id', removeContact);

export default router;
