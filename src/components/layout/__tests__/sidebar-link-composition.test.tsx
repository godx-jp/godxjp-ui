import { BookOpen, FileText, LayoutDashboard, Receipt, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { createSidebarLink, Sidebar, SidebarItem, SidebarSection } from "../sidebar";

/**
 * gh#213 — the sidebar ROW-COMPOSITION contract.
 *
 * The reported production regression: a consumer `renderItem` callback replaced the library row
 * composition, so every sidebar icon disappeared. The root cause was the direction of the contract —
 * `renderItem` handed the consumer a className + active state and left the row CONTENT (icon, label,
 * badge) to them, so a perfectly reasonable `<Link>{item.label}</Link>` legitimately dropped the icon.
 *
 * The fix inverts it: the consumer supplies ONLY the link element (`linkComponent` on Sidebar, or
 * `asChild` on SidebarItem) and the LIBRARY composes the row. These tests pin that inversion on all
 * four row shapes — leaf, `href` anchor, group (trigger + children) and the collapsed rail.
 *
 * `react-router-dom` is already a peer/dev dependency of this package, so the tests drive a REAL
 * router `Link` through the real adapter rather than a stand-in.
 */

/** The consumer's entire nav integration: one line, no row markup anywhere. */
const RouterLink = createSidebarLink(Link, "to");

const sections = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "invoices", label: "Invoices", icon: Receipt, href: "/invoices", badge: "3" },
      { id: "roles", label: "Roles", icon: Shield, href: "/roles", disabled: true },
      {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        badge: "2",
        children: [{ id: "journal", label: "Journal", icon: FileText, href: "/journal" }],
      },
    ],
  },
];

function row(container: HTMLElement, text: string): HTMLElement {
  const found = Array.from(container.querySelectorAll<HTMLElement>(".sb-nav-item")).find((node) =>
    node.textContent?.includes(text),
  );
  if (!found) throw new Error(`no .sb-nav-item containing "${text}"`);
  return found;
}

describe("Sidebar linkComponent — the library composes the row (gh#213)", () => {
  it("THE REGRESSION: a link-only consumer keeps icon, label, badge and active state", () => {
    const { container } = renderWithUi(
      <Sidebar sections={sections} activeId="invoices" linkComponent={RouterLink} />,
    );

    // Every leaf is now the consumer's router <a> — and it is the SOLE interactive element.
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(dashboard).toHaveClass("sb-nav-item");
    expect(dashboard.querySelector("button")).toBeNull();

    // Icon: the library rendered it, not the consumer. This is the exact assertion the regression
    // would have failed — the consumer never wrote a `.sb-icon` anywhere.
    expect(dashboard.querySelector(".sb-icon svg")).not.toBeNull();
    expect(dashboard.querySelector(".sb-icon svg")!.getAttribute("aria-hidden")).toBe("true");
    // Label.
    expect(dashboard.querySelector(".sb-label")!.textContent).toBe("Dashboard");
    // Badge.
    const invoices = screen.getByRole("link", { name: /Invoices/ });
    expect(invoices.querySelector(".sb-badge")!.textContent).toBe("3");
    expect(invoices.querySelector(".sb-icon svg")).not.toBeNull();
    // Active state — both the style hook and the WAI-ARIA current-page semantics.
    expect(invoices).toHaveAttribute("data-active", "true");
    expect(invoices).toHaveAttribute("aria-current", "page");
    expect(dashboard).not.toHaveAttribute("aria-current");

    // No row anywhere lost its icon.
    for (const node of container.querySelectorAll<HTMLElement>(
      ".sb-nav-item:not(.sb-nav-item--sub)",
    )) {
      expect(
        node.querySelector(".sb-icon"),
        `${node.textContent} lost its icon slot`,
      ).not.toBeNull();
    }
  });

  it("reports selection through onSelect while the router link owns navigation", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        onSelect={onSelect}
        linkComponent={RouterLink}
      />,
    );
    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(onSelect).toHaveBeenCalledWith("dashboard");
  });

  it("a disabled row renders an inert anchor — no destination, aria-disabled, icon intact", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        onSelect={onSelect}
        linkComponent={RouterLink}
      />,
    );
    const roles = row(container, "Roles");
    expect(roles.tagName).toBe("A");
    expect(roles).not.toHaveAttribute("href");
    expect(roles).toHaveAttribute("aria-disabled", "true");
    // An <a> without href has NO implicit role, so the fallback declares one — otherwise the
    // collapsed rail's aria-label would be a prohibited attribute and the row would go unnamed.
    expect(roles).toHaveAttribute("role", "link");
    expect(roles.querySelector(".sb-icon svg")).not.toBeNull();
    await user.click(roles);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("a group trigger stays an APG disclosure button, and its children take the link", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Sidebar sections={sections} activeId="journal" linkComponent={RouterLink} />,
    );
    // The trigger owns aria-expanded, so it must remain a <button> — a link wrapping a chevron
    // button would be a nested interactive element (gh#165).
    const trigger = screen.getByRole("button", { name: /Ledger/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    // Its ROW composition is library-owned like every other shape: icon slot + label + badge,
    // with the chevron OUTSIDE .sb-icon so it reads the row colour (gh#228).
    expect(trigger.querySelector(".sb-icon svg")).not.toBeNull();
    expect(trigger.querySelector(".sb-badge")!.textContent).toBe("2");
    expect(trigger.querySelector(".sb-chevron")!.closest(".sb-icon")).toBeNull();

    // The child leaf IS the router link, not a button (renderItem never reached these before).
    const journal = screen.getByRole("link", { name: "Journal" });
    expect(journal).toHaveAttribute("href", "/journal");
    expect(journal).toHaveClass("sb-nav-item--sub");
    expect(journal).toHaveAttribute("aria-current", "page");

    // Keyboard: the disclosure still toggles with the keyboard.
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(".sb-nav-item--sub")).toBeNull();
  });

  it("the collapsed rail keeps the link, the icon and the accessible name", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        collapsed
        onSelect={onSelect}
        linkComponent={RouterLink}
      />,
    );
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(dashboard).toHaveClass("sb-nav-item");
    // Icon-only rail: the library still renders the icon, and the label moves to aria-label so the
    // rail is never a row of unnamed glyphs.
    expect(dashboard.querySelector(".sb-icon svg")).not.toBeNull();
    expect(dashboard.querySelector(".sb-label")).toBeNull();
    expect(dashboard).toHaveAttribute("aria-label", "Dashboard");
    expect(dashboard).toHaveAttribute("data-active", "true");
    expect(dashboard).toHaveAttribute("aria-current", "page");

    // Every collapsed row — links and the group's popover trigger alike — keeps its icon slot.
    for (const node of container.querySelectorAll<HTMLElement>(".sb-nav-item")) {
      expect(node.querySelector(".sb-icon")).not.toBeNull();
    }

    // The group's portaled flyout entries are leaves, so they become links too.
    await user.click(screen.getByRole("button", { name: "Ledger" }));
    const menu = await screen.findByRole("menu");
    const journal = within(menu).getByRole("menuitem", { name: "Journal" });
    expect(journal.tagName).toBe("A");
    expect(journal).toHaveAttribute("href", "/journal");
  });

  it("rows without an href keep the button + onSelect shape (a link needs a destination)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Sidebar
        sections={[{ items: [{ id: "spa", label: "SPA row", icon: LayoutDashboard }] }]}
        activeId="spa"
        onSelect={onSelect}
        linkComponent={RouterLink}
      />,
    );
    const button = screen.getByRole("button", { name: "SPA row" });
    expect(button.querySelector(".sb-icon svg")).not.toBeNull();
    await user.click(button);
    expect(onSelect).toHaveBeenCalledWith("spa");
  });
});

describe("SidebarItem asChild — element swap with library-composed children (gh#213)", () => {
  it("injects icon, label and badge into the consumer's element", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Sidebar activeId="invoices" onSelect={onSelect}>
        <SidebarSection label="Operations">
          <SidebarItem
            item={{ id: "invoices", label: "Invoices", icon: Receipt, badge: "3" }}
            active
            onActivate={onSelect}
            asChild
          >
            {/* The consumer writes NO row markup — just the element. */}
            <Link to="/invoices" />
          </SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: /Invoices/ });
    expect(link).toHaveAttribute("href", "/invoices");
    expect(link).toHaveClass("sb-nav-item");
    expect(link).toHaveAttribute("data-active", "true");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.querySelector(".sb-icon svg")).not.toBeNull();
    expect(link.querySelector(".sb-label")!.textContent).toBe("Invoices");
    expect(link.querySelector(".sb-badge")!.textContent).toBe("3");
    expect(link.querySelector("button")).toBeNull();
    await user.click(link);
    expect(onSelect).toHaveBeenCalledWith("invoices");
  });
});

describe("Sidebar renderItem — deprecated, still supported (gh#213 back-compat)", () => {
  it("keeps the legacy consumer-authored row working unchanged", () => {
    renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        renderItem={(item, rowProps) => (
          <a {...rowProps} href={`/legacy/${item.id}`}>
            Legacy {item.label}
          </a>
        )}
      />,
    );
    const link = screen.getByRole("link", { name: "Legacy Dashboard" });
    expect(link).toHaveClass("sb-nav-item");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("now hands the composed row content to rowProps.children, so spreading it restores the icon", () => {
    renderWithUi(
      <Sidebar
        sections={sections}
        activeId="invoices"
        renderItem={(item, rowProps) => <a {...rowProps} href={`/legacy/${item.id}`} />}
      />,
    );
    const link = screen.getByRole("link", { name: /Invoices/ });
    expect(link.querySelector(".sb-icon svg")).not.toBeNull();
    expect(link.querySelector(".sb-label")!.textContent).toBe("Invoices");
    expect(link.querySelector(".sb-badge")!.textContent).toBe("3");
  });

  it("renderItem still wins over linkComponent, so an upgrade is never a surprise", () => {
    renderWithUi(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        linkComponent={RouterLink}
        renderItem={(item, rowProps) => (
          <a {...rowProps} href={`/legacy/${item.id}`}>
            Legacy {item.label}
          </a>
        )}
      />,
    );
    expect(screen.getByRole("link", { name: "Legacy Dashboard" })).toHaveAttribute(
      "href",
      "/legacy/dashboard",
    );
  });
});
