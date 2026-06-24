"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SecurityPageErrorProps {
  title: string;
  reset: () => void;
}

export default function SecurityPageError({ title, reset }: SecurityPageErrorProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="max-w-lg rounded-xl border border-dashed bg-background p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The activity records could not be loaded. This may be a temporary API or authentication issue.
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
