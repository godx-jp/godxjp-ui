import { useState } from "react";

import { Stack } from "@godxjp/ui/layout";
import { Steps } from "@godxjp/ui/navigation";

const items = [
  { title: "Thông tin đơn hàng", content: "Nhập mã đơn, số lượng, giá trị" },
  { title: "Ghi chú nội bộ", content: "Thêm ghi chú, tệp đính kèm, kiểm tra" },
  { title: "Xác nhận gửi", content: "Review & submit batch" },
];

export default function Demo() {
  const [current, setCurrent] = useState(1);

  return (
    <Stack gap="md" className="max-w-2xl">
      <Steps current={current} onValueChange={setCurrent} items={items} />
      <p className="text-muted-foreground text-sm">Bước hiện tại: {current + 1}</p>
    </Stack>
  );
}
