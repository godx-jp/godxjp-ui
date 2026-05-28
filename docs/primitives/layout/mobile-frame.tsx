import { Boxes, ClipboardCheck, ScanLine } from "lucide-react";

import { MobileFrame } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <MobileFrame
      title="Order scan"
      subtitle="Main store"
      status="Online"
      navItems={[
        { label: "Scan", icon: ScanLine, active: true },
        { label: "Tasks", icon: ClipboardCheck },
        { label: "Orders", icon: Boxes },
      ]}
    >
      MobileFrame children
    </MobileFrame>
  );
}
