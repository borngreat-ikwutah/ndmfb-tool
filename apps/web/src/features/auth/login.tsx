import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";

export function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10 bg-muted">
      <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
      <p className="text-muted-foreground text-center max-w-[400px]">
        Sign in to your account to get started.
      </p>

      <Card className="w-full max-w-[400px] p-6 md:p-10 flex flex-col gap-4">
        <Button
          className="h-12 text-lg font-semibold"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
        <p className="text-xs text-center text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </main>
  );
}

