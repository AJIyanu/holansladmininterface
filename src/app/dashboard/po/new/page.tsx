import PurchaseOrderForm from "@/components/forms/PurchaseOrderForm";

export const dynamic = "force-dynamic";

export default function POFormPage() {
  return (
    <div className="h-full p-8">
      <PurchaseOrderForm />
    </div>
  );
}
