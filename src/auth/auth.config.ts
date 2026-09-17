import type { CookieOptions } from 'express'

export const VALID_ROLES = ['SUPER_ADMIN', 'LEADER', 'MANAGER', 'EXECUTIVE', 'SALES', 'CLIENT'] as const
export const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? JWT_SECRET

export type SafeUser = Record<string, any>

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: REFRESH_TOKEN_TTL_MS
}
