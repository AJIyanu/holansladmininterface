"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  clientRequestSchema,
  ClientRequestFormData,
} from "@/lib/schemas/request";
import { Party, ContactPerson, ClientRequest } from "@/types/procurement";

interface RequestFormProps {
  initialData?: ClientRequest;
  mode: "create" | "edit";
}

export default function RequestForm({ initialData, mode }: RequestFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Party[]>([]);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientRequestFormData>({
    resolver: zodResolver(clientRequestSchema),
    defaultValues: {
      client: initialData?.client || "",
      contact_person: initialData?.contact_person || "",
      item_name: initialData?.item_name || "",
      specification: initialData?.specification || "",
      model: initialData?.model || "",
      brand: initialData?.brand || "",
      uom: initialData?.uom || "",
      quantity: initialData?.quantity || 1,
      status: initialData?.status || "pending",
      comments: initialData?.comments || "",
    },
  });

  const watchedClient = form.watch("client");

  // Load clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const response = await fetch("/api/crm/parties?party_type=client");
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        // console.log(data);
        setClients(data || []);
      } catch (error) {
        toast("Error", {
          description: "Failed to load clients",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Load contacts when client changes
  useEffect(() => {
    const fetchContacts = async (clientId: string) => {
      try {
        setIsLoadingContacts(true);
        const response = await fetch(`/api/crm/contacts?party=${clientId}`);
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const data = await response.json();
        // console.log(data);
        setContacts(data || []);
      } catch (error) {
        toast("Error", {
          description: "Failed to load contacts",
        });
        setContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (watchedClient) {
      fetchContacts(watchedClient);
      // Clear selected contact when client changes
      if (
        form.getValues("contact_person") &&
        watchedClient !== initialData?.client
      ) {
        form.setValue("contact_person", "");
      }
    } else {
      setContacts([]);
      form.setValue("contact_person", "");
    }
  }, [watchedClient, form, initialData?.client]);

  const onSubmit = async (data: ClientRequestFormData) => {
    setIsSubmitting(true);
    try {
      const url =
        mode === "edit" && initialData
          ? `/api/procurement/client-requests/${initialData.id}/`
          : "/api/procurement/client-requests/";

      const method = mode === "edit" ? "PUT" : "POST";
      console.log(data);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save request");
      }

      toast("Success", {
        description: `Request ${
          mode === "edit" ? "updated" : "created"
        } successfully`,
      });

      router.push("/dashboard/requests");
      router.refresh();
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : `Failed to ${mode} request`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "edit" ? "Edit Request" : "Create New Request"}
          </h1>
          <p className="text-gray-600">
            {mode === "edit"
              ? "Update the request details below"
              : "Fill in the details to create a new client request"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingClients}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingClients
                                  ? "Loading..."
                                  : "Select client"
                              }
                            />
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
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!watchedClient || isLoadingContacts}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !watchedClient
                                  ? "Select client first"
                                  : isLoadingContacts
                                  ? "Loading..."
                                  : "Select contact person"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="None">
                            No contact person
                          </SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.first_name} {contact.last_name}
                              {contact.position && ` - ${contact.position}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed specifications..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quantity & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          min="1"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                      <FormControl>
                        <Input placeholder="e.g., pcs, kg, m" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="discarded">Discarded</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional comments or notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              {mode === "edit" ? "Update Request" : "Create Request"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
