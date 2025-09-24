"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, SquarePen, Trash2 } from "lucide-react";

interface Tracker {
  id: string;
  status: string;
  description: string;
  updated_at: string;
}
interface PurchaseOrder {
  id: string;
  client_name: string;
  supplier_name: string;
  item_name: string;
  item_brand: string;
  po_number: string;
  status: string;
  created_at: string;
  trackers: Tracker[];
  supplier_quote: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [quoteDetail, setQuoteDetail] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch(`/api/procurement/purchase-orders/`, {
      credentials: "include",
    });
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  async function openView(order: PurchaseOrder) {
    setSelectedOrder(order);
    const res = await fetch(
      `/api/procurement/supplier-quotes/${order.supplier_quote}/`,
      {
        credentials: "include",
      }
    );
    const quote = await res.json();
    setQuoteDetail(quote);
  }

  const filteredOrders = orders.filter(
    (o) =>
      (filter
        ? o.po_number.toLowerCase().includes(filter.toLowerCase())
        : true) && (statusFilter ? o.status === statusFilter : true)
  );

  return (
    <div className="p-6 space-y-4 h-full">
      <h1 className="text-2xl font-bold">Purchase Orders</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by PO Number..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-1/3"
        />
        <Select onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
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
                      onClick={() => openView(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Trash2 className="h-4 w-4" color="red" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => {
          setSelectedOrder(null);
          setQuoteDetail(null);
        }}
      >
        <DialogContent className="rounded-lg max-w-sm md:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Client</h4>
                  <p>{selectedOrder.client_name}</p>
                  <h4 className="font-semibold mt-2">Supplier</h4>
                  <p>{selectedOrder.supplier_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Item</h4>
                  <p>
                    {selectedOrder.item_brand} – {selectedOrder.item_name}
                  </p>
                  <h4 className="font-semibold mt-2">Status</h4>
                  <Badge>{selectedOrder.status}</Badge>
                </div>
              </div>
              {/* Supplier Quote */}
              {quoteDetail && (
                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2">Supplier Quote</h4>
                  <p>
                    <strong>Quoted Price:</strong> {quoteDetail.quoted_price}
                  </p>
                  <p>
                    <strong>Lead Time:</strong> {quoteDetail.lead_time_days}{" "}
                    days
                  </p>
                  <p>
                    <strong>Currency:</strong> {quoteDetail.currency}
                  </p>
                  <p>
                    <strong>Import Type:</strong> {quoteDetail.import_type}
                  </p>
                  <p>
                    <strong>Item Spec:</strong>{" "}
                    {quoteDetail.client_request_details.specification}
                  </p>
                </div>
              )}

              {/* PO Tracker */}
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2">PO Tracker</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  {selectedOrder.trackers.map((t, idx) => (
                    <div key={t.id} className="flex items-center">
                      <div
                        title={t.description}
                        className={`w-4 h-4 rounded-full ${
                          t.status === "ordered" || t.status === "pending"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      {idx < selectedOrder.trackers.length - 1 && (
                        <div className="h-px sm:w-16 w-full bg-gray-400 mx-2"></div>
                      )}
                      <span className="text-xs">{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
