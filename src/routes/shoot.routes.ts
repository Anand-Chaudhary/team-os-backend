import { Router } from 'express'
import {
  listShoots,
  getShoot,
  createShoot,
  updateShoot,
  deleteShoot,
  assignCrew,
  addGear,
} from '../controllers/shoot.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
router.use(requireAuth)
router.get('/', listShoots)
router.get('/:id', getShoot)
router.post('/', createShoot)
router.patch('/:id', updateShoot)
router.delete('/:id', deleteShoot)
router.post('/:id/crew', assignCrew)
router.post('/:id/gear', addGear)
export default router
