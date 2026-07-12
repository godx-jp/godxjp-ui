import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open touch dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Touch dialog</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
