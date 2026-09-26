import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { createOrGetSalarySlip, getSalarySlipFile } from '../services/salarySlip.service';

/** POST /salary-slips – generate or fetch existing salary slip */
export async function createSalarySlip(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    if (!user?.id) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const result = await createOrGetSalarySlip(user.id, req.body ?? {});
    return sendResponse(res, {
      success: true,
      message: result.created ? 'Salary slip generated' : 'Salary slip already generated for this month',
      status: result.created ? 201 : 200,
      data: { id: result.id, url: result.url },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /salary-slips/:id – retrieve PDF */
export async function getSalarySlip(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    if (!user?.id) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const filePath = await getSalarySlipFile(user.id, req.params.id as string);
    // iframe‑friendly response
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}
