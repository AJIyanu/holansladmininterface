import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientRequest } from "@/types/procurement";
import { formatDate, getStatusColor } from "@/lib/utils";
import RequestTableActions from "./RequestTableActions";

interface MobileRequestsCardsProps {
  requests: ClientRequest[];
}

export default function MobileRequestsCards({
  requests,
}: MobileRequestsCardsProps) {
  return (
    <div className="md:hidden space-y-4 p-4">
      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <h3
                  className="font-semibold text-sm truncate"
                  title={request.item_name}
                >
                  {request.item_name}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {request.client_name}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge className={`${getStatusColor(request.status)} text-xs`}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <div>
                  {request.quantity.toLocaleString()} {request.uom}
                </div>
                <div>{formatDate(request.created_at)}</div>
              </div>
              <RequestTableActions request={request} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
