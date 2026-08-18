export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
    [key: string]: unknown
  }
}

export function formatSuccess<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

export function formatError(
  message: string,
  code?: string,
  details?: unknown,
  meta?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}
