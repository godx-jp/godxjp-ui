import { Badge } from "@godxjp/ui";

export function Tones() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge>Default</Badge>
      <Badge tone="success">Approved</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="destructive">Rejected</Badge>
      <Badge tone="info">In review</Badge>
      <Badge tone="muted">Draft</Badge>
      <Badge tone="neutral">Archived</Badge>
    </div>
  );
}

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge variant="default" tone="info">Solid</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="dashed">Dashed</Badge>
      <Badge shape="pill" tone="success">Pill</Badge>
      <Badge shape="sharp">Sharp</Badge>
    </div>
  );
}

export function WithStatusDot() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge status="success" tone="success">Online</Badge>
      <Badge status="warning" tone="warning">Away</Badge>
      <Badge status="destructive" tone="destructive">Offline</Badge>
    </div>
  );
}
