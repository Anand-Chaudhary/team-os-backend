import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import { loginClient as svcLoginClient } from '../services/clientAuth.service';

/** POST /client-login – client portal login */
export async function loginClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      const err: any = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }
    const result = await svcLoginClient(email, password);
    return sendResponse(res, {
      success: true,
      message: 'Client login successful',
      status: 200,
      data: {
        client: result.client,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
}
