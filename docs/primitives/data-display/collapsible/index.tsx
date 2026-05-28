import { useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@godxjp/ui/data-display";

export default function Demo() {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>{open ? "Hide content" : "Show content"}</CollapsibleTrigger>
      <CollapsibleContent>CollapsibleContent</CollapsibleContent>
    </Collapsible>
  );
}
