import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { sanitizeUser } from '../utils/user';
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
    const { officeId, latitude, longitude } = req.body ?? {};
    const userId = (req.user as any)?.id;
    if (!userId) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    if (latitude === undefined || longitude === undefined) {
      const err: any = new Error('latitude and longitude are required');
      err.status = 400;
      throw err;
    }
    // Cast to expected types to satisfy TypeScript
    const officeIdStr = officeId as string | undefined;
    const latitudeNum = Number(latitude);
    const longitudeNum = Number(longitude);
    if (Number.isNaN(latitudeNum) || Number.isNaN(longitudeNum)) {
      const err: any = new Error('latitude and longitude must be numbers');
      err.status = 400;
      throw err;
    }
    const punch = await punchIn({ userId, officeId: officeIdStr, latitude: latitudeNum, longitude: longitudeNum });
    return sendResponse(res, { success: true, message: 'Punch recorded', status: 201, data: punch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/punch/:id/out – punch‑out */
export async function punchOutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const punchId = id as string;
    const punch = await punchOut(punchId);
    return sendResponse(res, { success: true, message: 'Punch out recorded', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** POST /attendance/punch/:id/lunch-start */
export async function startLunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lunchId = id as string;
    const lunch = await startLunchBreak(lunchId);
    return sendResponse(res, { success: true, message: 'Lunch break started', status: 201, data: lunch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/lunch/:id/end */
export async function endLunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lunchId = id as string;
    const lunch = await endLunchBreak(lunchId);
    return sendResponse(res, { success: true, message: 'Lunch break ended', status: 200, data: lunch });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/flagged – list punches awaiting manager action */
export async function flaggedPunchesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const punches = await getFlaggedPunches();
    const safePunches = punches.map((punch) => ({
      ...punch,
      user: punch.user ? sanitizeUser(punch.user) : null,
    }));
    return sendResponse(res, { success: true, message: 'Flagged punches fetched', status: 200, data: safePunches });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/flagged/:id/approve */
export async function approvePunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const punchId = id as string;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const punch = await approvePunch(punchId, managerId);
    return sendResponse(res, { success: true, message: 'Punch approved', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/flagged/:id/reject */
export async function rejectPunchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const punchId = id as string;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const punch = await rejectPunch(punchId, managerId);
    return sendResponse(res, { success: true, message: 'Punch rejected', status: 200, data: punch });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/stats/:userId/:year/:month */
export async function attendanceStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, year, month } = req.params;
    const userIdStr = userId as string;
    const yearStr = year as string;
    const monthStr = month as string;
    const stats = await getMonthlyAttendance(userIdStr, parseInt(yearStr, 10), parseInt(monthStr, 10));
    return sendResponse(res, { success: true, message: 'Attendance stats', status: 200, data: stats });
  } catch (error) {
    next(error);
  }
}

/** POST /attendance/leave-request */
export async function leaveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, reason } = req.body ?? {};
    const userId = (req.user as any)?.id;
    if (!userId) {
      const err: any = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    if (!startDate || !endDate || !reason) {
      const err: any = new Error('startDate, endDate, reason are required');
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
    const leaveId = id as string;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const request = await approveLeave(leaveId, managerId);
    return sendResponse(res, { success: true, message: 'Leave approved', status: 200, data: request });
  } catch (error) {
    next(error);
  }
}

/** PATCH /attendance/leave/:id/reject */
export async function rejectLeaveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const leaveId = id as string;
    const managerId = (req.user as any)?.id;
    if (!managerId) {
      const err: any = new Error('Manager authentication required');
      err.status = 401;
      throw err;
    }
    const request = await rejectLeave(leaveId, managerId);
    return sendResponse(res, { success: true, message: 'Leave rejected', status: 200, data: request });
  } catch (error) {
    next(error);
  }
}

/** GET /attendance/leave-balance/:userId */
export async function leaveBalanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const userIdStr = userId as string;
    const balance = await getLeaveBalance(userIdStr);
    return sendResponse(res, { success: true, message: 'Leave balance', status: 200, data: balance });
  } catch (error) {
    next(error);
  }
}
