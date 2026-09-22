import { Router } from 'express'
import authRoutes from './auth.routes'
import exampleRoutes from './health.route'
import teamRoutes from './team.routes'
import clientRoutes from './client.routes'
import attendanceRoutes from './attendance.routes'
import taskRoutes from './task.routes'
import shootRoutes from './shoot.routes'

const router = Router()

router.use('/health', exampleRoutes)
router.use('/auth', authRoutes)
router.use('/team', teamRoutes)
router.use('/clients', clientRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/tasks', taskRoutes)
router.use('/shoots', shootRoutes)

export default router
