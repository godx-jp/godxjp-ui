import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <>
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
      <Dialog mode="confirm">
        <DialogTrigger asChild>
          <button type="button">Open Confirm</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm title</DialogTitle>
            <DialogDescription>Confirm description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancel>Cancel</DialogCancel>
            <DialogAction>Confirm</DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
