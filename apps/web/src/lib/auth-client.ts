import { clientEnv } from "~/config/client-env";

const apiURL = clientEnv.VITE_API_URL;

export const authClient = {
  signIn: {
    social: async ({ provider, callbackURL }: { provider: string; callbackURL: string }) => {
      const response = await fetch(`${apiURL}/api/auth/sign-in/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ callbackURL }),
      });
      if (!response.ok) throw new Error("Authentication is not available");
      const result = (await response.json()) as { url: string };
      window.location.assign(result.url);
    },
    email: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${apiURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || "Email sign-in failed");
      }
      const result = (await response.json().catch(() => null)) as { url?: string } | null;
      window.location.assign(result?.url ?? "/");
    },
  },
  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      const response = await fetch(`${apiURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || "Email sign-up failed");
      }
      const result = (await response.json().catch(() => null)) as { url?: string } | null;
      window.location.assign(result?.url ?? "/");
    },
  },
  signOut: async () => {
    await fetch(`${apiURL}/api/auth/sign-out`, { method: "POST", credentials: "include" });
  },
};
