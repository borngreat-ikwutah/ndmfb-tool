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
  },
  signOut: async () => {
    await fetch(`${apiURL}/api/auth/sign-out`, { method: "POST", credentials: "include" });
  },
};
