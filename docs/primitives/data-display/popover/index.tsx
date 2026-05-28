import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger>PopoverTrigger</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>PopoverTitle</PopoverTitle>
          <PopoverDescription>PopoverDescription</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
