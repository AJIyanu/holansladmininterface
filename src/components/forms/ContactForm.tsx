"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  ContactFormValues,
  PartyFormValues,
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
  onSubmit: (
    values: ContactFormValues
  ) => Promise<{ success?: string; error?: string }>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function ContactForm({
  initialValues,
  parties,
  onSubmit,
}: ContactFormProps) {
  const [createNewParty, setCreateNewParty] = React.useState(false);
  const [newPartyData, setNewPartyData] =
    React.useState<PartyFormValues | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

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

  const partyId = useWatch({
    control: form.control,
    name: "party_id",
  });

  async function handleSubmit(values: ContactFormValues) {
    setLoading(true);

    const submitValues = {
      ...values,
      new_party: createNewParty && newPartyData ? newPartyData : undefined,
    };

    const result = await onSubmit(submitValues);

    if (result.error) {
      setError(result.error);
      setTimeout(() => setError(null), 10000);
    }
    if (result.success) {
      setSuccess(result.success);
      form.reset();
      setCreateNewParty(false);
      setNewPartyData(null);
      setTimeout(() => setSuccess(null), 10000);
    }

    setLoading(false);
  }

  const handleNewPartyValuesChange = (partyValues: PartyFormValues) => {
    setNewPartyData(partyValues);
    // Update the form's new_party field
    form.setValue("new_party", partyValues);
  };

  const handleCancelNewParty = () => {
    setCreateNewParty(false);
    setNewPartyData(null);
    form.setValue("new_party", undefined);
  };

  const handleCreateNewParty = () => {
    setCreateNewParty(true);
    form.setValue("party_id", undefined);
    setNewPartyData(null);
  };

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
                  value={partyId}
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
                  onClick={handleCreateNewParty}
                  className="mt-2"
                >
                  + Create New Party
                </Button>
              </>
            ) : (
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    New Party Details
                  </h4>
                </div>
                <PartyForm
                  inline={true}
                  initialValues={{}}
                  onSubmit={async () => ({ success: "" })} // Dummy function since we're using inline
                  onValuesChange={handleNewPartyValuesChange}
                />
                <div className="mt-4 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelNewParty}
                    size="sm"
                  >
                    Cancel New Party
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || (createNewParty && !newPartyData)}
            className="bg-brand-navy text-white hover:text-blue-900 hover:border"
          >
            {loading ? "Saving..." : "Save Contact"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
