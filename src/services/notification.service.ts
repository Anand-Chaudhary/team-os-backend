import { PrismaClient } from '../generated/prisma/client';
import { prisma } from '../db/prisma';

/** Create a notification record */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  whatsappLink?: string | null;
}) {
  const { userId, title, message, link, whatsappLink } = params;
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      link: link ?? null,
      whatsappLink: whatsappLink ?? null,
    },
  });
}

/** List notifications for a user, most recent first */
export async function listUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Toggle read status – only the owner can change */
export async function toggleReadStatus(notificationId: string, userId: string, read: boolean) {
  // Ensure the notification belongs to the user
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif) {
    const err: any = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  if (notif.userId !== userId) {
    const err: any = new Error('Unauthorized');
    err.status = 403;
    throw err;
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read },
  });
}
