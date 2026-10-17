import { createFileRoute } from "@tanstack/react-router";
import { Activity, Mail, Send, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import type { CurrentUser } from "~/server/user";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/_dashboard/")({
  head: () =>
    createPageMeta({
      title: "Dashboard",
      description: "Compose and send bulk email from the NDMFB dashboard",
    }),
  component: IndexPage,
});

function IndexPage() {
  const { user } = Route.useRouteContext();

  // The layout only renders the outlet once a user is resolved.
  if (!user) {
    return null;
  }

  return <DashboardOverview user={user} />;
}

type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

function DashboardOverview({ user }: { user: CurrentUser }) {
  const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;

  const stats: Stat[] = [
    { label: "Emails sent", value: "0", hint: "All time", icon: Send },
    { label: "Recipients reached", value: "0", hint: "All time", icon: Users },
    { label: "Delivery rate", value: "—", hint: "No sends yet", icon: Activity },
    { label: "Failed", value: "0", hint: "Nothing to retry", icon: TriangleAlert },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {firstName}. Here is your sending overview.
        </p>
      </div>

      <section aria-label="Sending overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border/40 bg-card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          );
        })}
      </section>

      <section
        aria-label="Recent sends"
        className="rounded-xl border border-border/40 bg-card"
      >
        <div className="border-b border-border/40 px-5 py-4">
          <h2 className="text-sm font-semibold">Recent sends</h2>
          <p className="text-xs text-muted-foreground">Your latest bulk email runs</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <Mail className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">No sends yet</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Once you compose and send your first notice, it will appear here with its delivery
            breakdown.
          </p>
        </div>
      </section>
    </>
  );
}
