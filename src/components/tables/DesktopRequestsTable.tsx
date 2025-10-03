import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientRequest } from "@/types/procurement";
import { formatDate, getStatusColor } from "@/lib/utils";
import RequestTableActions from "./RequestTableActions";

interface DesktopRequestsTableProps {
  requests: ClientRequest[];
}

export default function DesktopRequestsTable({
  requests,
}: DesktopRequestsTableProps) {
  // console.log("Rendering DesktopRequestsTable with requests:", requests);
  return (
    <div className="hidden lg:block">
      <Table className="bg-blue-100 rounded-lg">
        <TableHeader className="bg-brand-navy text-white">
          <TableRow className="rounded-t-lg">
            <TableHead>Item Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                <div className="max-w-48 truncate" title={request.item_name}>
                  {request.item_name}
                </div>
              </TableCell>
              <TableCell>{request.client_name}</TableCell>
              <TableCell>{request.contact_person_name || "N/A"}</TableCell>
              <TableCell>{request.quantity.toLocaleString()}</TableCell>
              <TableCell>{request.uom}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(request.created_at)}
              </TableCell>
              <TableCell>
                <RequestTableActions request={request} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
