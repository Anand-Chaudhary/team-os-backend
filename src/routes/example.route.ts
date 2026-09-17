import { Router } from 'express'

const router = Router()

router.get('/ping', (_, res) => {
  res.json({ message: 'pong' })
})

export default router
