import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { prisma } from '../db/prisma'
import {
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  VALID_ROLES
} from '../auth/auth.config'

const db = prisma as any

function sanitizeUser<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

function hashToken(token: string) {
  return Buffer.from(token).toString('base64')
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

function signAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' })
}

export function getRefreshTokenCookieName() {
  return REFRESH_TOKEN_COOKIE_NAME
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
  phone?: string | null
  role?: string
}) {
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  const password = input.password ?? ''

  if (!name) {
    const error = new Error('Name is required') as Error & { status?: number }
    error.status = 400
    throw error
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('A valid email is required') as Error & { status?: number }
    error.status = 400
    throw error
  }

  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long') as Error & { status?: number }
    error.status = 400
    throw error
  }

  const role = VALID_ROLES.includes(input.role as (typeof VALID_ROLES)[number]) ? input.role : 'SALES'

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    const error = new Error('A user with this email already exists') as Error & { status?: number }
    error.status = 409
    throw error
  }

  const passwordHash = await hashPassword(password)

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: input.phone?.trim() || null,
      passwordHash,
      role: role as typeof VALID_ROLES[number],
      status: 'PENDING'
    }
  })

  const refreshToken = await createRefreshTokenForUser(user.id)
  const accessToken = signAccessToken(user.id)

  return {
    user: sanitizeUser(user),
    refreshToken,
    accessToken
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email?.trim().toLowerCase()
  const password = input.password ?? ''

  if (!email || !password) {
    const error = new Error('Email and password are required') as Error & { status?: number }
    error.status = 400
    throw error
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    const error = new Error('Invalid email or password') as Error & { status?: number }
    error.status = 401
    throw error
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) {
    const error = new Error('Invalid email or password') as Error & { status?: number }
    error.status = 401
    throw error
  }

  const refreshToken = await createRefreshTokenForUser(user.id)
  const accessToken = signAccessToken(user.id)

  return {
    user: sanitizeUser(user),
    refreshToken,
    accessToken
  }
}

async function createRefreshTokenForUser(userId: string) {
  await db.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true }
  })

  const token = signRefreshToken(userId)
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

  await db.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  })

  return token
}

export async function getCurrentUserFromToken(token: string | undefined) {
  if (!token) {
    const error = new Error('Authentication required') as Error & { status?: number }
    error.status = 401
    throw error
  }

  const tokenHash = hashToken(token)
  const refreshToken = await db.refreshToken.findFirst({
    where: {
      tokenHash,
      revoked: false,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  })

  if (refreshToken?.user) {
    try {
      jwt.verify(token, JWT_REFRESH_SECRET)
    } catch {
      const error = new Error('Authentication required') as Error & { status?: number }
      error.status = 401
      throw error
    }
  }

  if (!refreshToken?.user) {
    const error = new Error('Authentication required') as Error & { status?: number }
    error.status = 401
    throw error
  }

  return sanitizeUser(refreshToken.user)
}

export async function logoutUser(token: string | undefined) {
  if (!token) {
    return false
  }

  const tokenHash = hashToken(token)
  const refreshToken = await db.refreshToken.findFirst({
    where: { tokenHash, revoked: false }
  })

  if (!refreshToken) {
    return false
  }

  await db.refreshToken.update({
    where: { id: refreshToken.id },
    data: { revoked: true }
  })

  return true
}
