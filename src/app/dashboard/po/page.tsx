import PurchaseOrderTable from "@/components/tables/PurrchaseOrder";
import { PurchaseOrder } from "@/types/purchase";
import { JSX } from "react";
import { cookies } from "next/headers";

export default async function Page(): Promise<JSX.Element> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/procurement/purchase-orders/`,
    {
      credentials: "include",
      // headers: { Cookie: (await cookies()).toString() },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await cookies()).get("access_token")?.value}`,
      },
    }
  );

  console.log(
    "Fetching purchase orders with token:",
    (await cookies()).get("access_token")
  );

  let orders: PurchaseOrder[] = [];
  try {
    if (res.ok) {
      orders = (await res.json()) as PurchaseOrder[];
    } else {
      console.error(
        "Failed to fetch purchase orders on server:",
        res.statusText
      );
    }
  } catch (err) {
    console.error("Error parsing purchase orders:", err);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Purchase Orders</h1>
      <PurchaseOrderTable initialOrders={orders} />
    </div>
  );
}
