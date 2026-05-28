import { useState } from "react";

import { DialogConfirm } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Hủy đơn hàng đã chọn
      </Button>
      <DialogConfirm
        open={open}
        onOpenChange={setOpen}
        title="Hủy đơn hàng này?"
        description="Đơn sẽ bị đóng và không còn xuất hiện trong danh sách xử lý."
        confirmLabel="Hủy đơn"
        cancelLabel="Giữ lại"
        variant="destructive"
        onConfirm={() => undefined}
      />
    </>
  );
}
