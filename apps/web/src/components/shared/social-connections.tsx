import { Button } from "~/components/ui/button";
import { Twitter } from "lucide-react";

export function SocialConnections() {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold leading-tight text-card-foreground">
          Connect Social Accounts
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your accounts to enhance your profile and for easier login.
        </p>
      </div>

      <div className="flex flex-col space-y-3 pt-2 sm:max-w-xs">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <Twitter className="h-4 w-4" />
          Connect with X
        </Button>
        {/* You can add more social connection buttons here in the future */}
        {/* e.g., <Button variant="outline" ...>Connect with Google</Button> */}
      </div>
    </div>
  );
}
