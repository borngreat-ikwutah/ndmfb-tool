import { Hono } from "hono"
import { healthRoute } from "./health.route"
import { v1Router } from "./v1"
import type { AppBindings } from "@/types"

export const router = new Hono<AppBindings>()

router.route("/health", healthRoute)
router.route("/v1", v1Router)
