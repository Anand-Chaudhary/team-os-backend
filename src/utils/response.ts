export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  status: number
  data: T | null
}

export function buildResponse<T>(payload: Partial<ApiResponse<T>> & Pick<ApiResponse<T>, 'success' | 'message' | 'status'> & { data?: T | null }): ApiResponse<T> {
  return {
    success: payload.success,
    message: payload.message,
    status: payload.status,
    data: payload.data ?? null
  }
}

export function sendResponse<T>(res: { json: (body: ApiResponse<T>) => any }, payload: Partial<ApiResponse<T>> & Pick<ApiResponse<T>, 'success' | 'message' | 'status'> & { data?: T | null }): any {
  return res.json(buildResponse(payload))
}
