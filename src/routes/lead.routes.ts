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

// Public route for landing page chatbot
router.post('/', createLeadHandler);

// Protected routes
router.use(requireAuth);
router.get('/', listLeadsHandler);
router.get('/:id', getLeadHandler);
router.patch('/:id', updateLeadHandler);
router.delete('/:id', deleteLeadHandler);

export default router;
