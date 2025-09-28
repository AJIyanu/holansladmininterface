import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyRequestsStateProps {
  hasFilters: boolean;
}

export default function EmptyRequestsState({
  hasFilters,
}: EmptyRequestsStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No requests found
          </h3>
          <p className="text-gray-600 mb-4">
            {hasFilters
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first client request."}
          </p>
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
