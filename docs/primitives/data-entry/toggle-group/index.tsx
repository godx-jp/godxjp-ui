import { ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup type="single" defaultValue="left" aria-label="Align">
      <ToggleGroupItem value="left">L</ToggleGroupItem>
      <ToggleGroupItem value="center">C</ToggleGroupItem>
      <ToggleGroupItem value="right">R</ToggleGroupItem>
    </ToggleGroup>
  );
}
