import { Download, Plus, Trash2 } from "lucide-react";

import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Inline gap="sm">
      <Button>
        <Plus aria-hidden="true" />
        Thêm khách CRM
      </Button>
      <Button variant="outline">
        <Download aria-hidden="true" />
        Tải packing list
      </Button>
      <Button tone="destructive" size="sm">
        <Trash2 aria-hidden="true" />
        Xóa chiến dịch
      </Button>
    </Inline>
  );
}
