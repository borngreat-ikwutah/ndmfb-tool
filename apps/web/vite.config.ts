// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  envDir: __dirname,
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routesDirectory: "./app",
      },
    }),
    tailwindcss(),
    viteReact(),
  ],

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
