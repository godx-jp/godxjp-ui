import { useState } from "react";

import { DialogConfirm } from "@godxjp/ui/feedback";

export default function Demo() {
  const [open, setOpen] = useState(true);

  return (
    <DialogConfirm
      open={open}
      onOpenChange={setOpen}
      title="DialogConfirm"
      description="Description"
      onConfirm={() => undefined}
    />
  );
}
