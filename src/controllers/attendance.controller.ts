import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import {
  punchIn,
  punchOut,
  startLunchBreak,
  endLunchBreak,
  getFlaggedPunches,
  approvePunch,
  rejectPunch,
  getMonthlyAttendance,
  createLeaveRequest,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
} from '../services/attendance.service';

/** POST /attendance/punch – employee punch‑in */
export async function punchInHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, officeId, latitude, longitude } = req.body ?? {};
    if (!userId || !officeId || latitude === undefined || longitude === undefined) {
      const err: any = new Error('userId, officeId, latitude, longitude are required');
      err.status = 400;
      throw err;
    }
    const punch = await punchIn({ userId, officeId, latitude, longitude });
    return sendResponse(res, { success: true, message: 'Punch recorded', status: 201, data: punch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/punch/:id/out – punch‑out */
export async function punchOutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const punch = await punchOut(id);
    return sendResponse(res, { success: true, message: 'Punch out recorded', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** POST /attendance/punch/:id/lunch-start */
export async function startLunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lunch = await startLunchBreak(id);
    return sendResponse(res, { success: true, message: 'Lunch break started', status: 201, data: lunch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/lunch/:id/end */
export async function endLunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lunch = await endLunchBreak(id);
    return sendResponse(res, { success: true, message: 'Lunch break ended', status: 200, data: lunch });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/flagged – list punches awaiting manager action */
export async function flaggedPunchesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const punches = await getFlaggedPunches();
    return sendResponse(res, { success: true, message: 'Flagged punches fetched', status: 200, data: punches });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/flagged/:id/approve */
export async function approvePunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const punch = await approvePunch(id, managerId);
    return sendResponse(res, { success: true, message: 'Punch approved', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/flagged/:id/reject */
export async function rejectPunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const punch = await rejectPunch(id, managerId);
    return sendResponse(res, { success: true, message: 'Punch rejected', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/stats/:userId/:year/:month */
export async function attendanceStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, year, month } = req.params;
    const stats = await getMonthlyAttendance(userId, parseInt(year, 10), parseInt(month, 10));
    return sendResponse(res, { success: true, message: 'Attendance stats', status: 200, data: stats });
  } catch (error) {
    next(error);
  }
}

/** POST /attendance/leave-request */
export async function leaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, startDate, endDate, reason } = req.body ?? {};
    if (!userId || !startDate || !endDate || !reason) {
      const err: any = new Error('userId, startDate, endDate, reason required');
      err.status = 400;
      throw err;
    }
    const request = await createLeaveRequest({
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });
    return sendResponse(res, { success: true, message: 'Leave request created', status: 201, data: request });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/leave/:id/approve */
export async function approveLeaveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const request = await approveLeave(id, managerId);
    return sendResponse(res, { success: true, message: 'Leave approved', status: 200, data: request });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/leave/:id/reject */
export async function rejectLeaveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const request = await rejectLeave(id, managerId);
    return sendResponse(res, { success: true, message: 'Leave rejected', status: 200, data: request });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/leave-balance/:userId */
export async function leaveBalanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const balance = await getLeaveBalance(userId);
    return sendResponse(res, { success: true, message: 'Leave balance', status: 200, data: balance });
  } catch (error) {
    next(error);
  }
}
