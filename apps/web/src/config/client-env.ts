import * as z from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().default("NDMFB Tool"),
  VITE_APP_URL: z.string().default("http://localhost:3000"),
  VITE_API_URL: z.string().default("http://localhost:8080"),
});

export const clientEnv = envSchema.parse(import.meta.env);

