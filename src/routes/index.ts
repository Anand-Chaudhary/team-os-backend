import { Router } from 'express'
import authRoutes from './auth.routes'
import exampleRoutes from './health.route'
import teamRoutes from './team.routes'
import clientRoutes from './client.routes'
import attendanceRoutes from './attendance.routes'
import taskRoutes from './task.routes'
import shootRoutes from './shoot.routes'
import calendarRoutes from './calendar.routes'
import publicCalendarRoutes from './publicCalendar.routes'
import notificationRoutes from './notification.routes'
import leadRoutes from './lead.routes'
import salarySlipRoutes from './salarySlip.routes'
import financeRoutes from './finance.routes'

const router = Router()

router.use('/health', exampleRoutes)
router.use('/auth', authRoutes)
router.use('/team', teamRoutes)
// Public calendar view – mounted before auth‑protected routes to avoid the global auth middleware
router.use(publicCalendarRoutes)
router.use('/clients', clientRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/tasks', taskRoutes)
router.use('/shoots', shootRoutes)
router.use('/calendar', calendarRoutes)
router.use('/notifications', notificationRoutes)
router.use('/leads', leadRoutes)
router.use('/finance', financeRoutes)
router.use('/salary-slips', salarySlipRoutes)

export default router
