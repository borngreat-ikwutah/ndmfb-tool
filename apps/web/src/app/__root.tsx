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
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { clientEnv } from "~/config/client-env";
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

  useEffect(() => {
    let cancelled = false;

    const checkBackend = async () => {
      try {
        const response = await fetch(`${clientEnv.VITE_API_URL}/healthz`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error("Backend unavailable");
        hasShownOfflineToast.current = false;
      } catch {
        if (cancelled || hasShownOfflineToast.current) return;
        hasShownOfflineToast.current = true;
        toast.error("Your network is bad", {
          description: "The backend cannot be reached right now.",
          action: {
            label: "Retry",
            onClick: () => {
              hasShownOfflineToast.current = false;
              void checkBackend();
            },
          },
        });
      }
    };

    void checkBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
