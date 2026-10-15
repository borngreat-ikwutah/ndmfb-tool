import { createFileRoute } from "@tanstack/react-router";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/")({
  head: () =>
    createPageMeta({
      title: "Home",
      description: "Welcome to the application",
    }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
      <p className="mt-2 text-muted-foreground">Application initialized.</p>
    </main>
  );
}
