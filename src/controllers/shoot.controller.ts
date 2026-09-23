import type { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/response'
import {
  listShoots as serviceListShoots,
  getShootById as serviceGetShoot,
  createShoot as serviceCreateShoot,
  updateShoot as serviceUpdateShoot,
  deleteShoot as serviceDeleteShoot,
  assignCrew as serviceAssignCrew,
  addGearItem as serviceAddGearItem,
} from '../services/shoot.service'

export async function listShoots(req: Request, res: Response, next: NextFunction) {
  try {
    const shoots = await serviceListShoots()
    return sendResponse(res, { success: true, message: 'Shoots fetched', status: 200, data: shoots })
  } catch (error) {
    next(error)
  }
}

export async function getShoot(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const shoot = await serviceGetShoot(id)
    if (!shoot) {
      const err: any = new Error('Shoot not found')
      err.status = 404
      throw err
    }
    return sendResponse(res, { success: true, message: 'Shoot fetched', status: 200, data: shoot })
  } catch (error) {
    next(error)
  }
}

export async function createShoot(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, title, scheduledAt, location, cost } = req.body ?? {}
    if (!title || !scheduledAt) {
      const err: any = new Error('title and scheduledAt required')
      err.status = 400
      throw err
    }
    const shoot = await serviceCreateShoot({ clientId, title, scheduledAt, location, cost })
    return sendResponse(res, { success: true, message: 'Shoot created', status: 201, data: shoot })
  } catch (error) {
    next(error)
  }
}

export async function updateShoot(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const { title, scheduledAt, location, cost, clientId } = req.body ?? {}
    const updateData: any = {
      ...(title && { title }),
      ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      ...(location !== undefined && { location }),
      ...(cost !== undefined && { cost }),
      ...(clientId && { client: { connect: { id: clientId } } }),
    }
    const shoot = await serviceUpdateShoot(id, updateData)
    return sendResponse(res, { success: true, message: 'Shoot updated', status: 200, data: shoot })
  } catch (error) {
    next(error)
  }
}

export async function deleteShoot(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    await serviceDeleteShoot(id)
    return sendResponse(res, { success: true, message: 'Shoot deleted', status: 200, data: null })
  } catch (error) {
    next(error)
  }
}

export async function assignCrew(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const { crew } = req.body ?? {}
    if (!Array.isArray(crew) || crew.length === 0) {
      const err: any = new Error('crew array required')
      err.status = 400
      throw err
    }
    // Validate each crew entry
    for (const member of crew) {
      if (!member.userId) {
        const err: any = new Error('Each crew entry must include a "userId" field')
        err.status = 400
        throw err
      }
    }
    const result = await serviceAssignCrew(id, crew)
    return sendResponse(res, { success: true, message: 'Crew assigned', status: 200, data: result })
  } catch (error) {
    next(error)
  }
}


export async function addGear(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string
    const { name, packed } = req.body ?? {}
    if (!name) {
      const err: any = new Error('Gear name required')
      err.status = 400
      throw err
    }
    const gear = await serviceAddGearItem(id, { name, packed })
    return sendResponse(res, { success: true, message: 'Gear added', status: 201, data: gear })
  } catch (error) {
    next(error)
  }
}
