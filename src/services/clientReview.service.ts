import { prisma } from '../db/prisma';
import { createCalendarPost, listCalendarPosts } from './calendar.service';
import { PostApprovalStatus } from '../generated/prisma/enums';

/** Employee creates a new CalendarPost that will be reviewed by the client */
export async function createClientReview(data: {
  clientId: string;
  postType: string;
  scheduledDate: string | Date;
  mediaUrl?: string;
  caption?: string;
}) {
  // Store media URL in the caption field for now (or any other field you prefer).
  const caption = data.mediaUrl ?? data.caption ?? null;
  const post = await createCalendarPost({
    clientId: data.clientId,
    postType: data.postType,
    scheduledDate: data.scheduledDate,
    caption,
    approvalStatus: PostApprovalStatus.DRAFT,
  });
  return post;
}

/** List posts that are pending client review (status DRAFT) – optional client filter */
export async function listPendingReviews(clientId?: string) {
  const where: any = { approvalStatus: PostApprovalStatus.DRAFT };
  if (clientId) {
    where.clientId = clientId;
  }
  return prisma.calendarPost.findMany({ where });
}

/** Client posts feedback for a specific calendar post – limited to 3 requests */
export async function addClientReview(postId: string, feedback: string) {
  // Count existing reviews for this post.
  const existingCount = await prisma.clientReview.count({ where: { calendarPostId: postId } });
  if (existingCount >= 3) {
    const err: any = new Error('Maximum of 3 change requests exceeded for this post');
    err.status = 400;
    throw err;
  }

  const review = await prisma.clientReview.create({
    data: {
      calendarPostId: postId,
      feedback,
    },
  });

  // Update the calendar post to reflect a revision request.
  await prisma.calendarPost.update({
    where: { id: postId },
    data: {
      approvalStatus: PostApprovalStatus.REVISION_REQUESTED,
      revisionReason: feedback,
    },
  });

  return review;
}

/** Retrieve all client reviews for a given calendar post */
export async function getReviewsForPost(postId: string) {
  return prisma.clientReview.findMany({
    where: { calendarPostId: postId },
    orderBy: { createdAt: 'asc' },
  });
}
