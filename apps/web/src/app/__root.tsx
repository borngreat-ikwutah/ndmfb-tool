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
import React, { useEffect } from "react";
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
        <Navbar />
        {children}
        {/* 
        {process.env.NODE_ENV === "development" && (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: "React Query",
                render: <ReactQueryDevtools />,
              },
            ]}
          />
        )} */}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
