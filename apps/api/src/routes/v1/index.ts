import { Hono } from "hono"
import type { AppBindings } from "@/types"

export const v1Router = new Hono<AppBindings>()
