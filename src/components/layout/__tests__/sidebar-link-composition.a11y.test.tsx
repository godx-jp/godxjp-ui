import { BookOpen, FileText, LayoutDashboard, Receipt, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { describe, it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";

import { createSidebarLink, Sidebar } from "../sidebar";

/**
 * gh#213 — the router-link row contract must not cost accessibility. The library composes the row,
 * so it also owns the parts axe checks: the named `<nav>` landmark, `aria-current="page"` on exactly
 * the active row, `aria-hidden` decorative glyphs, `aria-disabled` instead of a dead link, and an
 * accessible name on every icon-only collapsed rail row.
 */

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

describe("Sidebar router-link rows — accessibility (gh#213)", () => {
  it("has no violations with linkComponent rows, an open group and a badge", async () => {
    await expectNoA11yViolations(
      <Sidebar
        sections={sections}
        activeId="journal"
        linkComponent={RouterLink}
        aria-label="Primary navigation"
      />,
    );
  });

  it("has no violations on the icon-only collapsed rail", async () => {
    await expectNoA11yViolations(
      <Sidebar
        sections={sections}
        activeId="dashboard"
        collapsed
        linkComponent={RouterLink}
        aria-label="Collapsed primary navigation"
      />,
    );
  });
});
