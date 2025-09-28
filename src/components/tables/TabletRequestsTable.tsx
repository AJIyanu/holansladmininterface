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
import { getStatusColor } from "@/lib/utils";
import RequestTableActions from "./RequestTableActions";

interface TabletRequestsTableProps {
  requests: ClientRequest[];
}

export default function TabletRequestsTable({
  requests,
}: TabletRequestsTableProps) {
  return (
    <div className="hidden md:block lg:hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>
                {request.quantity.toLocaleString()} {request.uom}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
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
