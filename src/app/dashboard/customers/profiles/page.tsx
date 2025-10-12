import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { PartyForm } from "@/components/forms/PartyForm";
import {
  PartyFormValues,
  ContactFormValues,
} from "@/app/dashboard/crm/schemas/crm";

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
  const partyRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/crm/parties/?party_type=client`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  const parties: Party[] = partyRes.ok ? await partyRes.json() : [];

  let existingData: PartyFormValues | ContactFormValues | null = null;

  if (id && type === "party") {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/crm/parties/${id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) redirect("/dashboard/customers");
    existingData = await res.json();
  }
  if (id && type === "contact") {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/crm/contacts/${id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) redirect("/dashboard/customers");
    existingData = await res.json();
  }

  async function handleParty(
    values: PartyFormValues
  ): Promise<{ success?: string; error?: string }> {
    "use server";
    const token = (await cookies()).get("access_token")?.value;
    let res;
    if (id && type === "party") {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crm/parties/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
          cache: "no-store",
        }
      );
    } else {
      const payload = { ...values, party_type: "client" };
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/parties/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    }

    if (!res.ok)
      return {
        error: `Unable to save data. Try again or contact IT`,
      };
    return { success: "Party saved and updated successfully" };
  }

  async function handleContact(
    values: ContactFormValues
  ): Promise<{ success?: string; error?: string }> {
    "use server";
    const token = (await cookies()).get("access_token")?.value;
    let res;
    if (id && type === "contact") {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crm/contacts/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
          cache: "no-store",
        }
      );
    } else {
      const payload = { ...values };
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/contacts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    }

    if (!res.ok)
      return {
        error: `Unable to save data. Try again or contact IT`,
      };
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
