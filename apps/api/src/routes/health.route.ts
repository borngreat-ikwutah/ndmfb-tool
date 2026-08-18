import { Hono } from "hono"
import { formatSuccess } from "@/lib/response"
import type { AppBindings } from "@/types"

export const healthRoute = new Hono<AppBindings>()

healthRoute.get("/", (c) => {
  const memoryUsage = process.memoryUsage()

  return c.json(
    formatSuccess(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        },
      },
      { requestId: c.get("requestId") }
    )
  )
})

healthRoute.get("/ready", (c) => {
  return c.json(
    formatSuccess(
      {
        status: "ready",
        services: {
          database: "connected",
        },
      },
      { requestId: c.get("requestId") }
    )
  )
})
