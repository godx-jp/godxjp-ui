import { StatusBadge } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <StatusBadge status="draft" />
      <StatusBadge status="pending" />
      <StatusBadge status="completed" />
      <StatusBadge status="failed" />
      <StatusBadge status="custom_status" label="Custom label" />
    </>
  );
}
