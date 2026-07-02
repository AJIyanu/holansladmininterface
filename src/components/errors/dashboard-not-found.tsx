import Link from "next/link";
import { AlertTriangle, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardNotFound() {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-stretch sm:p-8">
          <div className="flex shrink-0 items-center justify-center">
            <div className="flex size-24 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="size-12" strokeWidth={1.7} />
            </div>
          </div>

          <Separator className="sm:hidden" />

          <Separator
            orientation="vertical"
            className="hidden h-auto min-h-40 sm:block"
          />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0B4F8A]">
              404 · Page not found
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              There is nothing here
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              The page you requested does not exist, may have moved, or may not
              be available to your account. Use the navigation sidebar to find
              the section you need.
            </p>

            <div className="mt-6 flex justify-center sm:justify-start">
              <Button asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Return to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
