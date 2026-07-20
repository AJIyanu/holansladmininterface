export default function CrmLoading() {
  return (
    <div className="space-y-6" aria-label="Loading CRM" aria-busy="true">
      <div className="h-40 animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9]" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-72 animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9]" />
        <div className="h-72 animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9]" />
      </div>
    </div>
  );
}
