import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { updateUserSchema } from "~/lib/validators/user";

export type CurrentUser = { id: string; name: string; email: string; image?: string | null };
const apiURL = process.env.API_URL || "http://localhost:8080";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const response = await fetch(`${apiURL}/api/auth/get-session`, {
      headers: { cookie: getRequestHeaders().get("cookie") || "" },
    });
    if (!response.ok) return null;
    return (await response.json()) as CurrentUser;
  } catch {
    return null;
  }
});

export const currentUserOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["current-user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID available");
      return await getCurrentUser();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

export const updateUserDetailsFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const response = await fetch(`${apiURL}/api/auth/update-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: getRequestHeaders().get("cookie") || "",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Unable to update profile");
    return (await response.json()) as CurrentUser;
  });
