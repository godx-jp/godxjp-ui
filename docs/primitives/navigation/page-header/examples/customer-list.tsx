import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";
import { PageHeader } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <PageHeader
      title="Khách hàng"
      description="1.248 hồ sơ · 89 VIP · Đồng bộ engagement-service mỗi 5 phút"
      actions={
        <Inline gap="sm">
          <Button variant="outline" size="sm">
            Nhập CSV
          </Button>
          <Button size="sm">Thêm khách</Button>
        </Inline>
      }
    />
  );
}
