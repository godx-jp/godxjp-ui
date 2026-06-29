import { Button } from "@godxjp/ui";

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button>Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">Export CSV</Button>
      <Button variant="dashed">Add row</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="link">View details</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button shape="pill" variant="secondary">Pill</Button>
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button>Enabled</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled outline</Button>
    </div>
  );
}
