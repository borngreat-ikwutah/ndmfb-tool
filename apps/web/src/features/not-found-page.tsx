import { Link, useNavigate } from "@tanstack/react-router";
import { SearchXIcon, HomeIcon, ArrowLeftIcon } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Empty className="border-none max-w-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="text-2xl md:text-3xl font-bold">
            404 - Page Not Found
          </EmptyTitle>
          <EmptyDescription className="text-base md:text-lg">
            Oops! The page you're looking for seems to have wandered off into
            the digital wilderness.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              The page you requested could not be found. It might have been
              moved, deleted, or you may have mistyped the URL.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button asChild className="min-w-[140px]">
                <Link to="/">
                  <HomeIcon className="size-4 mr-2" />
                  Go Home
                </Link>
              </Button>


            </div>

            <div className="pt-6 border-t border-dashed">
              <Button
                variant="ghost"
                onClick={() => goBack()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
