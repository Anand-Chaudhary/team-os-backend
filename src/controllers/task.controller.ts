import type { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/response'
import {
  listTasks as serviceListTasks,
  getTaskById as serviceGetTask,
  createTask as serviceCreateTask,
  updateTask as serviceUpdateTask,
  deleteTask as serviceDeleteTask,
  listUserTasks as serviceListUserTasks,
  assignTask as serviceAssignTask,
  addTaskRevision as serviceAddTaskRevision,
  submitTask as serviceSubmitTask,
  approveTask as serviceApproveTask,
  rejectTask as serviceRejectTask,
} from '../services/task.service'

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await serviceListTasks()
    return sendResponse(res, { success: true, message: 'Tasks fetched', status: 200, data: tasks })
  } catch (error) {
    next(error)
  }
}

/** Get tasks assigned to the authenticated employee */
export async function listMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any)?.id
    if (!userId) {
      const err: any = new Error('Unauthenticated')
      err.status = 401
      throw err
    }
    const tasks = await serviceListUserTasks(userId)
    return sendResponse(res, { success: true, message: 'Your tasks fetched', status: 200, data: tasks })
  } catch (error) {
    next(error)
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const task = await serviceGetTask(id)
    if (!task) {
      const err: any = new Error('Task not found')
      err.status = 404
      throw err
    }
    return sendResponse(res, { success: true, message: 'Task fetched', status: 200, data: task })
  } catch (error) {
    next(error)
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, clientId, deadline, priority, deliverableId, deliverablesId, deliverableIds } = req.body ?? {}
    if (!title) {
      const err: any = new Error('Title required')
      err.status = 400
      throw err
    }
    const finalDeliverableId = deliverableId || deliverablesId || (Array.isArray(deliverableIds) ? deliverableIds[0] : undefined)
    const createdById = (req.user as any)?.id
    const task = await serviceCreateTask({
      title,
      description,
      clientId,
      deadline,
      priority,
      createdById,
      deliverableId: finalDeliverableId,
    })
    return sendResponse(res, { success: true, message: 'Task created', status: 201, data: task })
  } catch (error) {
    next(error)
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const { title, description, status, priority, deadline, clientId } = req.body ?? {}
    const updateData: any = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(clientId && { clientId }),
    }
    const task = await serviceUpdateTask(id, updateData)
    return sendResponse(res, { success: true, message: 'Task updated', status: 200, data: task })
  } catch (error) {
    next(error)
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    await serviceDeleteTask(id)
    return sendResponse(res, { success: true, message: 'Task deleted', status: 200, data: null })
  } catch (error) {
    next(error)
  }
}

export async function assignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params.id || req.body?.taskId || req.body?.id) as string
    const { assigneeIds, deliverableId, deliverablesId, deliverableIds } = req.body ?? {}
    if (!id) {
      const err: any = new Error('Task ID required')
      err.status = 400
      throw err
    }
    if (!Array.isArray(assigneeIds) || assigneeIds.length === 0) {
      const err: any = new Error('assigneeIds array required')
      err.status = 400
      throw err
    }
    const finalDeliverableId = deliverableId || deliverablesId || (Array.isArray(deliverableIds) ? deliverableIds[0] : undefined)
    const result = await serviceAssignTask(id, assigneeIds, finalDeliverableId)
    return sendResponse(res, { success: true, message: 'Assignees added', status: 200, data: result })
  } catch (error) {
    next(error)
  }
}

export async function addRevision(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const { note, attachmentUrl } = req.body ?? {}
    if (!note) {
      const err: any = new Error('Revision note required')
      err.status = 400
      throw err
    }
    const submittedById = (req.user as any)?.id
    const revision = await serviceAddTaskRevision(id, { note, attachmentUrl, submittedById })
    return sendResponse(res, { success: true, message: 'Revision added', status: 201, data: revision })
  } catch (error) {
    next(error)
  }
}

export async function submitTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const submittedById = (req.user as any)?.id
    const task = await serviceSubmitTask(id, submittedById)
    return sendResponse(res, { success: true, message: 'Task submitted for approval', status: 200, data: task })
  } catch (error) {
    next(error)
  }
}

export async function approveTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const approvedById = (req.user as any)?.id
    const task = await serviceApproveTask(id, approvedById)
    return sendResponse(res, { success: true, message: 'Task approved', status: 200, data: task })
  } catch (error) {
    next(error)
  }
}

export async function rejectTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const rejectedById = (req.user as any)?.id
    const { reason } = req.body ?? {}
    const task = await serviceRejectTask(id, rejectedById, reason)
    return sendResponse(res, { success: true, message: 'Task rejected', status: 200, data: task })
  } catch (error) {
    next(error)
  }
}
