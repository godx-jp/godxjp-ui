import { Badge } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="destructive">Destructive</Badge>
    </>
  );
}
