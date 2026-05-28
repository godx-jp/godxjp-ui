import { Search } from "lucide-react";

import { EmptyState } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <EmptyState
      icon={Search}
      title="Không có khách hàng phù hợp"
      description="Bộ lọc hiện tại không trả về kết quả. Thử xóa bớt điều kiện."
      action={<Button variant="outline">Xóa filter</Button>}
    />
  );
}
