import { CardDemo } from "@/components/layout/CardDemo";
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-8">
      <CardDemo wide />
      <CardDemo />
      <CardDemo tall />
      <CardDemo />
      <CardDemo />
      <CardDemo wide />
    </div>
  );
}
