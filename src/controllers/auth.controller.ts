import type { Request, Response, NextFunction } from 'express'

import { AUTH_COOKIE_OPTIONS } from '../auth/auth.config'
import {
  getRefreshTokenCookieName,
  loginUser,
  logoutUser,
  registerUser
} from '../services/auth.service'
import { sendResponse } from '../utils/response'

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
        user: result.user,
        token: result.accessToken
      }
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
        user: result.user,
        token: result.accessToken
      }
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
      data: null
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
        user
      }
    })
  } catch (error) {
    next(error)
  }
}
