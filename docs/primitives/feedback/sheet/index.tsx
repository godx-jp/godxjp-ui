import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button">Open Sheet</button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>SheetTitle</SheetTitle>
          <SheetDescription>SheetDescription</SheetDescription>
        </SheetHeader>
        <SheetFooter>SheetFooter</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
