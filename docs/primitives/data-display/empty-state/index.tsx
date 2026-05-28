import { Package } from "lucide-react";

import { EmptyState } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <EmptyState title="EmptyState title" description="Description text." />
      <EmptyState icon={Package} title="With icon" description="Description text." />
      <EmptyState title="With action" action={<button type="button">Action</button>} />
    </>
  );
}
