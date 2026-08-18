import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { prettyJSON } from "hono/pretty-json"
import { env } from "@/config/env"
import { errorHandler } from "@/middleware/error-handler"
import { notFoundHandler } from "@/middleware/not-found"
import { requestIdMiddleware } from "@/middleware/request-id"
import { router } from "@/routes"
import type { AppBindings } from "@/types"

export function createApp() {
  const app = new Hono<AppBindings>()

  // Global Middlewares
  app.use("*", requestIdMiddleware)
  app.use("*", logger())
  app.use("*", secureHeaders())
  app.use(
    "*",
    cors({
      origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "x-request-id"],
      exposeHeaders: ["x-request-id"],
      credentials: env.CORS_ORIGIN !== "*",
    })
  )
  app.use("*", prettyJSON())

  // Base API routes
  app.route(env.API_PREFIX, router)

  // Root welcome ping
  app.get("/", (c) => {
    return c.json({
      name: "ndmfb-api",
      version: "0.0.1",
      environment: env.NODE_ENV,
      endpoints: {
        health: `${env.API_PREFIX}/health`,
        v1: `${env.API_PREFIX}/v1`,
      },
    })
  })

  // Error & 404 Handlers
  app.notFound(notFoundHandler)
  app.onError(errorHandler)

  return app
}

export const app = createApp()
