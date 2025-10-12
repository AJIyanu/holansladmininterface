import Link from "next/link";
import { ArrowLeft, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RequestNotFound() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <FileX className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Request Not Found
          </h1>

          <p className="text-gray-600 mb-6 max-w-md">
            {`The request you're looking for doesn't exist or may have been deleted.`}
          </p>

          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/dashboard/requests">View All Requests</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/dashboard/requests/new">Create New Request</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
