import { Router } from 'express'
import exampleRoutes from './example.route'

const router = Router()

router.use('/example', exampleRoutes)

export default router
