import { Badge, CardStat } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <CardStat
        label="Backlog"
        value="128"
        hint="22 đơn cần xử lý"
        delta={<Badge variant="warning">+8%</Badge>}
      />
      <CardStat
        align="end"
        layout="inline"
        label="SLA"
        value="96.4%"
        hint="rolling 24h window"
        delta={<Badge variant="success">on track</Badge>}
      />
    </div>
  );
}
