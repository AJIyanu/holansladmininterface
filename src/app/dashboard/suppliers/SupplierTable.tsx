import DeleteActionButton from "@/components/DeleteButton";
import { PencilLine } from "lucide-react";
import Link from "next/link";

interface Supplier {
  id: string;
  name: string;
  is_organization: boolean;
}

export default function SupplierTable({ data }: { data: Supplier[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Is Organization?</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">{p.is_organization ? "Yes" : "No"}</td>
              <td className="px-4 py-2 space-x-2 justify-center">
                <Link
                  href={`/dashboard/suppliers/profiles?id=${p.id}&type=party`}
                  className="text-blue-600 underline"
                >
                  <PencilLine className="h-4 w-4" color="navy" />
                </Link>
                <DeleteActionButton url="/api/crm/parties/" id={p.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
