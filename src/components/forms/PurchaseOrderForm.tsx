"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Types ---
export interface Party {
  id: string;
  name: string;
  party_type: string;
}

export interface SupplierQuote {
  id: string;
  supplier_name: string;
  currency: string;
  quoted_price: string;
  client_request_details: {
    item_name: string;
  };
}

export interface PurchaseOrderDefaultData {
  id: string;
  po_number: string;
  client: string;
  supplier_quote: string;
  quantity: number;
  uom: string;
  price: string;
  expiry_date?: string | null;
  status:
    | "pending"
    | "ordered"
    | "ready"
    | "canceled"
    | "delivered"
    | "accepted"
    | "rejected";
}

interface PurchaseOrderFormProps {
  defaultData?: PurchaseOrderDefaultData | null;
  onSubmit?: (result: PurchaseOrderDefaultData) => void;
  onCancel?: () => void;
}

// --- Zod Schema ---
const purchaseOrderSchema = z.object({
  po_number: z.string().min(1, "PO Number is required"),
  client: z.string().min(1, "Client is required"),
  supplier_quote: z.string().min(1, "Supplier Quote is required"),
  quantity: z.number(),
  uom: z.string().min(1, "Unit of measure is required"),
  price: z.string(),
  expiry_date: z
    .string()
    .transform((val) => (val ? val : null))
    .nullable()
    .optional(),
  status: z.enum([
    "pending",
    "ordered",
    "ready",
    "canceled",
    "delivered",
    "accepted",
    "rejected",
  ]),
});

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "ordered", label: "Item Ordered" },
  { value: "ready", label: "Ready for Delivery" },
  { value: "canceled", label: "Canceled" },
  { value: "delivered", label: "Delivered" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const UOM_OPTIONS = [
  "kg",
  "lbs",
  "tons",
  "pieces",
  "pcs",
  "boxes",
  "liters",
  "gallons",
  "meters",
  "feet",
];

/**
 * PurchaseOrderForm allows creating or updating a Purchase Order.
 */
export default function PurchaseOrderForm({
  defaultData = null,
  onSubmit,
  onCancel,
}: PurchaseOrderFormProps) {
  const [clients, setClients] = useState<Party[]>([]);
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      po_number: defaultData?.po_number || "",
      client: defaultData?.client || "",
      supplier_quote: defaultData?.supplier_quote || "",
      quantity: defaultData?.quantity || 1,
      uom: defaultData?.uom || "",
      price: defaultData?.price || undefined,
      expiry_date: defaultData?.expiry_date || "",
      status: defaultData?.status || "pending",
    },
  });

  // --- Fetch Clients and Supplier Quotes ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const clientsResponse = await fetch(`/api/crm/parties`, {
          cache: "no-store",
        });
        if (!clientsResponse.ok) throw new Error("Failed to fetch clients");
        const clientsData: Party[] = await clientsResponse.json();
        setClients(clientsData.filter((p) => p.party_type === "client"));

        const quotesResponse = await fetch(`/api/procurement/supplier-quotes`, {
          cache: "no-store",
        });
        if (!quotesResponse.ok)
          throw new Error("Failed to fetch supplier quotes");
        const quotesData: SupplierQuote[] = await quotesResponse.json();
        setSupplierQuotes(quotesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Handle Submit ---
  const onSubmitForm = async (data: z.infer<typeof purchaseOrderSchema>) => {
    try {
      const submitData = {
        ...data,
        expiry_date: data.expiry_date || null,
      };

      const url = defaultData
        ? `/api/procurement/purchase-orders/${defaultData.id}/`
        : `/api/procurement/purchase-orders/`;

      const method = defaultData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData && typeof errorData === "object") {
          Object.keys(errorData).forEach((field) => {
            form.setError(field as keyof z.infer<typeof purchaseOrderSchema>, {
              message: errorData[field][0] || errorData[field],
            });
          });
          return;
        }
        throw new Error("Failed to save purchase order");
      }

      const result = await response.json();
      onSubmit?.(result);

      setSuccessMessage(
        defaultData
          ? "Purchase order updated successfully."
          : "Purchase order submitted successfully."
      );

      if (!defaultData) form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      form.setError("root", {
        message: "Failed to save purchase order. Please try again.",
      });
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading form data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>
          {defaultData ? "Update Purchase Order" : "Create Purchase Order"}
        </CardTitle>
        <CardDescription>
          {defaultData
            ? "Update the purchase order details below"
            : "Fill in the details to create a new purchase order"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fetchError && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border border-green-400 bg-green-50 text-green-800">
            {" "}
            {/* No variant prop, so it uses the default style */}
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          {/* Use form tag to trigger native submit */}
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-6"
          >
            {form.formState.errors.root && (
              <Alert
                className="mb-6 border border-red-400 text-red-800"
                variant="destructive"
              >
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            {/* PO Number and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="po_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PO number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client and Supplier Quote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier_quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Quote *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier quote" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {supplierQuotes.map((quote) => (
                          <SelectItem key={quote.id} value={quote.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {quote.supplier_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {quote.client_request_details.item_name} -{" "}
                                {quote.currency} {quote.quoted_price}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity, UOM, Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {UOM_OPTIONS.map((uom) => (
                          <SelectItem key={uom} value={uom}>
                            {uom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        min="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[240] p-0 bg-white"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        captionLayout="dropdown"
                        className="w-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1 bg-brand-navy shadow-md text-white"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {defaultData
                  ? "Update Purchase Order"
                  : "Create Purchase Order"}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={form.formState.isSubmitting}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
