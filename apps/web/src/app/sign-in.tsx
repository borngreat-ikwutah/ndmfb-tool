import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPage } from "~/features/auth/auth-page";
import { createPageMeta } from "~/seo";
import { getCurrentUser } from "~/server/user";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
  head: () =>
    createPageMeta({
      title: "Sign In",
      description: "Sign in to NDMFB Tool",
    }),
  component: () => <AuthPage mode="sign-in" />,
});
