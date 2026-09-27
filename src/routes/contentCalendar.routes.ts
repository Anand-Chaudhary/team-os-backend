import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getContentCalendar } from '../controllers/contentCalendar.controller';

const router = Router();
router.use(requireAuth);

// Fetch calendar posts for a specific client (client must be authenticated)
router.get('/:clientId', getContentCalendar);

export default router;
