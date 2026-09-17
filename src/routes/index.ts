import { Router } from 'express'
import authRoutes from './auth.routes'
import exampleRoutes from './health.route'

const router = Router()

router.use('/health', exampleRoutes)
router.use('/auth', authRoutes)

export default router
