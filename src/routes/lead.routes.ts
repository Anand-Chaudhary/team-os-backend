import { Router } from 'express';
import {
  listLeadsHandler,
  getLeadHandler,
  createLeadHandler,
  updateLeadHandler,
  deleteLeadHandler,
} from '../controllers/lead.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', listLeadsHandler);
router.get('/:id', getLeadHandler);
router.post('/', createLeadHandler);
router.patch('/:id', updateLeadHandler);
router.delete('/:id', deleteLeadHandler);

export default router;
