import { StatCard } from "@godxjp/ui";

export function Grid() {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 640 }}>
      <StatCard label="Present today" value="142" hint="of 158 employees" delta="+6" />
      <StatCard label="Pending approvals" value="8" accent="warning" delta="+3" />
      <StatCard label="Overtime hours" value="37.5h" accent="attention" inverse delta="-12%" />
    </div>
  );
}

export function Layouts() {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <StatCard layout="stacked" label="Avg. work hours" value="7.8h" hint="this month" />
      <StatCard layout="inline" label="Leave balance" value="12 days" />
    </div>
  );
}
