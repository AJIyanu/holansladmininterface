"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ClientRequest } from "@/types/procurement";
import { formatDateTime, getStatusColor } from "@/lib/utils";

interface RequestViewModalProps {
  request: ClientRequest;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <div className="grid grid-cols-3 gap-2 py-2">
    <dt className="text-sm font-medium text-gray-600 col-span-1">{label}:</dt>
    <dd className="text-sm text-gray-900 col-span-2">{value || "N/A"}</dd>
  </div>
);

const RequestDetails = ({ request }: { request: ClientRequest }) => (
  <div className="space-y-6 bg-white p-5">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Request Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-1">
          <DetailRow label="Item Name" value={request.item_name} />
          <Separator className="my-2" />
          <DetailRow label="Client" value={request.client_name} />
          <DetailRow
            label="Contact Person"
            value={request.contact_person_name}
          />
          <Separator className="my-2" />
          <DetailRow label="Quantity" value={request.quantity} />
          <DetailRow label="UOM" value={request.uom} />
          <Separator className="my-2" />
          <div className="grid grid-cols-3 gap-2 py-2">
            <dt className="text-sm font-medium text-gray-600 col-span-1">
              Status:
            </dt>
            <dd className="col-span-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1)}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Product Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-1">
          <DetailRow label="Brand" value={request.brand} />
          <DetailRow label="Model" value={request.model} />
          <Separator className="my-2" />
          <div className="grid grid-cols-3 gap-2 py-2">
            <dt className="text-sm font-medium text-gray-600 col-span-1">
              Specification:
            </dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {request.specification ? (
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                  {request.specification}
                </div>
              ) : (
                "N/A"
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-1">
          <div className="grid grid-cols-3 gap-2 py-2">
            <dt className="text-sm font-medium text-gray-600 col-span-1">
              Comments:
            </dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {request.comments ? (
                <div className="max-h-24 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                  {request.comments}
                </div>
              ) : (
                "N/A"
              )}
            </dd>
          </div>
          <Separator className="my-2" />
          <DetailRow
            label="Created"
            value={formatDateTime(request.created_at)}
          />
          <DetailRow
            label="Updated"
            value={formatDateTime(request.updated_at)}
          />
        </dl>
      </CardContent>
    </Card>
  </div>
);

export default function RequestViewModal({ request }: RequestViewModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-5 m-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Request Details
            </DialogTitle>
          </DialogHeader>
          <RequestDetails request={request} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] mb-6 bg-white p-2 m-4">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Request Details
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          <RequestDetails request={request} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
