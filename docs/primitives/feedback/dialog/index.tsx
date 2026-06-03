import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  DialogTrigger,
} from "@godxjp/ui/feedback";

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm title"
        description="Confirm description"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => undefined}
      />
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DialogTitle</DialogTitle>
            <DialogDescription>DialogDescription</DialogDescription>
          </DialogHeader>
          <DialogFooter>DialogFooter</DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
