"use client";

import type { ReactNode } from "react";
import { ThemeSwitcher } from "~/components/shared/theme-switcher";
import { Separator } from "~/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import type { CurrentUser } from "~/server/user";
import { AppSidebar } from "./app-sidebar";

/**
 * Dashboard shell: collapsible app sidebar plus the inset content column.
 * Used by authenticated pages; the page supplies its own title and body.
 */
export function DashboardLayout({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <span className="text-sm font-medium text-muted-foreground">NDMFB</span>
          <div className="flex-1" />
          <ThemeSwitcher />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
