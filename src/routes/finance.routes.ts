import { Router } from 'express';
import {
  listFinanceHandler,
  getFinanceHandler,
  createFinanceHandler,
  updateFinanceHandler,
  deleteFinanceHandler,
  financeSummaryHandler,
} from '../controllers/finance.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// List and create
router.get('/', listFinanceHandler);
router.post('/', createFinanceHandler);

// Summary report
router.get('/summary/:year/:month', financeSummaryHandler);

// Individual entry CRUD
router.get('/:id', getFinanceHandler);
router.patch('/:id', updateFinanceHandler);
router.delete('/:id', deleteFinanceHandler);

export default router;
