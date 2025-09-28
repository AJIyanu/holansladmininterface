import { Suspense } from "react";
import CreateRequestContent from "./CreateRequestContent";
import EditRequestContent from "./EditRequestContent";
import RequestFormSkeleton from "./RequestFormSkeleton";

interface RequestPageWrapperProps {
  requestId?: string;
}

export default function RequestPageWrapper({
  requestId,
}: RequestPageWrapperProps) {
  // If there's an ID in the query params, we're in edit mode
  if (requestId) {
    return (
      <Suspense fallback={<RequestFormSkeleton />}>
        <EditRequestContent requestId={requestId} />
      </Suspense>
    );
  }

  // Otherwise, we're in create mode
  return <CreateRequestContent />;
}
