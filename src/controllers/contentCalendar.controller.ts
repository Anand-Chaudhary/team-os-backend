import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { listCalendarPostsForClient } from '../services/contentCalendar.service';

/** GET /content-calendar/:clientId – returns calendar posts for the client */
export async function getContentCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.params.clientId as string;
    const posts = await listCalendarPostsForClient(clientId);
    return sendResponse(res, {
      success: true,
      message: 'Content calendar fetched',
      status: 200,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
}
