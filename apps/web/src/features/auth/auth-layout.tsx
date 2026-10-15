import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-[560px]">{children}</div>
    </main>
  );
}
