import { PageHeader } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <PageHeader
      title="PageHeader"
      description="Description"
      breadcrumb={[{ label: "One", to: "/" }, { label: "Current" }]}
      actions={<button type="button">Action</button>}
    />
  );
}
