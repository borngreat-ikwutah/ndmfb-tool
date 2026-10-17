import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BackendConnecting } from "~/features/backend-connecting";
import { DashboardLayout } from "~/features/dashboard/dashboard-layout";
import { isBackendUnreachable } from "~/lib/api-client";
import { getCurrentUser, type CurrentUser } from "~/server/user";

/**
 * Pathless layout for every authenticated page. It resolves the signed in user
 * once, sends signed out visitors to sign-in, and renders the dashboard shell.
 * When the API cannot be reached it shows the connecting screen instead of
 * redirecting, so a live session is never mistaken for signed out.
 */
export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => {
    let user: CurrentUser | null = null;
    let backendUnreachable = false;
    try {
      user = await getCurrentUser();
    } catch (error) {
      // Backend not live: never treat that as "signed out". Flag it and
      // let the layout show a state instead of redirecting somewhere wrong.
      if (isBackendUnreachable(error)) {
        backendUnreachable = true;
      } else {
        throw error;
      }
    }
    if (!backendUnreachable && !user) {
      throw redirect({ to: "/sign-in" });
    }
    return { user, backendUnreachable };
  },
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  const { user, backendUnreachable } = Route.useRouteContext();

  if (backendUnreachable) {
    return <BackendConnecting />;
  }

  if (!user) {
    // beforeLoad redirects unauthenticated visits to /sign-in.
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Outlet />
    </DashboardLayout>
  );
}
