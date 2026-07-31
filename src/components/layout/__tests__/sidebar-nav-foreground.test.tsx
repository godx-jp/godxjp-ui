import { BookOpen, FileText, LayoutDashboard, Shield } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Sidebar } from "../sidebar";

/**
 * gh#228 — DOM half of the icon/label foreground contract. The colours themselves live in CSS
 * (guarded by src/styles/__tests__/sidebar-nav-foreground.test.ts); what the component MUST
 * guarantee is that the two style hooks actually exist on every row shape and state, so the tokens
 * reach the DOM: `.sb-nav-item` for the row/label token and a `.sb-icon` wrapper around the Lucide
 * SVG for the icon token. The reported "missing icons" were never a render failure — every row does
 * ship exactly one SVG — so this test also pins that invariant.
 */

const sections = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "docs", label: "Docs", icon: FileText, href: "/docs" },
      { id: "roles", label: "Roles", icon: Shield, disabled: true },
      {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        children: [{ id: "journal", label: "Journal", icon: FileText }],
      },
    ],
  },
];

function rows(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".sb-nav-item"));
}

describe("Sidebar row/icon style hooks (gh#228)", () => {
  it("every expanded row carries the row hook and exactly one icon-wrapped SVG", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="dashboard" />);
    const iconRows = rows(container).filter((row) => !row.classList.contains("sb-nav-item--sub"));
    expect(iconRows.length).toBe(4); // 3 leaves + 1 group trigger

    for (const row of iconRows) {
      const icon = row.querySelector(".sb-icon");
      expect(icon, `${row.textContent} has no .sb-icon`).not.toBeNull();
      // One SVG inside the icon wrapper — the wrapper is what the icon token paints.
      expect(icon!.querySelectorAll("svg").length).toBe(1);
      expect(icon!.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
      // The label lives in its own span and inherits the ROW token, not the icon token.
      expect(row.querySelector(".sb-label")).not.toBeNull();
    }
  });

  it("the active row keeps the icon hook under data-active", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="dashboard" />);
    const active = container.querySelector<HTMLElement>('.sb-nav-item[data-active="true"]')!;
    expect(active).not.toBeNull();
    expect(active.textContent).toContain("Dashboard");
    expect(active.querySelector(".sb-icon svg")).not.toBeNull();
  });

  it("a disabled row exposes aria-disabled=true and still owns an icon hook", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="dashboard" />);
    const disabled = container.querySelector<HTMLElement>('.sb-nav-item[aria-disabled="true"]')!;
    expect(disabled).not.toBeNull();
    expect(disabled.textContent).toContain("Roles");
    expect(disabled.querySelector(".sb-icon svg")).not.toBeNull();
  });

  it("an href row renders as an anchor that still carries both hooks", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="dashboard" />);
    const link = container.querySelector<HTMLAnchorElement>("a.sb-nav-item")!;
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.querySelector(".sb-icon svg")).not.toBeNull();
  });

  it("the group chevron stays OUTSIDE .sb-icon, so it reads the row colour not the icon knob", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="dashboard" />);
    const trigger = container.querySelector<HTMLElement>(".sb-nav-group-trigger")!;
    expect(trigger.querySelector(".sb-icon svg")).not.toBeNull();
    const chevron = trigger.querySelector(".sb-chevron")!;
    expect(chevron.closest(".sb-icon")).toBeNull();
  });

  it("sub rows are label-only — they read the row token, never the icon token", () => {
    const { container } = renderWithUi(<Sidebar sections={sections} activeId="journal" />);
    const sub = container.querySelector<HTMLElement>(".sb-nav-item--sub")!;
    expect(sub.textContent).toContain("Journal");
    expect(sub.querySelector(".sb-icon")).toBeNull();
    expect(sub.classList.contains("sb-nav-item")).toBe(true);
  });

  it("the collapsed rail is icon-only and keeps the icon hook on every row", () => {
    const { container } = renderWithUi(
      <Sidebar sections={sections} activeId="dashboard" collapsed />,
    );
    const collapsedRows = rows(container);
    expect(collapsedRows.length).toBe(4);
    for (const row of collapsedRows) {
      expect(row.querySelector(".sb-icon svg")).not.toBeNull();
      expect(row.querySelector(".sb-label")).toBeNull();
    }
    // Icon-only rows still have an accessible name (the label moves to aria-label + tooltip).
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
  });

  /**
   * `icon` is REQUIRED in SidebarItemProp, but API-driven / untyped nav data reaches the component
   * anyway — and `<Icon />` with `Icon === undefined` used to throw "Element type is invalid",
   * taking the whole shell down. The row must render instead, and it must keep canonical geometry:
   * the empty `.sb-icon` box (16px) stays, so the 10px gap and the label column don't collapse.
   */
  const iconLessSections = [
    {
      items: [
        { id: "plain", label: "Plain" },
        { id: "with-icon", label: "With icon", icon: LayoutDashboard },
        { id: "group", label: "Group", children: [{ id: "child", label: "Child" }] },
      ],
    },
  ] as unknown as Parameters<typeof Sidebar>[0]["sections"];

  it("an item WITHOUT an icon renders instead of crashing, and keeps the icon slot", () => {
    const { container } = renderWithUi(<Sidebar sections={iconLessSections} activeId="plain" />);
    const plain = container.querySelector<HTMLElement>('.sb-nav-item[data-active="true"]')!;
    expect(plain.textContent).toContain("Plain");
    // The box is still there (geometry preserved: 16px slot + 10px gap + 32px row) — just empty.
    const slot = plain.querySelector(".sb-icon")!;
    expect(slot).not.toBeNull();
    expect(slot.querySelector("svg")).toBeNull();
    // A sibling row WITH an icon keeps its SVG, so both labels stay in one column.
    const withIcon = Array.from(container.querySelectorAll<HTMLElement>(".sb-nav-item")).find(
      (row) => row.textContent?.includes("With icon"),
    )!;
    expect(withIcon.querySelector(".sb-icon svg")).not.toBeNull();
    // Group trigger + collapsed rail take the same path.
    const trigger = container.querySelector<HTMLElement>(".sb-nav-group-trigger")!;
    expect(trigger.querySelector(".sb-icon")).not.toBeNull();
    expect(trigger.querySelector(".sb-icon svg")).toBeNull();
  });

  it("the collapsed rail survives an icon-less item and still names it", () => {
    const { container } = renderWithUi(
      <Sidebar sections={iconLessSections} activeId="plain" collapsed />,
    );
    expect(container.querySelectorAll(".sb-nav-item").length).toBe(3);
    for (const row of rows(container)) {
      expect(row.querySelector(".sb-icon")).not.toBeNull();
    }
    expect(screen.getByRole("button", { name: "Plain" })).toBeInTheDocument();
  });

  it("a renderItem row gets the row hook via rowProps and can host its own .sb-icon", () => {
    const { container } = renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        renderItem={(item, rowProps) => (
          <a {...rowProps} href={`/${item.id}`}>
            <span className="sb-icon">
              <item.icon aria-hidden="true" />
            </span>
            <span className="sb-label">{item.label}</span>
          </a>
        )}
      />,
    );
    const custom = container.querySelector<HTMLAnchorElement>('a.sb-nav-item[href="/dashboard"]')!;
    expect(custom).not.toBeNull();
    expect(custom.getAttribute("data-active")).toBe("true");
    expect(custom.querySelector(".sb-icon svg")).not.toBeNull();
  });
});
