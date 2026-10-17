import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Session, User } from "@ndmfb/contract";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { ApiError, apiFetch } from "~/lib/api-client";
import { updateUserSchema } from "~/lib/validators/user";

export type CurrentUser = User;

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const cookie = getRequestHeaders().get("cookie") || "";
  try {
    const session = await apiFetch<Session>("/api/auth/get-session", { cookie });
    return session.user;
  } catch (error) {
    // A reachable API answering "unauthorized" simply means signed out.
    if (error instanceof ApiError && error.status === 401) return null;
    // Otherwise (backend unreachable, HTTP 5xx) let the caller handle it.
    throw error;
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
  .validator(updateUserSchema)
  .handler(async ({ data }) => {
    const cookie = getRequestHeaders().get("cookie") || "";
    return await apiFetch<CurrentUser>("/api/auth/update-user", {
      method: "POST",
      cookie,
      body: data,
    });
  });
