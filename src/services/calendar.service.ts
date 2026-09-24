import { prisma } from '../db/prisma';
import { PostApprovalStatus } from '../generated/prisma/enums';

/** List all calendar posts (auth-protected). */
export async function listCalendarPosts() {
  return prisma.calendarPost.findMany();
}

/** Get a single calendar post by its ID. */
export async function getCalendarPost(id: string) {
  return prisma.calendarPost.findUnique({ where: { id } });
}

/** Create a new calendar post. */
export async function createCalendarPost(data: {
  clientId: string;
  taskId?: string | null;
  caption?: string | null;
  postType: string;
  scheduledDate: Date | string;
  approvalStatus?: PostApprovalStatus; // enum PostApprovalStatus
  revisionReason?: string | null;
}) {
  const { clientId, taskId } = data;
  // If a taskId is provided, ensure the referenced task exists to avoid FK violations.
  if (taskId) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      const err: any = new Error('Task not found for provided taskId');
      err.status = 400;
      throw err;
    }
  }
  return prisma.calendarPost.create({ data });
}

/** Update an existing calendar post. */
export async function updateCalendarPost(id: string, updateData: any) {
  return prisma.calendarPost.update({ where: { id }, data: updateData });
}

/** Delete a calendar post. */
export async function deleteCalendarPost(id: string) {
  return prisma.calendarPost.delete({ where: { id } });
}

/** Mark a post as posted (sets posted flag and timestamp). */
export async function markPostAsPosted(id: string) {
  return prisma.calendarPost.update({
    where: { id },
    data: {
      posted: true,
      postedAt: new Date(),
    },
  });
}

/** Public view: fetch calendar posts for a client after validating share token. */
export async function getPublicCalendarPosts(clientId: string, token: string) {
  // Verify the token matches an active ShareLink for the client
  const link = await prisma.shareLink.findFirst({
    where: { clientId, token, active: true },
  });
  if (!link) {
    const err: any = new Error('Invalid or inactive share link');
    err.status = 403;
    throw err;
  }
  // Return posts for the client (read‑only view)
  return prisma.calendarPost.findMany({ where: { clientId } });
}
