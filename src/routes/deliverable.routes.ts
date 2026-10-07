import { Router } from 'express';
import { getDeliverables } from '../controllers/deliverable.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:clientId', getDeliverables);

export default router;
