import { ScrollArea, ScrollBar } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <ScrollArea>
      <div>Line 1</div>
      <div>Line 2</div>
      <div>Line 3</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
