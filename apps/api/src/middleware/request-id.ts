import type { MiddlewareHandler } from "hono"
import type { AppBindings } from "@/types"

export const requestIdMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const reqId = c.req.header("x-request-id") || crypto.randomUUID()
  c.set("requestId", reqId)
  c.header("x-request-id", reqId)
  await next()
}
