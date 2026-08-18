export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        status: response.status,
        error: (data && data.message) || response.statusText || "Request failed",
      }
    }

    return {
      status: response.status,
      data: data as T,
    }
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
