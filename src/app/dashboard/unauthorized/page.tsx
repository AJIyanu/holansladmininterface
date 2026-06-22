import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-5 rounded-full bg-red-50 p-4 text-red-600">
            <ShieldX className="size-8" />
          </div>

          <h1 className="text-2xl font-semibold">Access denied</h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Your account does not have permission to access this page.
          </p>

          <Button
            asChild
            className="mt-6 bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Return to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
