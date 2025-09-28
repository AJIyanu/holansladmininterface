import Link from "next/link";
import { PenBoxIcon } from "lucide-react";
import DeleteActionButton from "@/components/DeleteButton";

export default function CustomerTable({ data }: { data: any[] }) {
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
              <td className="px-4 py-2 space-x-2">
                <Link
                  href={`/dashboard/customers/profiles?id=${p.id}&type=party`}
                  className="text-blue-600"
                >
                  <PenBoxIcon className="h-4 w-4 mr-1" color="navy" />
                </Link>
                <DeleteActionButton id={p.id} url="/api/crm/parties/" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
