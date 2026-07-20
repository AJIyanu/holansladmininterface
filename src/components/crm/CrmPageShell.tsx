import type { LucideIcon } from "lucide-react";

interface CrmPageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stageDescription: string;
  capabilities: string[];
}

export function CrmPageShell({
  title,
  description,
  icon: Icon,
  stageDescription,
  capabilities,
}: CrmPageShellProps) {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E8] text-[#F46C0B]">
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
              Customer relationship management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569] sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Stage 1 foundation
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#475569]">
            {stageDescription}
          </p>

          <div className="mt-5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
            <p className="text-sm font-medium text-[#9A3412]">
              Operational forms and records will be connected in the next
              implementation stage.
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#334155]">
            Planned capabilities
          </h2>

          <ul className="mt-4 space-y-3">
            {capabilities.map((capability) => (
              <li
                key={capability}
                className="flex gap-3 text-sm leading-5 text-[#475569]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F46C0B]" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
