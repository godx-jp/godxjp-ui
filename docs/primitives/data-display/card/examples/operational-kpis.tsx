import { StatCard } from "@godxjp/ui/data-display";

function Trend({ tone, children }: { tone: "good" | "bad" | "warn"; children: string }) {
  const color =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "bad"
        ? "text-destructive"
        : "text-amber-600 dark:text-amber-400";

  return <span className={`text-sm font-medium tabular-nums ${color}`}>{children}</span>;
}

export default function Demo() {
  return (
    <div className="grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Backlog"
        value="128"
        hint="22 đơn cần xử lý"
        delta={<Trend variant="warn">+8%</Trend>}
      />
      <StatCard
        label="SLA on-time"
        value="96.4%"
        hint="24h rolling window"
        delta={<Trend variant="good">+1.2%</Trend>}
      />
      <StatCard
        label="Exceptions"
        value="7"
        hint="3 high priority"
        delta={<Trend variant="bad">+3</Trend>}
      />
      <StatCard
        label="Revenue"
        value="¥4.8M"
        hint="Today gross sales"
        delta={<Trend variant="good">+12%</Trend>}
      />
    </div>
  );
}
