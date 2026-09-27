import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import {
  createClientReview as svcCreateClientReview,
  listPendingReviews as svcListPendingReviews,
  addClientReview as svcAddClientReview,
  getReviewsForPost as svcGetReviewsForPost,
} from '../services/clientReview.service';

/** POST /client-review – employee uploads media for client review */
export async function createClientReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, postType, scheduledDate, mediaUrl, caption } = req.body ?? {};
    if (!clientId || !postType || !scheduledDate) {
      const err: any = new Error('clientId, postType, and scheduledDate are required');
      err.status = 400;
      throw err;
    }
    const post = await svcCreateClientReview({ clientId, postType, scheduledDate, mediaUrl, caption });
    return sendResponse(res, {
      success: true,
      message: 'Review post created',
      status: 201,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /client-review – list posts awaiting client review (DRAFT status) */
export async function listPendingReviews(req: Request, res: Response, next: NextFunction) {
  try {
    // optional query param clientId to filter
    const clientId = req.query.clientId as string | undefined;
    const posts = await svcListPendingReviews(clientId);
    return sendResponse(res, {
      success: true,
      message: 'Pending review posts fetched',
      status: 200,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /client-review/:id/review – client submits a change request (max 3) */
export async function addClientReview(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = req.params.id as string;
    const { feedback } = req.body ?? {};
    if (!feedback) {
      const err: any = new Error('feedback is required');
      err.status = 400;
      throw err;
    }
    const review = await svcAddClientReview(postId, feedback);
    return sendResponse(res, {
      success: true,
      message: 'Client feedback recorded',
      status: 201,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /client-review/:id/reviews – employee retrieves client feedback for a post */
export async function getReviewsForPost(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = req.params.id as string;
    const reviews = await svcGetReviewsForPost(postId);
    return sendResponse(res, {
      success: true,
      message: 'Client reviews fetched',
      status: 200,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}
