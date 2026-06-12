import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { PartyForm } from "@/components/forms/PartyForm";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  // default to contact form
  const formType = type === "party" ? "party" : "contact";

  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  // fetch parties for contact form dropdown
  const partiesRes = await fetch(`${process.env.DJANGO_API_URL}/crm/parties/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  let parties: { id: string; name: string }[] = [];
  if (partiesRes.ok) {
    const data = await partiesRes.json();
    parties =
      data.results?.map((p: { id: string; name: string }) => ({
        id: p.id,
        name: p.name,
      })) ?? [];
  }

  async function handleCreateParty(
    values: unknown,
  ): Promise<{ success?: string; error?: string }> {
    "use server";
    const token = (await cookies()).get("access_token")?.value;
    const res = await fetch(`${process.env.DJANGO_API_URL}/crm/parties/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
      cache: "no-store",
    });
    if (!res.ok) return { error: "Failed to create party" };
    return { success: "Party created successfully" };
  }

  async function handleCreateContact(
    values: unknown,
  ): Promise<{ success?: string; error?: string }> {
    "use server";
    const token = (await cookies()).get("access_token")?.value;
    const res = await fetch(`${process.env.DJANGO_API_URL}/crm/contacts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
      cache: "no-store",
    });
    if (!res.ok) return { error: "Failed to create party" };
    return { success: "Party created successfully" };
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {formType === "party" ? "Create Party" : "Create Contact"}
      </h1>
      {formType === "party" ? (
        <PartyForm
          onSubmit={async (values) => {
            "use server";
            return await handleCreateParty(values);
          }}
        />
      ) : (
        <ContactForm
          parties={parties}
          onSubmit={async (values) => {
            "use server";
            return await handleCreateContact(values);
          }}
        />
      )}
    </div>
  );
}
