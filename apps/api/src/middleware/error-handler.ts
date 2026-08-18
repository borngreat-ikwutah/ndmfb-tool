import type { ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { ZodError } from "zod"
import { env } from "@/config/env"
import { HttpStatus } from "@/lib/http-status"
import { formatError } from "@/lib/response"
import type { AppBindings } from "@/types"

export const errorHandler: ErrorHandler<AppBindings> = (err, c) => {
  const requestId = c.get("requestId")

  // Handle Hono HTTPExceptions
  if (err instanceof HTTPException) {
    return c.json(
      formatError(err.message, "HTTP_EXCEPTION", undefined, { requestId }),
      err.status
    )
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return c.json(
      formatError("Validation failed", "VALIDATION_ERROR", err.flatten(), { requestId }),
      HttpStatus.UNPROCESSABLE_ENTITY
    )
  }

  // Handle unexpected internal errors
  console.error(`[Error] [${requestId}]:`, err)

  const isDev = env.NODE_ENV === "development"
  return c.json(
    formatError(
      isDev ? err.message : "Internal Server Error",
      "INTERNAL_SERVER_ERROR",
      isDev ? { stack: err.stack } : undefined,
      { requestId }
    ),
    HttpStatus.INTERNAL_SERVER_ERROR
  )
}
