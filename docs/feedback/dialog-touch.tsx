import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { PageContainer } from "@godxjp/ui/layout";
export default function Demo() {
  return (
    <PageContainer title="Dialog touch" subtitle="Touch target and close behavior verification">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open touch dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Touch dialog</DialogTitle>
          <DialogDescription>Touch target and close behavior verification.</DialogDescription>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
