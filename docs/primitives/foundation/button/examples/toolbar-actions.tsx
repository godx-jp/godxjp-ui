import { Package, Send } from "lucide-react";

import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Inline gap="sm" className="bg-card rounded-md border p-3">
      <Button size="sm">
        <Package aria-hidden="true" />
        Tạo đơn hàng mới
      </Button>
      <Button size="sm" variant="outline">
        <Send aria-hidden="true" />
        Gửi thông báo khách hàng
      </Button>
      <Button size="sm" variant="ghost">
        Lọc nâng cao
      </Button>
    </Inline>
  );
}
