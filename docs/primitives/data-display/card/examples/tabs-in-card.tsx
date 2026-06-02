import { Package, Truck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Tabs } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Chi tiết đơn ORD-2026-8842</CardTitle>
        <CardDescription>Osaka to HCM · 3 đơn hàng</CardDescription>
      </CardHeader>
      <CardContent tight flush>
        <Tabs
          variant="line"
          defaultValue="items"
          items={[
            {
              value: "items",
              label: "Hàng hóa",
              icon: <Package className="size-4" aria-hidden="true" />,
              content: (
                <p className="text-muted-foreground text-sm">
                  Quần áo (3), Phụ kiện (2), Sách (1).
                </p>
              ),
            },
            {
              value: "logistics",
              label: "Vận chuyển",
              icon: <Truck className="size-4" aria-hidden="true" />,
              content: (
                <p className="text-muted-foreground text-sm">KIX to SGN · ETD 24/05 09:30 JST.</p>
              ),
            },
            {
              value: "customs",
              label: "Ghi chú",
              content: (
                <p className="text-muted-foreground text-sm">
                  Ghi chú nội bộ: chờ xác nhận từ nhà cung cấp.
                </p>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
