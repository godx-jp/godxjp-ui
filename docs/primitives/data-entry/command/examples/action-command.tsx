import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <Command className="max-w-md">
      <CommandInput placeholder="Tìm action..." />
      <CommandList>
        <CommandEmpty>Không có action phù hợp.</CommandEmpty>
        <CommandGroup heading="Operations">
          <CommandItem>Assign customer</CommandItem>
          <CommandItem>Create order</CommandItem>
          <CommandItem disabled>Export batch</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
