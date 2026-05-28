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
    <Command>
      <CommandInput placeholder="CommandInput" />
      <CommandList>
        <CommandEmpty>CommandEmpty</CommandEmpty>
        <CommandGroup heading="CommandGroup">
          <CommandItem>CommandItem</CommandItem>
          <CommandItem disabled>Disabled CommandItem</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
