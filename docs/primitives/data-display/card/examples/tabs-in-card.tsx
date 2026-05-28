import { Package, Truck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { TabsItems } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Chi tiết đơn ORD-2026-8842</CardTitle>
        <CardDescription>Osaka to HCM · 3 đơn hàng</CardDescription>
      </CardHeader>
      <CardContent tight flush>
        <TabsItems
          variant="line"
          defaultValue="items"
          items={[
            {
              key: "items",
              label: "Hàng hóa",
              icon: <Package className="size-4" aria-hidden="true" />,
              children: (
                <p className="text-muted-foreground text-sm">
                  Quần áo (3), Phụ kiện (2), Sách (1).
                </p>
              ),
            },
            {
              key: "logistics",
              label: "Vận chuyển",
              icon: <Truck className="size-4" aria-hidden="true" />,
              children: (
                <p className="text-muted-foreground text-sm">KIX to SGN · ETD 24/05 09:30 JST.</p>
              ),
            },
            {
              key: "customs",
              label: "Ghi chú",
              children: (
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
