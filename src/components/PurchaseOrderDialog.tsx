"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrder, SupplierQuote } from "@/types/purchase";

interface Props {
  order: PurchaseOrder;
  onClose: () => void;
}

export default function PurchaseOrderDialog({ order, onClose }: Props) {
  const [quoteDetail, setQuoteDetail] = useState<SupplierQuote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      if (!order?.supplier_quote) {
        setQuoteDetail(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/procurement/supplier-quotes/${order.supplier_quote}/`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch quote");
        const q = (await res.json()) as SupplierQuote;
        setQuoteDetail(q);
      } catch (err) {
        console.error(err);
        setQuoteDetail(null);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [order]);

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-sm md:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Purchase Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Client</h4>
              <p>{order.client_name}</p>
              <h4 className="font-semibold mt-2">Supplier</h4>
              <p>{order.supplier_name}</p>
            </div>
            <div>
              <h4 className="font-semibold">Item</h4>
              <p>
                {order.item_brand} – {order.item_name}
              </p>
              <h4 className="font-semibold mt-2">Status</h4>
              <Badge>{order.status}</Badge>
            </div>
            <div>
              <h4 className="font-semibold">Item Price</h4>
              <p>{order.price}</p>
              <h4 className="font-semibold mt-2">Expiry Date</h4>
              {order.expiry_date}
            </div>
          </div>

          {loading && <div>Loading quote...</div>}

          {quoteDetail && (
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2">Supplier Quote</h4>
              <p>
                <strong>Quoted Price:</strong> {quoteDetail.quoted_price}
              </p>
              <p>
                <strong>Lead Time:</strong>{" "}
                {quoteDetail.lead_time_days ?? "N/A"} days
              </p>
              <p>
                <strong>Currency:</strong> {quoteDetail.currency}
              </p>
              <p>
                <strong>Import Type:</strong> {quoteDetail.import_type ?? "N/A"}
              </p>
              <p>
                <strong>Item Spec:</strong>{" "}
                {quoteDetail.client_request_details?.specification ?? "N/A"}
              </p>
            </div>
          )}

          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2">PO Tracker</h4>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              {order.trackers.map((t, idx) => (
                <div key={t.id} className="flex items-center mr-2">
                  <div
                    title={t.description}
                    className={`w-4 h-4 rounded-full ${
                      t.status === "ordered" || t.status === "pending"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  {idx < order.trackers.length - 1 && (
                    <div className="h-px sm:w-16 w-full bg-gray-400 mx-2"></div>
                  )}
                  <span className="text-xs ml-2">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
