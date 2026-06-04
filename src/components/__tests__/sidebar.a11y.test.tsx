import { describe, it } from "vitest";
import { Home, Settings } from "lucide-react";
import { Sidebar } from "../layout/sidebar";
import type { SidebarSectionProp } from "../../props/components/layout.prop";
import { expectNoA11yViolations } from "@/test/a11y";

// The sidebar is the primary navigation landmark; its nav rows must be labeled
// and the active item conveyed so assistive tech can orient the user.
const sections: SidebarSectionProp[] = [
  {
    label: "Main",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

describe("Sidebar a11y", () => {
  it("has no axe violations with a section of nav items", async () => {
    await expectNoA11yViolations(
      <Sidebar activeId="home" sections={sections} onSelect={() => {}} />,
    );
  });
});
