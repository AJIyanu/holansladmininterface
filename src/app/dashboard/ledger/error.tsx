"use client";
import { Button } from "@/components/ui/button";
export default function CashBookError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="space-y-4 p-6">
      <p>Unable to load this page.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
