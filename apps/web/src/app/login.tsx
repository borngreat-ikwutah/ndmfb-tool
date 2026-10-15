import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "~/features/auth/login";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    createPageMeta({
      title: "Sign In",
      description: "Sign in to NDMFB Tool",
    }),
  component: AuthPage,
});
