import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PublicNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 sm:p-6">
      <section className="w-full max-w-4xl overflow-hidden rounded-2xl border bg-background shadow-lg">
        <div className="flex flex-col items-center gap-8 p-6 sm:flex-row sm:items-stretch sm:p-10">
          <div className="flex shrink-0 items-center justify-center sm:w-64">
            <Link
              href="https://holansl.com"
              aria-label="Visit Holan Integrated Services"
              className="rounded-lg p-3 transition hover:bg-muted/50"
            >
              <Image
                src="/HolanSL_logo.png"
                alt="Holan Integrated Services Limited"
                width={220}
                height={100}
                className="h-auto w-44 object-contain sm:w-52"
                priority
              />
            </Link>
          </div>

          <Separator className="sm:hidden" />

          <Separator
            orientation="vertical"
            className="hidden h-auto min-h-64 sm:block bg-blue-900"
          />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0B4F8A]">
              404 · Page not found
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              This page is not available
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              This page does not exist, may have moved, or you may not be
              authorised to view it.
            </p>

            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Holan staff members can sign in to the administration portal.
              Visitors can return to the main Holan website by selecting the
              logo or using the button below.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <a href="https://holansl.com">
                  <ExternalLink className="size-4" />
                  Visit Holan website
                </a>
              </Button>

              <Button asChild>
                <Link href="/login">
                  <LogIn className="size-4" />
                  Staff login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
