import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import {
  listCalendarPosts,
  getCalendarPost,
  createCalendarPost,
  updateCalendarPost,
  deleteCalendarPost,
  markPostAsPosted,
  getPublicCalendarPosts,
} from '../services/calendar.service';
import { PostApprovalStatus } from '../generated/prisma/enums';

/** GET /calendar – list all posts (auth required). */
export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await listCalendarPosts();
    return sendResponse(res, { success: true, message: 'Calendar posts fetched', status: 200, data: posts });
  } catch (error) {
    next(error);
  }
}

/** GET /calendar/:id – fetch a single post (auth required). */
export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const post = await getCalendarPost(id);
    if (!post) {
      const err: any = new Error('Calendar post not found');
      err.status = 404;
      throw err;
    }
    return sendResponse(res, { success: true, message: 'Calendar post fetched', status: 200, data: post });
  } catch (error) {
    next(error);
  }
}

/** POST /calendar – create a new calendar post (auth required). */
export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      clientId,
      taskId,
      caption,
      postType,
      scheduledDate,
      approvalStatus,
      revisionReason,
    } = req.body ?? {};
    if (!clientId || !postType || !scheduledDate) {
      const err: any = new Error('clientId, postType, and scheduledDate are required');
      err.status = 400;
      throw err;
    }
    // Normalize approvalStatus to a valid enum value; default to DRAFT if missing/invalid
    let normalizedStatus: PostApprovalStatus = PostApprovalStatus.DRAFT;
    if (approvalStatus) {
      const upper = (approvalStatus as string).toUpperCase();
      if (Object.values(PostApprovalStatus).includes(upper as PostApprovalStatus)) {
        normalizedStatus = upper as PostApprovalStatus;
      }
    }
    const post = await createCalendarPost({
      clientId,
      taskId,
      caption,
      postType,
      scheduledDate,
      approvalStatus: normalizedStatus,
      revisionReason,
    });
    return sendResponse(res, { success: true, message: 'Calendar post created', status: 201, data: post });
  } catch (error) {
    // Send a clean JSON error for task‑not‑found rather than a generic stack trace
    if ((error as any)?.status === 400 && (error as any).message?.includes('Task not found')) {
      return sendResponse(res, {
        success: false,
        message: (error as any).message,
        status: 400,
        data: null,
      });
    }
    next(error);
  }
}

/** PATCH /calendar/:id – update a post (auth required). */
export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const updateData = req.body ?? {};
    const post = await updateCalendarPost(id, updateData);
    return sendResponse(res, { success: true, message: 'Calendar post updated', status: 200, data: post });
  } catch (error) {
    next(error);
  }
}

/** DELETE /calendar/:id – delete a post (auth required). */
export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await deleteCalendarPost(id);
    return sendResponse(res, { success: true, message: 'Calendar post deleted', status: 200, data: null });
  } catch (error) {
    next(error);
  }
}

/** PATCH /calendar/:id/mark-posted – mark a post as posted (auth required). */
export async function markPosted(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const post = await markPostAsPosted(id);
    return sendResponse(res, { success: true, message: 'Calendar post marked as posted', status: 200, data: post });
  } catch (error) {
    next(error);
  }
}

/** GET /clients/:clientId/calendar – public read‑only view via share token. */
export async function publicCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.params.clientId as string;
    const token = req.query.token as string;
    if (!token) {
      const err: any = new Error('Token query parameter required');
      err.status = 400;
      throw err;
    }
    const posts = await getPublicCalendarPosts(clientId, token);
    return sendResponse(res, { success: true, message: 'Public calendar fetched', status: 200, data: posts });
  } catch (error) {
    next(error);
  }
}
