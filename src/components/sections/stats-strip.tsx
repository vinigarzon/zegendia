import type { StatItem } from "@/lib/types";

export function StatsStrip({ items }: { items: StatItem[] }) {
  return (
    <section className="pb-8">
      <div className="container-shell">
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div className="glass-panel px-6 py-7" key={item.label}>
              <div className="font-display text-4xl font-semibold text-white">{item.value}</div>
              <div className="mt-2 text-sm text-slate-300">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
