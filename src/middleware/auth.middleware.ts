import type { NextFunction, Request, Response } from 'express'

import { getCurrentUserFromToken, getRefreshTokenCookieName } from '../services/auth.service'
import { sendResponse } from '../utils/response'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.[getRefreshTokenCookieName()]
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined
    const token = bearerToken ?? cookieToken
    const user = await getCurrentUserFromToken(token)

    req.user = user
    return next()
  } catch (error) {
    const err = error as Error & { status?: number }
    return sendResponse(res, {
      success: false,
      message: err.message || 'Authentication required',
      status: err.status ?? 401,
      data: null
    })
  }
}
