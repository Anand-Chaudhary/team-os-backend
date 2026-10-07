import { Router } from 'express'
import {
  listTasks,
  listMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  addRevision,
  submitTask,
  approveTask,
  rejectTask,
} from '../controllers/task.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
router.use(requireAuth)
router.get('/', listTasks)
router.get('/me', listMyTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.post('/:id/assignees', assignTask)
router.post('/:id/assign', assignTask)
router.post('/assign', assignTask)
router.post('/:id/revisions', addRevision)
router.patch('/:id/submit', submitTask)
router.patch('/:id/approve', approveTask)
router.patch('/:id/reject', rejectTask)
export default router
