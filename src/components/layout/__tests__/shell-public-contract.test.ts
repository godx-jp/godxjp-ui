import { describe, expect, expectTypeOf, it } from "vitest";
import type { ComponentType, SVGProps } from "react";

import * as layout from "../index";
import type {
  AppShellProp,
  MasterDetailProp,
  OrgSwitcherProp,
  PageContainerProp,
  SidebarItemProp,
  SidebarRenderItemProp,
  TopbarProp,
} from "../../../props/components/layout.prop";

describe("DXS shell public contract", () => {
  it("exports the complete shell surface from @godxjp/ui/layout", () => {
    expect(layout.AppShell).toBeTypeOf("function");
    expect(layout.Sidebar).toBeTypeOf("function");
    expect(layout.Topbar).toBeTypeOf("function");
    expect(layout.OrgSwitcher).toBeTypeOf("function");
    expect(layout.PageContainer).toBeTypeOf("function");
    expect(layout.MasterDetail).toBeTypeOf("function");
    expect(layout.AuthDivider).toBeTypeOf("function");
    expect(layout.AuthFooter).toBeTypeOf("function");
    expect(layout.AuthIdentity).toBeTypeOf("function");
    expect(layout.AuthStack).toBeTypeOf("function");
  });

  it("keeps typed icons, badges, slots and mobile navigation in the public props", () => {
    type Icon = SidebarItemProp["icon"];
    type Badge = SidebarItemProp["badge"];
    type MobileNav = AppShellProp["mobileNav"];
    type TopbarActions = TopbarProp["end"];
    type Organizations = OrgSwitcherProp["organizations"];
    type Master = MasterDetailProp["master"];
    type HeaderExtra = PageContainerProp["extra"];
    type RenderItem = SidebarRenderItemProp;

    expectTypeOf<Icon>().toMatchTypeOf<ComponentType<SVGProps<SVGSVGElement>>>();
    expectTypeOf<Badge>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<MobileNav>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<TopbarActions>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<Organizations>().toMatchTypeOf<readonly unknown[]>();
    expectTypeOf<Master>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<HeaderExtra>().toMatchTypeOf<React.ReactNode>();
    expectTypeOf<RenderItem["className"]>().toEqualTypeOf<string>();
    expectTypeOf<RenderItem["aria-current"]>().toEqualTypeOf<"page" | undefined>();
  });
});
