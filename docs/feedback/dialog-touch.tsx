import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open touch dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Touch dialog</DialogTitle>
        <DialogDescription>Touch target and close behavior verification.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
