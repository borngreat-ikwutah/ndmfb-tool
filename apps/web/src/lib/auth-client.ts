import { clientEnv } from "~/config/client-env";
import type { AuthResponse, EmailSignUpRequest } from "@ndmfb/contract";

const apiURL = clientEnv.VITE_API_URL;

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${apiURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      await handleAuthResponse(response, "Email sign in failed");
    },
  },
  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const response = await fetch(`${apiURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name } satisfies EmailSignUpRequest),
      });
      await handleAuthResponse(response, "Email sign up failed");
    },
  },
  signOut: async () => {
    await fetch(`${apiURL}/api/auth/sign-out`, { method: "POST", credentials: "include" });
  },
};

async function handleAuthResponse(response: Response, fallback: string): Promise<AuthResponse> {
  const body = (await response.json().catch(() => null)) as AuthResponse | { message?: string } | null;
  if (!response.ok) {
    throw new Error(body && "message" in body && body.message ? body.message : fallback);
  }
  window.location.assign("/");
  return body as AuthResponse;
}
