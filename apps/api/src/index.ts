import { app } from "./app"
import { env } from "./config/env"

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
})

console.log(`🚀 API Server ready at http://localhost:${server.port}`)
console.log(`🩺 Healthcheck: http://localhost:${server.port}${env.API_PREFIX}/health`)

const signals = ["SIGINT", "SIGTERM"] as const
for (const signal of signals) {
  process.on(signal, () => {
    console.log(`\n🛑 Received ${signal}, closing server gracefully...`)
    server.stop()
    process.exit(0)
  })
}

export default app
