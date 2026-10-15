import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangleIcon,
  HomeIcon,
  RefreshCwIcon,
  ArrowLeftIcon,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";

interface ErrorPageProps {
  error?: Error | unknown;
  title?: string;
  description?: string;
  showRefresh?: boolean;
  showGoBack?: boolean;
  showHomeButton?: boolean;
  customActions?: React.ReactNode;
}

export function ErrorPage({
  error,
  title = "Something went wrong",
  description = "An unexpected error has occurred. Please try again later.",
  showRefresh = true,
  showGoBack = true,
  showHomeButton = true,
  customActions,
}: ErrorPageProps) {
  const router = useRouter();
  const navigate = useNavigate();

  const handleRefresh = () => {
    router.invalidate();
  };

  const handleGoBack = () => {
    // Use router's history to go back
    router.history.back();
  };

  const handleRouteRefresh = async () => {
    try {
      await navigate({ to: ".", replace: true });
    } catch (err) {
      // Fallback to router invalidate if navigate fails
      router.invalidate();
    }
  };

  // Extract error message if available
  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Empty className="border-none max-w-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon className="size-6 text-destructive" />
          </EmptyMedia>
          <EmptyTitle className="text-2xl md:text-3xl font-bold text-destructive">
            {title}
          </EmptyTitle>
          <EmptyDescription className="text-base md:text-lg">
            {description}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="text-center space-y-4">
            {/* Show error details in development */}
            {errorMessage && process.env.NODE_ENV === "development" && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-mono wrap-break-word">
                  {errorMessage}
                </p>
              </div>
            )}

            <p className="text-muted-foreground text-sm">
              We apologize for the inconvenience. Our team has been notified and
              is working to resolve this issue.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              {showRefresh && (
                <Button onClick={handleRefresh} className="min-w-[140px]">
                  <RefreshCwIcon className="size-4 mr-2" />
                  Try Again
                </Button>
              )}

              {showHomeButton && (
                <Button variant="outline" asChild className="min-w-[140px]">
                  <Link to="/">
                    <HomeIcon className="size-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              )}

              {/* Custom actions if provided */}
              {customActions}
            </div>

            {/* Go Back Button */}
            {showGoBack && (
              <div className="pt-6 border-t border-dashed">
                <Button
                  variant="ghost"
                  onClick={handleGoBack}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeftIcon className="size-4 mr-2" />
                  Go Back
                </Button>
              </div>
            )}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

// Pre-configured error components for common scenarios
export function DefaultErrorPage({ error }: { error?: Error | unknown }) {
  return <ErrorPage error={error} />;
}

export function NetworkErrorPage() {
  const router = useRouter();

  return (
    <ErrorPage
      title="Connection Error"
      description="Unable to connect to our servers. Please check your internet connection and try again."
      customActions={
        <Button variant="outline" onClick={() => router.invalidate()}>
          <RefreshCwIcon className="size-4 mr-2" />
          Retry Connection
        </Button>
      }
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      title="Server Error"
      description="Our servers are experiencing issues. Please try again in a few minutes."
      showGoBack={false}
    />
  );
}
