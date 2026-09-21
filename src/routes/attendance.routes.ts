import { Router } from 'express';
import {
  punchInHandler,
  punchOutHandler,
  startLunchHandler,
  endLunchHandler,
  flaggedPunchesHandler,
  approvePunchHandler,
  rejectPunchHandler,
  attendanceStatsHandler,
  leaveRequestHandler,
  approveLeaveHandler,
  rejectLeaveHandler,
  leaveBalanceHandler,
} from '../controllers/attendance.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// Punch workflow
router.post('/punch', punchInHandler);
router.patch('/punch/:id/out', punchOutHandler);
router.post('/punch/:id/lunch-start', startLunchHandler);
router.patch('/lunch/:id/end', endLunchHandler);

// Manager approvals for flagged punches
router.get('/flagged', flaggedPunchesHandler);
router.patch('/flagged/:id/approve', approvePunchHandler);
router.patch('/flagged/:id/reject', rejectPunchHandler);

// Attendance statistics
router.get('/stats/:userId/:year/:month', attendanceStatsHandler);

// Leave requests
router.post('/leave-request', leaveRequestHandler);
router.patch('/leave/:id/approve', approveLeaveHandler);
router.patch('/leave/:id/reject', rejectLeaveHandler);
router.get('/leave-balance/:userId', leaveBalanceHandler);

export default router;
