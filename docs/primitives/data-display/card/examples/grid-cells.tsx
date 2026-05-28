import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";

const cells = [
  { label: "Chờ xử lý", value: "23" },
  { label: "Đang giao", value: "8" },
  { label: "Chờ xác nhận", value: "2" },
  { label: "Delivered", value: "156" },
];

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Đơn hàng hôm nay</CardTitle>
      </CardHeader>
      <CardContent className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-md border p-0">
        {cells.map((cell) => (
          <div key={cell.label} className="ui-card-grid-cell bg-card">
            <div className="text-muted-foreground text-xs">{cell.label}</div>
            <div className="text-xl font-semibold tabular-nums">{cell.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
