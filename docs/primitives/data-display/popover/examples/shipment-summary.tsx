import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Order summary</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>REC-8801</PopoverTitle>
          <PopoverDescription>Osaka Branch · 3 items · ¥842,000</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
