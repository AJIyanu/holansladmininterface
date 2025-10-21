import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { PartyForm } from "@/components/forms/PartyForm";
import {
  PartyFormValues,
  ContactFormValues,
} from "@/app/dashboard/crm/schemas/crm";
import { serverFetch } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

interface Party {
  id: string;
  name: string;
  party_type: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  const { id, type } = await searchParams;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  // fetch parties for dropdown
  const partyRes = await serverFetch<Party[]>(
    "/crm/parties/?party_type=client"
  );
  const parties: Party[] = partyRes.success ? partyRes.data ?? [] : [];

  let existingData: PartyFormValues | ContactFormValues | null = null;

  if (id && type === "party") {
    const res = await serverFetch<PartyFormValues>(`/crm/parties/${id}/`);
    if (!res.success) redirect("/dashboard/customers");
    existingData = res.data ?? null;
  }
  if (id && type === "contact") {
    const res = await serverFetch<ContactFormValues>(`/crm/contacts/${id}/`);
    if (!res.success) redirect("/dashboard/customers");
    existingData = res.data ?? null;
  }

  async function handleParty(
    values: PartyFormValues
  ): Promise<{ success?: string; error?: string }> {
    "use server";

    if (id && type === "party") {
      const result = await serverFetch(`/crm/parties/${id}/`, {
        method: "PUT",
        body: values,
      });

      if (!result.success) {
        return {
          error:
            result.error?.message ||
            "Unable to save data. Try again or contact IT",
        };
      }
    } else {
      const payload = { ...values, party_type: "client" };
      const result = await serverFetch(`/crm/parties/`, {
        method: "POST",
        body: payload,
      });

      if (!result.success) {
        return {
          error:
            result.error?.message ||
            "Unable to save data. Try again or contact IT",
        };
      }
    }

    return { success: "Party saved and updated successfully" };
  }

  async function handleContact(
    values: ContactFormValues
  ): Promise<{ success?: string; error?: string }> {
    "use server";

    if (id && type === "contact") {
      const result = await serverFetch(`/crm/contacts/${id}/`, {
        method: "PUT",
        body: values,
      });

      if (!result.success) {
        return {
          error:
            result.error?.message ||
            "Unable to save data. Try again or contact IT",
        };
      }
    } else {
      const result = await serverFetch(`/crm/contacts/`, {
        method: "POST",
        body: values,
      });

      if (!result.success) {
        return {
          error:
            result.error?.message ||
            "Unable to save data. Try again or contact IT",
        };
      }
    }

    return { success: "Party saved and updated successfully" };
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {id
          ? type === "party"
            ? "Update Customer"
            : "Update Contact Person"
          : "New Customer / Contact Person"}
      </h1>

      {type === "contact" || (!type && !id) ? (
        <ContactForm
          initialValues={existingData ?? {}}
          parties={parties.map((p) => ({ id: p.id, name: p.name }))}
          onSubmit={async (values) => {
            "use server";
            return await handleContact(values);
          }}
        />
      ) : (
        <PartyForm
          initialValues={existingData ?? { party_type: "client" }}
          onSubmit={async (values) => {
            "use server";
            return await handleParty(values);
          }}
        />
      )}
    </div>
  );
}
