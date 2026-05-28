import { Archive, Home } from "lucide-react";

import { Menu } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Menu
      items={[
        {
          label: "Operations",
          items: [
            { id: "dashboard", label: "Dashboard", icon: Home, active: true },
            { id: "inbound", label: "Inbound", icon: Archive, badge: 18 },
          ],
        },
      ]}
    />
  );
}
