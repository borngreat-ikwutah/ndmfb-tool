/// <reference types="vite/client" />
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import appCss from "../styles.css?url";
import { seoConfig } from "../seo";
import { Toaster } from "~/components/ui/sonner";

import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { API_UNREACHABLE_MESSAGE } from "~/lib/api-client";
import { checkBackendHealth } from "~/server/health";
interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: seoConfig.meta,
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      ...seoConfig.faviconLinks,
    ],
  }),
  shellComponent: RootDocument,
});

import { Navbar } from "~/components/shared/navbar";

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 antialiased">
        {children}
        <BackendStatusToast />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}

function BackendStatusToast() {
  const hasShownOfflineToast = useRef(false);

  const health = useQuery({
    queryKey: ["backend-health"],
    queryFn: () => checkBackendHealth(),
    retry: false,
    refetchInterval: (query) => (query.state.error ? 3_000 : false),
  });

  useEffect(() => {
    if (health.isSuccess) {
      hasShownOfflineToast.current = false;
      return;
    }
    if (health.isError && !hasShownOfflineToast.current) {
      hasShownOfflineToast.current = true;
      toast.error("Your network is bad", {
        description: API_UNREACHABLE_MESSAGE,
        action: {
          label: "Retry",
          onClick: () => {
            hasShownOfflineToast.current = false;
            void health.refetch();
          },
        },
      });
    }
  }, [health]);

  return null;
}
