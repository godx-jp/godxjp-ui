import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <Select defaultValue="one">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Primary</SelectLabel>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
          <SelectSeparator />
          <SelectItem value="disabled" disabled>
            Disabled
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
