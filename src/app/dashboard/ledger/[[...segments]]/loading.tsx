export default function Loading() {
  return (
    <main className="space-y-4 p-6" aria-busy="true">
      <p>Loading Accounts…</p>
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </main>
  );
}
