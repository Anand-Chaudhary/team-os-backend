import { Router } from 'express';
import {
  punchInHandler,
  punchOutHandler,
  startLunchHandler,
  endLunchHandler,
  flaggedPunchesHandler,
  approvePunchHandler,
  rejectPunchHandler,
  todayAttendanceHandler,
  attendanceStatsHandler,
  leaveRequestHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  leaveBalanceHandler,
  getLeaveRequestsHandler,
} from '../controllers/attendance.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// Punch workflow
router.post('/punch', punchInHandler);
router.post('/punch/out', punchOutHandler);
router.patch('/punch/out', punchOutHandler);
router.patch('/punch/:id/out', punchOutHandler);
router.post('/punch/:id/lunch-start', startLunchHandler);
router.patch('/lunch/:id/end', endLunchHandler);

// Manager approvals for flagged punches
router.get('/flagged', flaggedPunchesHandler);
router.patch('/flagged/:id/approve', approvePunchHandler);
router.patch('/flagged/:id/reject', rejectPunchHandler);

// Today attendance for the logged in user
router.get('/today', todayAttendanceHandler);

// Attendance statistics
router.get('/stats/:userId/:year/:month', attendanceStatsHandler);

// Leave requests
router.post('/leave-request', leaveRequestHandler);
router.patch('/leave/:id/approve', approveLeaveHandler);
router.patch('/leave/:id/reject', rejectLeaveHandler);
router.get('/leave-balance/:userId', leaveBalanceHandler);
router.get('/leave-requests', getLeaveRequestsHandler);

export default router;
