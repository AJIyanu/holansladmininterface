"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="space-y-4 p-6">
      <h1 className="font-heading text-2xl font-bold">
        Procurement could not be loaded
      </h1>
      <p className="text-muted-foreground">
        The service may be unavailable or your access may have changed. Try
        again, or return to the dashboard.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
