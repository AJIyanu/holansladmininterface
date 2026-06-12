import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ClientRequest } from "@/types/procurement";
import RequestForm from "@/components/forms/RequestForm";

async function fetchRequest(id: string): Promise<ClientRequest | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/login");

  try {
    const response = await fetch(
      `${process.env.DJANGO_API_URL}/procurement/client-requests/${id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch request");
    }

    return response.json();
  } catch {
    return null;
  }
}

interface EditRequestContentProps {
  requestId: string;
}

export default async function EditRequestContent({
  requestId,
}: EditRequestContentProps) {
  const request = await fetchRequest(requestId);

  if (request === null) {
    notFound();
  }

  return <RequestForm initialData={request} mode="edit" />;
}
