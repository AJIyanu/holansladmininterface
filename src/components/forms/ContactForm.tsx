"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  ContactFormValues,
} from "@/app/dashboard/crm/schemas/crm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PartyForm } from "./PartyForm";

interface ContactFormProps {
  initialValues?: Partial<ContactFormValues>;
  parties?: { id: string; name: string }[];
  onSubmit: (values: ContactFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function ContactForm({
  initialValues,
  parties,
  onSubmit,
  loading,
  error,
  success,
}: ContactFormProps) {
  const [createNewParty, setCreateNewParty] = React.useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: initialValues?.first_name ?? "",
      last_name: initialValues?.last_name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      position: initialValues?.position ?? "",
      party_id: initialValues?.party_id ?? undefined,
      new_party: undefined,
    },
  });

  async function handleSubmit(values: ContactFormValues) {
    await onSubmit(values);
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Position/Role" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="font-medium">Party</label>
            {!createNewParty ? (
              <>
                <Select
                  onValueChange={(val) => {
                    form.setValue("party_id", val);
                    form.setValue("new_party", undefined);
                  }}
                  value={form.watch("party_id")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select existing party" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {parties?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateNewParty(true);
                    form.setValue("party_id", undefined);
                  }}
                  className="mt-2"
                >
                  + Create New Party
                </Button>
              </>
            ) : (
              <div className="border p-3 rounded-md">
                <PartyForm
                  initialValues={{}}
                  onSubmit={async (values) => {
                    form.setValue("new_party", values);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateNewParty(false);
                    form.setValue("new_party", undefined);
                  }}
                  className="mt-2"
                >
                  Cancel New Party
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-brand-navy text-white hover:text-blue-900 hover:border"
          >
            {loading ? "Saving..." : "Save Contact"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
