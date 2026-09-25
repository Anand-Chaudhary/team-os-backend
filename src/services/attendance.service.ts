import { prisma } from '../db/prisma';

/** Utility: calculate distance in metres between two lat/lng points using the Haversine formula */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371000; // Earth radius in metres
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Compute whether a check‑in is late based on a user's configured report time and grace period. */
function computeLateStatus(reportTime: string | null, graceMins: number | null, checkIn: Date): boolean {
  if (!reportTime) return false;
  // reportTime format assumed "HH:mm"
  const [hourStr, minuteStr] = reportTime.split(':');
  const reportDate = new Date(checkIn);
  reportDate.setHours(parseInt(hourStr, 10), parseInt(minuteStr, 10), 0, 0);
  const allowed = new Date(reportDate.getTime() + (graceMins ?? 0) * 60000);
  return checkIn > allowed;
}

/** Punch‑in: creates a Punch record, validates geofence, determines status. */
export async function punchIn(data: {
  userId: string;
  officeId?: string | null;
  latitude: number;
  longitude: number;
}) {
  const { userId, officeId, latitude, longitude } = data;

  if (!userId) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const officeLatitude = Number(process.env.OFFICE_LATITUDE);
  const officeLongitude = Number(process.env.OFFICE_LONGITUDE);
  const officeRadiusM = Number(process.env.OFFICE_RADIUS_M);

  const distanceM = haversineDistance(latitude, longitude, officeLatitude, officeLongitude);
  const now = new Date();

  let status: 'ON_TIME' | 'FLAGGED' | 'LATE' = 'ON_TIME';
  if (distanceM > officeRadiusM) status = 'FLAGGED';
  if (computeLateStatus(user.reportTime ?? null, user.gracePeriodMins ?? null, now)) {
    status = status === 'FLAGGED' ? 'FLAGGED' : 'LATE';
  }

  const punch = await prisma.punch.create({
    data: {
      userId,
      officeId: null,
      checkIn: now,
      checkInLat: latitude,
      checkInLng: longitude,
      distanceM,
      status,
    },
  });
  return punch;
}

/** Punch‑out: sets the checkOut timestamp on an existing punch. */
export async function punchOut(punchId: string) {
  const punch = await prisma.punch.findUnique({ where: { id: punchId } });
  if (!punch) {
    const err: any = new Error('Punch not found');
    err.status = 404;
    throw err;
  }
  if (punch.checkOut) {
    const err: any = new Error('Punch already checked out');
    err.status = 400;
    throw err;
  }
  return prisma.punch.update({
    where: { id: punchId },
    data: { checkOut: new Date() },
  });
}

/** Find the active punch for a user and complete it. */
export async function punchOutForUser(userId: string) {
  const punch = await prisma.punch.findFirst({
    where: { userId, checkOut: null },
    orderBy: { checkIn: 'desc' },
  });

  if (!punch) {
    const err: any = new Error('No active punch found for user');
    err.status = 404;
    throw err;
  }

  return punchOut(punch.id);
}

/** Start a lunch break for a punch. */
export async function startLunchBreak(punchId: string) {
  const punch = await prisma.punch.findUnique({ where: { id: punchId } });
  if (!punch) {
    const err: any = new Error('Punch not found');
    err.status = 404;
    throw err;
  }
  const lunch = await prisma.lunchBreak.create({
    data: { punchId, start: new Date() },
  });
  return lunch;
}

/** End a lunch break. */
export async function endLunchBreak(lunchBreakId: string) {
  const lunch = await prisma.lunchBreak.findUnique({ where: { id: lunchBreakId } });
  if (!lunch) {
    const err: any = new Error('Lunch break not found');
    err.status = 404;
    throw err;
  }
  if (lunch.end) {
    const err: any = new Error('Lunch break already ended');
    err.status = 400;
    throw err;
  }
  return prisma.lunchBreak.update({
    where: { id: lunchBreakId },
    data: { end: new Date() },
  });
}

/** Get all punches needing manager approval (status FLAGGED). */
export async function getFlaggedPunches() {
  return prisma.punch.findMany({
    where: { status: 'FLAGGED' },
    include: { user: true, office: true },
  });
}

/** Approve a flagged punch. */
export async function approvePunch(punchId: string, managerId: string) {
  const punch = await prisma.punch.findUnique({ where: { id: punchId } });
  if (!punch) {
    const err: any = new Error('Punch not found');
    err.status = 404;
    throw err;
  }
  return prisma.punch.update({
    where: { id: punchId },
    data: { status: 'APPROVED', approvedById: managerId },
  });
}

/** Reject a flagged punch. */
export async function rejectPunch(punchId: string, managerId: string) {
  const punch = await prisma.punch.findUnique({ where: { id: punchId } });
  if (!punch) {
    const err: any = new Error('Punch not found');
    err.status = 404;
    throw err;
  }
  return prisma.punch.update({
    where: { id: punchId },
    data: { status: 'REJECTED', approvedById: managerId },
  });
}

/** Get the latest attendance record for the current day for a user. */
export async function getTodayAttendance(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const punches = await prisma.punch.findMany({
    where: { userId, checkIn: { gte: start, lte: end } },
    orderBy: { checkIn: 'desc' },
    take: 1,
  });

  return punches[0] ?? null;
}

/** Compute monthly attendance summary for a user. */
export async function getMonthlyAttendance(userId: string, year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const punches = await prisma.punch.findMany({
    where: { userId, checkIn: { gte: start, lt: end } },
    orderBy: { checkIn: 'asc' },
    include: { lunchBreaks: true },
  });

  let totalWorkMs = 0;
  let lateCount = 0;
  let flaggedCount = 0;
  for (const p of punches) {
    if (p.status === 'LATE') lateCount++;
    if (p.status === 'FLAGGED') flaggedCount++;
    if (p.checkOut) {
      totalWorkMs += p.checkOut.getTime() - p.checkIn.getTime();
    }
  }
  const totalHours = totalWorkMs / 1000 / 60 / 60;
  return { totalHours, lateCount, flaggedCount, punchCount: punches.length };
}

/** Create a leave request for a user. */
export async function createLeaveRequest(data: {
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  const { userId, startDate, endDate, reason } = data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return prisma.leaveRequest.create({
    data: { userId, startDate, endDate, reason },
  });
}

/** Approve a leave request (manager action). */
export async function approveLeave(requestId: string, managerId: string) {
  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err: any = new Error('Leave request not found');
    err.status = 404;
    throw err;
  }
  return prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED', reviewedById: managerId },
  });
}

/** Reject a leave request (manager action). */
export async function rejectLeave(requestId: string, managerId: string) {
  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err: any = new Error('Leave request not found');
    err.status = 404;
    throw err;
  }
  return prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', reviewedById: managerId },
  });
}

/** Get remaining paid leave balance for a user (2 paid leaves per year). */
export async function getLeaveBalance(userId: string) {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  const used = await prisma.leaveRequest.count({
    where: {
      userId,
      status: 'APPROVED',
      startDate: { gte: yearStart, lt: yearEnd },
    },
  });
  const total = 2;
  return { total, used, remaining: Math.max(total - used, 0) };
}

/** Get leave requests for a user */
export async function getLeaveRequests(userId: string) {
  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  // Return all leave requests for the user, most recent first
  return prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
}
