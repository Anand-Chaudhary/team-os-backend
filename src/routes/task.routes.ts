import { Router } from 'express'
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  addRevision,
} from '../controllers/task.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
router.use(requireAuth)
router.get('/', listTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)
router.post('/:id/assignees', assignTask)
router.post('/:id/revisions', addRevision)
export default router
