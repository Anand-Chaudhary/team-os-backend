import type { Request, Response, NextFunction } from 'express'

import { AUTH_COOKIE_OPTIONS } from '../auth/auth.config'
import {
  getRefreshTokenCookieName,
  loginUser,
  logoutUser,
  registerUser,
  changePassword as svcChangePassword,
} from '../services/auth.service'
import { sendResponse } from '../utils/response'
import { sanitizeUser } from '../utils/user'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone, role } = req.body ?? {}

    const result = await registerUser({ name, email, password, phone, role })

    res.cookie(getRefreshTokenCookieName(), result.refreshToken, AUTH_COOKIE_OPTIONS)

    return sendResponse(res, {
      success: true,
      message: 'Registration successful',
      status: 201,
      data: {
        user: sanitizeUser(result.user),
        token: result.accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body ?? {}

    const result = await loginUser({ email, password })

    res.cookie(getRefreshTokenCookieName(), result.refreshToken, AUTH_COOKIE_OPTIONS)

    return sendResponse(res, {
      success: true,
      message: 'Login successful',
      status: 200,
      data: {
        user: sanitizeUser(result.user),
        token: result.accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[getRefreshTokenCookieName()]
    await logoutUser(token)

    res.clearCookie(getRefreshTokenCookieName(), { path: '/' })

    return sendResponse(res, {
      success: true,
      message: 'Logged out successfully',
      status: 200,
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user

    return sendResponse(res, {
      success: true,
      message: 'Profile fetched successfully',
      status: 200,
      data: {
        user: sanitizeUser(user),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Change password for the authenticated user.
 * Expects `oldPassword` and `newPassword` in the request body.
 */
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = req.body ?? {}
    const user = req.user
    if (!user) {
      const err: any = new Error('Authentication required')
      err.status = 401
      throw err
    }
    await svcChangePassword(user.id, oldPassword, newPassword)
    return sendResponse(res, {
      success: true,
      message: 'Password changed successfully',
      status: 200,
      data: null,
    })
  } catch (error) {
    next(error)
  }
}
