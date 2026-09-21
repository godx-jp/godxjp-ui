import { Bell, CreditCard, KeyRound, User } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { NavList } from "../nav-list";
import type { SidebarItemProp } from "../../../props/components/layout.prop";

/**
 * gh#815 — `NavList` used to map `items` straight to `SidebarItem`, so an item carrying `children`
 * TYPE-CHECKED, rendered as one flat row, and its children vanished with no error and no warning.
 * Silently wrong is the failure this repo spends the most effort preventing, and the component it
 * hit is the one whose canonical use — a grouped settings nav — is made entirely of groups.
 *
 * Every assertion below FAILS on the old implementation: the child labels were simply absent.
 */
const SETTINGS: SidebarItemProp[] = [
  {
    id: "account",
    label: "アカウント",
    icon: User,
    children: [
      { id: "profile", label: "プロフィール" },
      { id: "organization", label: "組織情報" },
    ],
  },
  {
    id: "security",
    label: "セキュリティ",
    icon: KeyRound,
    children: [
      { id: "password", label: "パスワード" },
      { id: "two-factor", label: "二要素認証", badge: "未設定", badgeTone: "destructive" },
    ],
  },
  {
    id: "notifications",
    label: "通知",
    icon: Bell,
    children: [{ id: "mail", label: "メール通知" }],
  },
  { id: "billing", label: "請求", icon: CreditCard },
];

describe("NavList nested groups (gh#815)", () => {
  it("renders item.children instead of dropping them", () => {
    renderWithUi(<NavList label="設定" items={SETTINGS} activeId="password" />);

    // The group the route is in is open, so its children are in the document.
    expect(screen.getByText("パスワード")).toBeInTheDocument();
    expect(screen.getByText("二要素認証")).toBeInTheDocument();
    // A group is a TRIGGER, not a flat row that swallows its subtree.
    expect(screen.getByRole("button", { name: /セキュリティ/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("builds the whole grouped settings nav from ONE nav landmark", async () => {
    const user = userEvent.setup();
    renderWithUi(<NavList label="設定" items={SETTINGS} activeId="password" />);

    const nav = screen.getByRole("navigation", { name: "設定" });
    expect(screen.getAllByRole("navigation")).toHaveLength(1);

    // All four groups are reachable from that single landmark...
    for (const label of ["アカウント", "セキュリティ", "通知"]) {
      expect(within(nav).getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
    }
    // ...and 請求, which has no children, stays an ordinary leaf row.
    expect(within(nav).getByRole("button", { name: "請求" })).not.toHaveAttribute("aria-expanded");

    // ...and every child is reachable by opening its group, still inside the same landmark.
    await user.click(within(nav).getByRole("button", { name: /アカウント/ }));
    expect(within(nav).getByText("プロフィール")).toBeInTheDocument();
    expect(within(nav).getByText("組織情報")).toBeInTheDocument();
  });

  it("marks the active DESCENDANT, and its group, without marking a sibling group", () => {
    const { container } = renderWithUi(
      <NavList label="設定" items={SETTINGS} activeId="two-factor" />,
    );

    const active = container.querySelectorAll('[data-active="true"]');
    // The child row and its group trigger — nothing else.
    expect(active).toHaveLength(2);
    expect(screen.getByText("二要素認証").closest(".sb-nav-item")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByRole("button", { name: /アカウント/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("reports the activated CHILD id through onSelect", async () => {
    const user = userEvent.setup();
    const selected: string[] = [];
    renderWithUi(
      <NavList
        label="設定"
        items={SETTINGS}
        activeId="password"
        onSelect={(id) => selected.push(id)}
      />,
    );

    await user.click(screen.getByText("二要素認証"));
    expect(selected).toEqual(["two-factor"]);
  });

  it("accepts a row with no icon and keeps the alignment box (gh#815)", () => {
    const { container } = renderWithUi(
      <NavList
        label="混在"
        items={[
          { id: "with", label: "アイコンあり", icon: User },
          { id: "without", label: "アイコンなし" },
        ]}
      />,
    );

    const rows = container.querySelectorAll<HTMLElement>(".ui-nav-list > .sb-nav-item");
    expect(rows).toHaveLength(2);
    // Both rows still carry the `.sb-icon` box — that box is what keeps the labels in one column.
    for (const row of rows) expect(row.querySelector(".sb-icon")).not.toBeNull();
    expect(rows[0].querySelector(".sb-icon svg")).not.toBeNull();
    expect(rows[1].querySelector(".sb-icon svg")).toBeNull();
  });
});
