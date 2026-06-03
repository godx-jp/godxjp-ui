import { useState } from "react";

import { AlertDialog } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button tone="destructive" onClick={() => setOpen(true)}>
        Hủy đơn hàng đã chọn
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Hủy đơn hàng này?"
        description="Đơn sẽ bị đóng và không còn xuất hiện trong danh sách xử lý."
        confirmLabel="Hủy đơn"
        cancelLabel="Giữ lại"
        tone="destructive"
        onConfirm={() => undefined}
      />
    </>
  );
}
