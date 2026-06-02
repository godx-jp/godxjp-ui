import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { StatCard } from "@godxjp/ui/data-display";

function Delta({ trend }: { trend: "up" | "down" }) {
  return (
    <span
      className={trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
    >
      {trend === "up" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
    </span>
  );
}

export default function Demo() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Sent" value="12,400" delta={<Delta trend="up" />} />
      <StatCard label="Opened" value="4,873" hint="39.3%" delta={<Delta trend="up" />} />
      <StatCard label="Clicked" value="612" />
      <StatCard label="Bounced" value="84" delta={<Delta trend="down" />} />
    </div>
  );
}
