import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { clientEnv } from "~/config/client-env";
import { API_UNREACHABLE_MESSAGE } from "~/lib/api-client";
import { checkBackendHealth } from "~/server/health";

const RETRY_INTERVAL_MS = 3_000;

/**
 * Full page state shown when server functions cannot reach the Go API.
 * Polls the backend health server function until it is live, then lets the
 * router re-run its guards, so a signed in user continues to the page and
 * a signed out user is sent to sign in without a reload.
 */
export function BackendConnecting() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const health = useQuery({
    queryKey: ["backend-connection"],
    queryFn: () => checkBackendHealth(),
    retry: false,
    refetchInterval: (query) => (query.state.error ? RETRY_INTERVAL_MS : false),
  });

  const isLive = health.isSuccess;
  const hasFailed = health.isError;

  useEffect(() => {
    if (!isLive) return;
    void queryClient.invalidateQueries();
    void router.invalidate();
  }, [isLive, queryClient, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div
          role="status"
          aria-live="polite"
          aria-busy={!isLive}
          className="rounded-xl border border-border/40 bg-card"
        >
          <div className="p-5 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-500">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Connecting
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Connecting to the NDMFB API
            </h2>
            <p className="text-sm text-muted-foreground">
              This page needs the backend before it can load. The connection
              retries automatically, so once the API is online you will
              continue without doing anything.
            </p>
            <p
              role="alert"
              className="text-sm font-medium text-amber-500"
            >
              {API_UNREACHABLE_MESSAGE}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2.5 md:py-2">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[70%]">
              {clientEnv.VITE_API_URL}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              retrying every 3s
            </span>
          </div>
        </div>
        <div aria-hidden="true" className="mt-4 space-y-2.5">
          <div className="h-3.5 w-2/3 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-3.5 w-1/2 rounded-full bg-muted/40 animate-pulse" />
        </div>
        {hasFailed ? (
          <p className="sr-only">
            The backend cannot be reached right now. Retrying automatically.
          </p>
        ) : null}
      </div>
    </main>
  );
}
