"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partySchema, PartyFormValues } from "@/app/dashboard/crm/schemas/crm";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

interface PartyFormProps {
  initialValues?: Partial<PartyFormValues>;
  onSubmit: (
    values: PartyFormValues
  ) => Promise<{ success?: string; error?: string }>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  // New props for inline usage
  inline?: boolean;
  onValuesChange?: (values: PartyFormValues) => void;
  externalForm?: UseFormReturn<PartyFormValues>;
}

export function PartyForm({
  initialValues,
  onSubmit,
  inline = false,
  onValuesChange,
}: PartyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      party_type:
        (initialValues?.party_type as "client" | "supplier") ?? "client",
      is_organization: initialValues?.is_organization ?? true,
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
    },
  });

  // Watch form values and notify parent when they change (for inline usage)
  useEffect(() => {
    if (inline && onValuesChange) {
      const subscription = form.watch((values) => {
        if (values) {
          form.trigger().then((isValid) => {
            if (isValid) {
              onValuesChange(values as PartyFormValues);
            }
          });
        }
      });

      return () => subscription.unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inline, onValuesChange]);

  async function handleSubmit(values: PartyFormValues) {
    setLoading(true);
    const result: {
      success?: string;
      error?: string;
    } = await onSubmit(values);

    if (result.error) {
      setError(result.error);
      setTimeout(() => setError(null), 10000);
    }
    if (result.success) {
      setSuccess(result.success);
      form.reset();
      setTimeout(() => setSuccess(null), 10000);
    }
    setLoading(false);
  }

  const formFields = (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Party Name</FormLabel>
            <FormControl>
              <Input placeholder="Party name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="party_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Party Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_organization"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <FormLabel>Is Organization</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="bg-brand-navy"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Party Email</FormLabel>
            <FormControl>
              <Input placeholder="Email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Party Phone</FormLabel>
            <FormControl>
              <Input placeholder="Phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // For inline usage, return just the form fields without form wrapper
  if (inline) {
    return (
      <div className="space-y-4">
        <Form {...form}>
          <div className="space-y-4">{formFields}</div>
        </Form>
      </div>
    );
  }

  // For standalone usage, return complete form with submit button
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {formFields}
          <Button
            type="submit"
            disabled={loading}
            className="bg-brand-navy text-white hover:text-blue-900 hover:border"
          >
            {loading ? "Saving..." : "Save Party"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
