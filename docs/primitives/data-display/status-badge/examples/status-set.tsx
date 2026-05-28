import { StatusBadge } from "@godxjp/ui/data-display";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Inline gap="sm">
      <StatusBadge status="draft" />
      <StatusBadge status="pending" />
      <StatusBadge status="sending" />
      <StatusBadge status="completed" />
      <StatusBadge status="failed" />
    </Inline>
  );
}
