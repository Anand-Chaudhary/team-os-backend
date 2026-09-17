import { Router } from 'express'
import { sendResponse } from '../utils/response'

const router = Router()

router.get('/', (_, res) => {
  sendResponse(res, {
    success: true,
    message: 'Healthy',
    status: 200,
    data: { ok: true }
  })
})

export default router
