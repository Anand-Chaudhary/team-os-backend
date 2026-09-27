import type { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../auth/auth.config';
import { prisma } from '../db/prisma';
import { getCurrentUserFromToken, getRefreshTokenCookieName } from '../services/auth.service';
import { sendResponse } from '../utils/response';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.[getRefreshTokenCookieName()];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const token = bearerToken ?? cookieToken;

    // Try user authentication first
    try {
      const user = await getCurrentUserFromToken(token);
      // @ts-ignore – augment request with user
      req.user = user;
      return next();
    } catch (e) {
      // Not a valid user token; try client token
    }

    // Verify as client JWT (payload contains clientId)
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload?.clientId) {
      const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
      if (!client) throw new Error('Client not found');
      // @ts-ignore – augment request with client
      req.client = client;
      return next();
    }

    // If we get here, authentication failed
    throw new Error('Authentication required');
  } catch (error) {
    const err = error as Error & { status?: number };
    return sendResponse(res, {
      success: false,
      message: err.message || 'Authentication required',
      status: err.status ?? 401,
      data: null,
    });
  }
}
