import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">DropdownMenuTrigger</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>DropdownMenuLabel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>DropdownMenuItem</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Checked item</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="one">
          <DropdownMenuRadioItem value="one">Radio item</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuItem>
          Export
          <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled DropdownMenuItem</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
