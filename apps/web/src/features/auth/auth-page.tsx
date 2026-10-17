import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { AuthForm } from "./auth-form";
import { AuthLayout } from "./auth-layout";

const copy = {
  "sign-in": {
    title: "Sign in to NDMFB Tool",
    sub: "Sign in with your email and password.",
    switchPrompt: "New to NDMFB?",
    switchLabel: "Create an account",
    switchTo: "/sign-up" as const,
  },
  "sign-up": {
    title: "Create your account",
    sub: "Enter your name, email, and a password to get started.",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchTo: "/sign-in" as const,
  },
} as const;

export function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = copy[mode];

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="size-4" />
        </span>
        <p className="mt-3 text-sm font-semibold tracking-tight text-foreground">
          NDMFB Tool
        </p>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.sub}</p>
      </div>

      <AuthForm mode={mode} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.switchPrompt}{" "}
        <Link
          to={t.switchTo}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t.switchLabel}
        </Link>
      </p>
    </AuthLayout>
  );
}
