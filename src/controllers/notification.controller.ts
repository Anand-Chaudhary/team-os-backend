import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { listUserNotifications, createNotification, toggleReadStatus } from '../services/notification.service';

/** GET /notifications – list notifications for logged‑in user */
export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    if (!user?.id) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const notifications = await listUserNotifications(user.id);
    return sendResponse(res, { success: true, message: 'Notifications fetched', status: 200, data: notifications });
  } catch (error) {
    next(error);
  }
}

/** POST /notifications – create a notification (admin / system use) */
export async function createNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Expect payload: { userId, title, message, link?, whatsappLink? }
    const { userId, title, message, link, whatsappLink } = req.body ?? {};
    if (!userId || !title || !message) {
      const err: any = new Error('userId, title, and message are required');
      err.status = 400;
      throw err;
    }
    const notif = await createNotification({ userId, title, message, link, whatsappLink });
    return sendResponse(res, { success: true, message: 'Notification created', status: 201, data: notif });
  } catch (error) {
    next(error);
  }
}

/** PATCH /notifications/:id/read – toggle read/unread status */
export async function toggleReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    if (!user?.id) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const { id } = req.params as any;
    const { read } = req.body ?? {};
    if (typeof read !== 'boolean') {
      const err: any = new Error('read flag must be a boolean');
      err.status = 400;
      throw err;
    }
    const updated = await toggleReadStatus(id, user.id, read);
    return sendResponse(res, { success: true, message: 'Notification status updated', status: 200, data: updated });
  } catch (error) {
    next(error);
  }
}
