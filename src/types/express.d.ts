import type { ApiResponse } from '../utils/response'

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>
    }

    interface Response {
      success: (payload: ApiResponse<unknown>) => this
    }
  }
}

export {}
