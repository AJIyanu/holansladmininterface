import Link from "next/link";
import { PenLine } from "lucide-react";
import DeleteActionButton from "@/components/DeleteButton";

export default function CustomerContactTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Full Name</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left hidden md:table-cell">Email</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">
                {c.first_name} {c.last_name}
              </td>
              <td className="px-4 py-2">{c.phone ?? "-"}</td>
              <td className="px-4 py-2 hidden md:table-cell">
                {c.email ?? "-"}
              </td>
              <td className="px-4 py-2 space-x-2">
                <Link
                  href={`/dashboard/customers/profiles?id=${c.id}&type=contact`}
                  className="text-blue-600"
                >
                  <PenLine className="h-4 w-4" color="navy" />
                </Link>
                <DeleteActionButton id={c.id} url="/api/crm/contacts/" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
