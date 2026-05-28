import { Archive, Home } from "lucide-react";

import { Sidebar } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Sidebar
      activeId="dashboard"
      sections={[
        {
          label: "Operations",
          items: [
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "orders", label: "Orders", icon: Archive, badge: 18 },
          ],
        },
      ]}
      product={{ name: "Acme Inc", role: "Admin Console", color: "hsl(var(--attention))" }}
    />
  );
}
