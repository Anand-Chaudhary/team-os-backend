import type { ApiResponse } from '../utils/response.js'

declare global {
  namespace Express {
    interface Response {
      success: (payload: ApiResponse<unknown>) => this
    }
  }
}

export {}
