import { prisma } from '../db/prisma';

/** List calendar posts belonging to a specific client */
export async function listCalendarPostsForClient(clientId: string) {
  return prisma.calendarPost.findMany({
    where: { clientId },
    orderBy: { scheduledDate: 'asc' },
  });
}
