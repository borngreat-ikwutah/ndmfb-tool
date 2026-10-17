import { createServerFn } from "@tanstack/react-start";
import { apiFetch } from "~/lib/api-client";

export type BackendHealth = { status: string };

export const checkBackendHealth = createServerFn({ method: "GET" }).handler(
  async () => {
    return await apiFetch<BackendHealth>("/healthz");
  },
);
