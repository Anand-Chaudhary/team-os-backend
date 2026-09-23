import { Router } from 'express';
import { publicCalendar } from '../controllers/calendar.controller';

const router = Router();

// Public endpoint – validates token internally
router.get('/clients/:clientId/calendar', publicCalendar);

export default router;
