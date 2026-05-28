import { Package, Truck } from "lucide-react";

import { TabsItems } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <TabsItems
      variant="line"
      defaultValue="orders"
      items={[
        {
          key: "orders",
          label: "Đơn hàng",
          icon: <Package className="size-4" aria-hidden="true" />,
          children: <p className="text-sm">Danh sách đơn hàng đang xử lý.</p>,
        },
        {
          key: "shipments",
          label: "Vận chuyển",
          icon: <Truck className="size-4" aria-hidden="true" />,
          children: <p className="text-sm">Theo dõi trạng thái giao hàng đến khách hàng.</p>,
        },
      ]}
    />
  );
}
