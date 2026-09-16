"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="space-y-4 p-6">
      <h1 className="font-heading text-2xl">Accounts could not load</h1>
      <p>Please retry. Your saved records remain available.</p>
      <button className="rounded-md border px-4 py-2" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
