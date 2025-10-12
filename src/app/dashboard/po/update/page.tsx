import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import PurchaseOrderForm from "@/components/forms/PurchaseOrderForm";
import { PurchaseOrderDefaultData } from "@/types/purchase";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    redirect("/dashboard/po");
  }

  const token = (await cookies()).get("access_token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/procurement/purchase-orders/${id}/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    redirect("/dashboard/po");
  }

  const po: PurchaseOrderDefaultData = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Update Purchase Order</h1>
      <PurchaseOrderForm
        defaultData={{
          ...po,
          status: po.status as
            | "pending"
            | "ordered"
            | "ready"
            | "canceled"
            | "delivered"
            | "accepted"
            | "rejected",
        }}
      />
    </div>
  );
}
