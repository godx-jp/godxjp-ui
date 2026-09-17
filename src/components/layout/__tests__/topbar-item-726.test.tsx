/**
 * gh#726 — `TopbarItem icon` under `asChild`, and collapsing a cell by breakpoint.
 *
 * Before: the `icon` slot rendered only under `!asChild`, so a cell that IS a link lost its glyph,
 * and nothing could drop the glyph or the label at a breakpoint — which sent a consumer straight
 * back to hand-wrapping `<Flex hideFrom="sm"><Icon … /></Flex>`, the shape gh#712 removed.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Bell, Target } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "../../general/button";
import { TopbarItem } from "../topbar-item";

const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

describe("TopbarItem asChild keeps its icon (gh#726)", () => {
  it("renders the icon slot inside the link, ahead of the link's own label", () => {
    render(
      <TopbarItem asChild icon={<Target />}>
        <a href="/goals">Goals</a>
      </TopbarItem>,
    );
    const link = screen.getByRole("link", { name: "Goals" });
    const slot = link.firstElementChild;
    expect(slot).toHaveAttribute("data-slot", "topbar-item-icon");
    expect(slot).toHaveClass("ui-topbar-item-icon");
    expect(slot?.querySelector("svg")).not.toBeNull();
    expect(link.lastChild?.textContent).toBe("Goals");
  });

  it("keeps the child element as the root, with merged className, data attributes and handlers", () => {
    const onCell = vi.fn();
    const onLink = vi.fn();
    const { container } = render(
      <TopbarItem
        asChild
        icon={<Target />}
        hideBelow="md"
        className="cell-extra"
        data-testid="cell"
        onClick={onCell}
      >
        <a href="/goals" className="link-own" data-origin="link" onClick={onLink}>
          Goals
        </a>
      </TopbarItem>,
    );
    const link = screen.getByRole("link", { name: "Goals" });
    expect(container.firstElementChild).toBe(link);
    expect(link).toHaveAttribute("href", "/goals");
    expect(link).toHaveAttribute("data-slot", "topbar-item");
    expect(link).toHaveAttribute("data-hide-below", "md");
    expect(link).toHaveAttribute("data-testid", "cell");
    expect(link).toHaveAttribute("data-origin", "link");
    expect(link).toHaveClass("ui-topbar-item", "ui-focus-ring", "cell-extra", "link-own");
    expect(link).not.toHaveAttribute("type");
    link.click();
    expect(onCell).toHaveBeenCalledOnce();
    expect(onLink).toHaveBeenCalledOnce();
  });

  it("leaves an asChild child untouched when no icon or label breakpoint is set", () => {
    render(
      <TopbarItem asChild>
        <a href="/goals">Goals</a>
      </TopbarItem>,
    );
    expect(screen.getByRole("link", { name: "Goals" }).innerHTML).toBe("Goals");
  });

  it("fails on a non-element child exactly where Button asChild does, not in its own way", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let buttonError: unknown;
    let cellError: unknown;
    try {
      render(<Button asChild>text</Button>);
    } catch (error) {
      buttonError = error;
    }
    try {
      render(
        <TopbarItem asChild icon={<Target />}>
          text
        </TopbarItem>,
      );
    } catch (error) {
      cellError = error;
    }
    spy.mockRestore();
    expect(buttonError).toBeInstanceOf(Error);
    expect((cellError as Error).message).toBe((buttonError as Error).message);
  });
});

describe("TopbarItem breakpoint collapse (gh#726)", () => {
  it("emits data-hide-from on the icon slot only", () => {
    const { container } = render(
      <TopbarItem icon={<Target />} iconHideFrom="sm">
        Goals
      </TopbarItem>,
    );
    const cell = screen.getByRole("button", { name: "Goals" });
    expect(container.querySelector('[data-slot="topbar-item-icon"]')).toHaveAttribute(
      "data-hide-from",
      "sm",
    );
    expect(cell).not.toHaveAttribute("data-hide-from");
    // No label box without labelHideBelow — the label stays a bare text node.
    expect(container.querySelector('[data-slot="topbar-item-label"]')).toBeNull();
  });

  it("wraps the label in a box carrying data-hide-below, and keeps it as the accessible name", () => {
    const { container } = render(
      <TopbarItem icon={<Target />} labelHideBelow="sm">
        Goals
      </TopbarItem>,
    );
    const label = container.querySelector('[data-slot="topbar-item-label"]');
    expect(label).toHaveClass("ui-topbar-item-label");
    expect(label).toHaveAttribute("data-hide-below", "sm");
    expect(label).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("button", { name: "Goals" })).toContainElement(label as HTMLElement);
  });

  it("collapses an asChild link the same way, naming the link from its own children", () => {
    const { container } = render(
      <TopbarItem asChild icon={<Target />} iconHideFrom="sm" labelHideBelow="sm">
        <a href="/goals">Goals</a>
      </TopbarItem>,
    );
    const link = screen.getByRole("link", { name: "Goals" });
    expect(link.children).toHaveLength(2);
    expect(link.children[0]).toHaveAttribute("data-hide-from", "sm");
    expect(link.children[1]).toBe(container.querySelector('[data-slot="topbar-item-label"]'));
    expect(link.children[1]).toHaveAttribute("data-hide-below", "sm");
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "%s: hides the icon from the step and VISUALLY hides the label below it (never display:none)",
    (step) => {
      const min = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem" }[step];
      const from = new RegExp(
        `@media \\(width >= ${min}\\) \\{[^}]*\\.ui-topbar-item-icon\\[data-hide-from="${step}"\\]\\s*\\{\\s*display: none;`,
      );
      expect(layoutCss).toMatch(from);
      const below = new RegExp(
        `@media \\(width < ${min}\\) \\{\\s*\\.ui-topbar-item-label\\[data-hide-below="${step}"\\]\\s*\\{([^}]*)\\}`,
      );
      const body = below.exec(layoutCss)?.[1] ?? "";
      expect(body).toMatch(/clip-path: inset\(50%\);/);
      expect(body).toMatch(/position: absolute;/);
      expect(body).not.toMatch(/display:\s*none|visibility:\s*hidden/);
    },
  );
});

describe("TopbarItem non-asChild markup is unchanged by gh#726", () => {
  it("renders byte-for-byte the pre-gh#726 markup", () => {
    const { container } = render(
      <>
        <TopbarItem icon={<Target />}>Goals</TopbarItem>
        <TopbarItem aria-label="Notifications" icon={<Bell />} badge={3} hideBelow="sm" />
        <TopbarItem>Plain</TopbarItem>
      </>,
    );
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button"><span data-slot="topbar-item-icon" class="ui-topbar-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>Goals</button><button data-slot="topbar-item" data-hide-below="sm" class="ui-topbar-item ui-focus-ring" type="button" aria-label="Notifications"><span data-slot="topbar-item-icon" class="ui-topbar-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell" aria-hidden="true"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg></span><span data-slot="topbar-item-badge" class="ui-topbar-item-badge">3</span></button><button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button">Plain</button>"`,
    );
  });
});
