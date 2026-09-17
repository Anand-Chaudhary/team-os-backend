import { Router } from 'express'
import exampleRoutes from './health.route'

const router = Router()

router.use('/health', exampleRoutes)

export default router
