import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { getDeliverablesByClientId } from '../services/deliverable.service';

/**
 * GET /deliverables/:clientId
 * Fetch all deliverables configured for a client.
 */
export async function getDeliverables(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.clientId || (req.params as any)['{clientId}'] || '';
    const clientId = String(rawId).replace(/[{}]/g, '').trim();

    if (!clientId) {
      const err: any = new Error('Client ID is required');
      err.status = 400;
      throw err;
    }

    const deliverables = await getDeliverablesByClientId(clientId);

    return sendResponse(res, {
      success: true,
      message: 'Deliverables fetched successfully',
      status: 200,
      data: deliverables,
    });
  } catch (error) {
    next(error);
  }
}
