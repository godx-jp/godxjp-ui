import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TopbarItem } from "../topbar-item";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const focusRing = readFileSync(resolve(process.cwd(), "src/styles/focus-ring.css"), "utf8");

function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(stripped)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

describe("TopbarItem", () => {
  it("renders a non-submitting button carrying the bar-cell shape", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TopbarItem aria-label="Account" onClick={onClick} />);

    const item = screen.getByRole("button", { name: "Account" });
    expect(item).toHaveClass("ui-topbar-item");
    expect(item).toHaveAttribute("data-slot", "topbar-item");
    // A bare <button> inside a form defaults to submit; a bar trigger must never post the page.
    expect(item).toHaveAttribute("type", "button");

    await user.click(item);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("puts the shape on the child under asChild, and hands it no type it cannot take", () => {
    render(
      <TopbarItem asChild>
        <a href="/account">Account</a>
      </TopbarItem>,
    );

    const link = screen.getByRole("link", { name: "Account" });
    expect(link).toHaveClass("ui-topbar-item");
    expect(link).not.toHaveAttribute("type");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps a caller's className alongside the shape", () => {
    render(<TopbarItem aria-label="Account" className="ui-scale-fixed" />);
    const item = screen.getByRole("button", { name: "Account" });
    expect(item).toHaveClass("ui-topbar-item");
    expect(item).toHaveClass("ui-scale-fixed");
  });

  it("fills the bar through a stretch chain, because the bar's height is not its to name", () => {
    // The bar is a grid row in AppShell and a token-height box standalone, so the cell cannot name
    // a length; it stretches, and every wrapper between it and the bar stretches too. Break any
    // link and the cell silently falls back to content height — the floating-pill look.
    expect(declarationsFor(shellStyles, ".ui-topbar-item")).toMatch(/align-self:\s*stretch;/);
    for (const selector of [
      ".ui-topbar",
      ".ui-topbar-start",
      ".ui-topbar-center",
      ".ui-topbar-end",
    ]) {
      expect(declarationsFor(shellStyles, selector)).toMatch(/align-self:\s*stretch;/);
    }
    // …and no height knob exists to tempt anyone into naming one.
    expect(shellTokens).not.toContain("--topbar-item-height");
  });

  it("hosts the focus mark inset, and authors none of its geometry", () => {
    render(<TopbarItem aria-label="Account" />);
    // The ONE focus source — styles/focus-ring.css already lists `.ui-focus-ring` in its mark rule.
    expect(screen.getByRole("button", { name: "Account" })).toHaveClass("ui-focus-ring");
    expect(focusRing).toContain(".ui-focus-ring,");

    const cell = declarationsFor(shellStyles, ".ui-topbar-item");
    // WHERE the mark sits is the cell's to say; what it is made of is not.
    expect(cell).toMatch(/--focus-ring-offset:\s*var\(--topbar-item-focus-ring-offset\);/);
    expect(cell).not.toMatch(/outline:/);
    expect(cell).not.toMatch(/box-shadow:/);
    // Inset by the mark's OWN width, so the two cannot drift and the `--focus-outline` switch
    // zeroes the offset with the width.
    expect(shellTokens).toContain(
      "--topbar-item-focus-ring-offset: calc(-1 * var(--focus-ring-width));",
    );
  });

  it("takes hover, active and open from the bar's surface tokens — no literals", () => {
    expect(declarationsFor(shellStyles, ".ui-topbar-item:hover")).toMatch(
      /background:\s*hsl\(var\(--topbar-item-hover-background\)\);/,
    );
    // The pointer has left the cell while its menu is open, so :hover alone loses the anchor.
    expect(declarationsFor(shellStyles, '.ui-topbar-item[data-state="open"]')).toMatch(
      /background:\s*hsl\(var\(--topbar-item-active-background\)\);/,
    );
    const cell = declarationsFor(shellStyles, ".ui-topbar-item");
    expect(cell).not.toMatch(/\d+(?:\.\d+)?(?:px|rem|em)/);
  });
});
