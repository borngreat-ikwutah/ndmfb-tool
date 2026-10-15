import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { NotFoundPage } from "./features/not-found-page";
import { DefaultErrorPage } from "./features/error-page";
import { getContext } from "~/providers/context";
import { InnerProviders } from "~/providers/root-provider";

export function getRouter() {
  const context = getContext();

  const router = createRouter({
    routeTree,
    context: { ...context },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: ({ error }: { error: unknown }) => <DefaultErrorPage error={error} />,
    InnerWrap: ({ children }: { children: React.ReactNode }) => {
      return (
        <InnerProviders queryClient={context.queryClient}>
          {children}
        </InnerProviders>
      );
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: context.queryClient,
  });

  return router;
}
