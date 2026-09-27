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
import clientReviewRoutes from './clientReview.routes'
import financeRoutes from './finance.routes'
import salarySlipRoutes from './salarySlip.routes'
import contentCalendarRoutes from './contentCalendar.routes'

const router = Router()

router.use('/health', exampleRoutes)
router.use('/auth', authRoutes)
router.use('/team', teamRoutes)
router.use(publicCalendarRoutes)
router.use('/clients', clientRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/tasks', taskRoutes)
router.use('/shoots', shootRoutes)
router.use('/calendar', calendarRoutes)
router.use('/leads', leadRoutes)
router.use('/notifications', notificationRoutes)
router.use('/finance', financeRoutes)
router.use('/content-calendar', contentCalendarRoutes)
router.use('/client-review', clientReviewRoutes)
router.use('/salary-slips', salarySlipRoutes)



export default router
