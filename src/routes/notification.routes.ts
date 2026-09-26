import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  listNotificationsHandler,
  createNotificationHandler,
  toggleReadHandler,
} from '../controllers/notification.controller';

const router = Router();
router.use(requireAuth);

// List all notifications for the logged‑in user
router.get('/', listNotificationsHandler);

// Create a notification (system/admin use)
router.post('/', createNotificationHandler);

// Toggle read status
router.patch('/:id/read', toggleReadHandler);

export default router;
