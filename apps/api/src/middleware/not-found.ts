import type { NotFoundHandler } from "hono"
import { HttpStatus } from "@/lib/http-status"
import { formatError } from "@/lib/response"
import type { AppBindings } from "@/types"

export const notFoundHandler: NotFoundHandler<AppBindings> = (c) => {
  const requestId = c.get("requestId")
  return c.json(
    formatError(`Path ${c.req.path} not found`, "NOT_FOUND", undefined, { requestId }),
    HttpStatus.NOT_FOUND
  )
}
