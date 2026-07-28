import { describe, expect, expectTypeOf, it } from "vitest";
import type { ComponentType, SVGProps } from "react";

import * as layout from "../index";
import type {
  AppShellProp,
  OrgSwitcherProp,
  SidebarItemProp,
  TopbarProp,
} from "../../../props/components/layout.prop";

describe("DXS shell public contract", () => {
  it("exports the complete shell surface from @godxjp/ui/layout", () => {
    expect(layout.AppShell).toBeTypeOf("function");
    expect(layout.Sidebar).toBeTypeOf("function");
    expect(layout.Topbar).toBeTypeOf("function");
    expect(layout.OrgSwitcher).toBeTypeOf("function");
  });

  it("keeps typed icons, badges, slots and mobile navigation in the public props", () => {
    type Icon = SidebarItemProp["icon"];
    type Badge = SidebarItemProp["badge"];
    type MobileNav = AppShellProp["mobileNav"];
    type TopbarActions = TopbarProp["end"];
    type Organizations = OrgSwitcherProp["organizations"];

    expectTypeOf<Icon>().toMatchTypeOf<ComponentType<SVGProps<SVGSVGElement>>>();
    expectTypeOf<Badge>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<MobileNav>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<TopbarActions>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<Organizations>().toMatchTypeOf<readonly unknown[]>();
  });
});
