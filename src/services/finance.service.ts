// Finance service – CRUD and reporting for finance entries (Phase 5)

import { prisma } from '../db/prisma';
import { FinanceType, StaffRole } from '../generated/prisma/enums';
import type { UserModel as User } from '../generated/prisma/models/User';

/** Helper to ensure the user has finance admin rights */
function assertFinanceAdmin(user: User) {
  const allowed: StaffRole[] = [StaffRole.SUPER_ADMIN, StaffRole.LEADER];
  if (!allowed.includes(user.role as StaffRole)) {
    const err: any = new Error('Finance access restricted to Super Admin and Leader roles');
    err.status = 403;
    throw err;
  }
}

/** List finance entries – optional filters by month (YYYY-MM) and clientId */
export async function listFinanceEntries(params: {
  month?: string; // e.g. '2024-09'
  clientId?: string;
}) {
  const where: any = {};
  if (params.month) {
    // month stored as first-of-month DateTime – we can filter by year and month
    const [year, month] = params.month.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1)); // exclusive
    where.month = { gte: start, lt: end };
  }
  if (params.clientId) {
    where.clientId = params.clientId;
  }
  return prisma.financeEntry.findMany({
    where,
    include: { client: true, enteredBy: true },
    orderBy: { month: 'desc' },
  });
}

/** Get a single finance entry by ID */
export async function getFinanceEntryById(id: string) {
  return prisma.financeEntry.findUnique({ where: { id }, include: { client: true, enteredBy: true } });
}

/** Create a finance entry – only permitted for finance admins */
export async function createFinanceEntry(user: User, data: {
  type: FinanceType;
  category: string;
  amount: number | string;
  month: string; // ISO date string (any day of month, will be normalized to first day)
  clientId?: string | null;
  isInternal?: boolean;
  note?: string | null;
}) {
  assertFinanceAdmin(user);
  const { type, category, amount, month, clientId = null, isInternal = false, note = null } = data;
  const monthDate = new Date(month);
  // Normalize to first of month UTC to keep grouping consistent
  monthDate.setUTCDate(1);
  monthDate.setUTCHours(0, 0, 0, 0);

  return prisma.financeEntry.create({
    data: {
      type,
      category,
      amount: amount as any,
      month: monthDate,
      client: clientId ? { connect: { id: clientId } } : undefined,
      isInternal,
      note,
      enteredBy: { connect: { id: user.id } },
    },
    include: { client: true, enteredBy: true },
  });
}

/** Update a finance entry – only permitted for finance admins */
export async function updateFinanceEntry(user: User, id: string, update: {
  type?: FinanceType;
  category?: string;
  amount?: number | string;
  month?: string;
  clientId?: string | null;
  isInternal?: boolean;
  note?: string | null;
}) {
  assertFinanceAdmin(user);
  const data: any = { ...update };
  if (update.month) {
    const m = new Date(update.month);
    m.setUTCDate(1);
    m.setUTCHours(0, 0, 0, 0);
    data.month = m;
  }
  if (update.clientId !== undefined) {
    if (update.clientId) {
      data.client = { connect: { id: update.clientId } };
    } else {
      data.client = { disconnect: true };
    }
    delete data.clientId;
  }
  return prisma.financeEntry.update({ where: { id }, data, include: { client: true, enteredBy: true } });
}

/** Delete a finance entry – only permitted for finance admins */
export async function deleteFinanceEntry(user: User, id: string) {
  assertFinanceAdmin(user);
  return prisma.financeEntry.delete({ where: { id } });
}

/** Summary report – total per category for a month */
export async function financeSummary(params: { month: string }) {
  const [year, month] = params.month.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const rows = await prisma.financeEntry.groupBy({
    by: ['category', 'type'],
    where: { month: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return rows;
}
