import { Bot, Server, SlidersHorizontal, Users } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { NavList } from "../nav-list";
import type { NavListSectionProp } from "../../../props/components/layout.prop";

/**
 * GDX-1230 — a settings column needs a FIXED heading per group (一般 / 作業) and, inside one, rows
 * that FOLD (マシン, エージェント). `children` gave only the folding kind, so the column took one
 * `NavList` per heading in `SidebarSection`: N `<nav>` landmarks for one navigation.
 */
const SECTIONS: NavListSectionProp[] = [
  {
    label: "一般",
    items: [
      { id: "general", label: "基本", icon: SlidersHorizontal },
      { id: "members", label: "メンバー", icon: Users },
    ],
  },
  {
    label: "作業",
    items: [
      {
        id: "group:machines",
        label: "マシン",
        icon: Server,
        children: [
          { id: "machines", label: "サーバーとコンピュート" },
          { id: "machines/pools", label: "プール" },
        ],
      },
      {
        id: "group:agents",
        label: "エージェント",
        icon: Bot,
        children: [{ id: "agents", label: "チームのエージェント" }],
      },
    ],
  },
];

describe("NavList sections (GDX-1230)", () => {
  it("draws every section's heading inside ONE nav landmark, as a named group that is not a toggle", () => {
    renderWithUi(<NavList label="設定" sections={SECTIONS} activeId="members" />);

    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    const nav = screen.getByRole("navigation", { name: "設定" });
    const general = within(nav).getByRole("group", { name: "一般" });
    expect(within(general).getByRole("button", { name: "メンバー" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // The heading is text, not a button: it never folds.
    expect(within(nav).queryByRole("button", { name: /^一般$/ })).toBeNull();
    expect(within(nav).getByRole("group", { name: "作業" })).toBeInTheDocument();
  });

  it("folds a group inside a section and opens the one the route is in", async () => {
    const user = userEvent.setup();
    renderWithUi(<NavList label="設定" sections={SECTIONS} activeId="machines/pools" />);

    const work = screen.getByRole("group", { name: "作業" });
    expect(within(work).getByRole("button", { name: /マシン/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(within(work).getByText("プール")).toBeInTheDocument();
    const agents = within(work).getByRole("button", { name: /エージェント/ });
    expect(agents).toHaveAttribute("aria-expanded", "false");
    await user.click(agents);
    expect(within(work).getByText("チームのエージェント")).toBeInTheDocument();
  });

  it("puts loose items before the sections", () => {
    renderWithUi(
      <NavList label="設定" items={[{ id: "home", label: "ホーム" }]} sections={SECTIONS} />,
    );
    const nav = screen.getByRole("navigation", { name: "設定" });
    const first = nav.firstElementChild!;
    expect(within(first as HTMLElement).getByText("ホーム")).toBeInTheDocument();
  });
});
