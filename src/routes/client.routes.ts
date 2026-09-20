import { Router } from 'express';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  generateShareLink,
} from '../controllers/client.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);
// Endpoint to generate a read‑only calendar link for a client.
router.post('/:id/share', generateShareLink);

export default router;
