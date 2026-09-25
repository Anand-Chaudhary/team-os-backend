import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { getCurrentUserFromToken } from '../services/auth.service'; // utility to fetch user info (already used in auth middleware)
import {
  listFinanceEntries,
  getFinanceEntryById,
  createFinanceEntry,
  updateFinanceEntry,
  deleteFinanceEntry,
  financeSummary,
} from '../services/finance.service';
import { StaffRole } from '../generated/prisma/enums';

/** Helper to enforce finance‑admin role */
function ensureFinanceAdmin(user: any) {
  const allowed: StaffRole[] = [StaffRole.SUPER_ADMIN, StaffRole.LEADER];
  if (!allowed.includes(user.role)) {
    const err: any = new Error('Finance access restricted to Super Admin and Leader roles');
    err.status = 403;
    throw err;
  }
}

/** GET /finance – list entries, optional query ?month=YYYY-MM&clientId=… */
export async function listFinanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, clientId } = req.query as any;
    // Role‑based visibility – only admins can see all, others get empty list (or could filter). Enforce here.
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const entries = await listFinanceEntries({ month, clientId });
    return sendResponse(res, { success: true, message: 'Finance entries fetched', status: 200, data: entries });
  } catch (error) {
    next(error);
  }
}

/** GET /finance/summary/:year/:month – aggregated totals */
export async function financeSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { year, month } = req.params;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const summary = await financeSummary({ month: monthStr });
    return sendResponse(res, { success: true, message: 'Finance summary', status: 200, data: summary });
  } catch (error) {
    next(error);
  }
}

/** GET /finance/:id – single entry */
export async function getFinanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const entry = await getFinanceEntryById(id as string);
    if (!entry) {
      const err: any = new Error('Finance entry not found');
      err.status = 404;
      throw err;
    }
    return sendResponse(res, { success: true, message: 'Finance entry fetched', status: 200, data: entry });
  } catch (error) {
    next(error);
  }
}

/** POST /finance – create entry */
export async function createFinanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const { type, category, amount, month, clientId, isInternal, note } = req.body ?? {};
    if (!type || !category || amount === undefined || !month) {
      const err: any = new Error('type, category, amount and month are required');
      err.status = 400;
      throw err;
    }
    const entry = await createFinanceEntry(user, {
      type,
      category,
      amount,
      month,
      clientId,
      isInternal: Boolean(isInternal),
      note,
    });
    return sendResponse(res, { success: true, message: 'Finance entry created', status: 201, data: entry });
  } catch (error) {
    next(error);
  }
}

/** PATCH /finance/:id – update entry */
export async function updateFinanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const { id } = req.params;
    const update = req.body ?? {};
    const entry = await updateFinanceEntry(user, id as string, update);
    return sendResponse(res, { success: true, message: 'Finance entry updated', status: 200, data: entry });
  } catch (error) {
    next(error);
  }
}

/** DELETE /finance/:id – delete entry */
export async function deleteFinanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req.user as any);
    ensureFinanceAdmin(user);
    const { id } = req.params;
    await deleteFinanceEntry(user, id as string);
    return sendResponse(res, { success: true, message: 'Finance entry deleted', status: 200, data: null });
  } catch (error) {
    next(error);
  }
}
