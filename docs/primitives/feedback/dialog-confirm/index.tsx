import { useState } from "react";

import { AlertDialog } from "@godxjp/ui/feedback";

export default function Demo() {
  const [open, setOpen] = useState(true);

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title="Alert dialog"
      description="Description"
      onConfirm={() => undefined}
    />
  );
}
