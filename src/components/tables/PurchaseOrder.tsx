"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Eye, SquarePen, Trash2 } from "lucide-react";

import { PurchaseOrder } from "@/types/purchase";
import PurchaseOrderDialog from "../PurchaseOrderDialog";
import Link from "next/link";

interface Props {
  initialOrders: PurchaseOrder[];
}

export default function PurchaseOrderTable({ initialOrders }: Props) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders ?? []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);

  async function refreshOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/procurement/purchase-orders/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = (await res.json()) as PurchaseOrder[];
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm("Are you sure you want to delete this purchase order?"))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/procurement/purchase-orders/${orderId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await refreshOrders();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesPo = filter
      ? o.po_number.toLowerCase().includes(filter.toLowerCase())
      : true;
    const matchesStatus =
      !statusFilter || statusFilter === "all"
        ? true
        : o.status === statusFilter;
    return matchesPo && matchesStatus;
  });

  return (
    <div className="p-0">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by PO Number..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-1/3"
        />
        <Select onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button onClick={() => refreshOrders()} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:block">PO Number</TableHead>
              <TableHead>PO Summary</TableHead>
              <TableHead className="hidden md:block">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="animate-spin inline-block mr-2" />{" "}
                  Loading…
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No Purchase Orders Found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium hidden md:block">
                    {order.po_number}
                  </TableCell>
                  <TableCell>
                    {order.client_name} – {order.item_brand} {order.item_name}
                  </TableCell>
                  <TableCell className="hidden md:block">
                    {order.status}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/po/update?id=${order.id}`}>
                        <SquarePen className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="h-4 w-4" color="red" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      {viewOrder && (
        <PurchaseOrderDialog
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}
    </div>
  );
}
