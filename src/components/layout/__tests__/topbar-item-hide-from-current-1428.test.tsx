/**
 * gh#1428 — `TopbarItem hideFrom` and the current-page state of a navigation cell.
 *
 * Before: only `hideBelow` existed, so a phone-only cell (the trigger of a navigation Sheet whose
 * links are inline from `md` up) could not be dropped on a wide bar without a wrapper that
 * collapses the slot (gh#883); and a link cell with `aria-current="page"` painted exactly like its
 * neighbours, so a public site's header could not show where the reader is.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Menu } from "lucide-react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TopbarItem } from "../topbar-item";

const read = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const layoutCss = read("src/styles/layout.css");
const shellCss = read("src/styles/shell-layout.css");
const shellTokens = read("src/tokens/components/shell.css");

/** The body of every `@media (width >= …)` block, keyed by its threshold. */
function minWidthBlocks(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /@media \(width >= (\d+rem)\) \{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (depth > 0 && i < css.length) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    out[m[1]] = (out[m[1]] ?? "") + css.slice(re.lastIndex, i);
  }
  return out;
}

describe("TopbarItem hideFrom (gh#1428)", () => {
  it("stamps data-hide-from on the cell, as a button and under asChild", () => {
    render(
      <>
        <TopbarItem hideFrom="md" icon={<Menu />} aria-label="Menu" />
        <TopbarItem asChild hideFrom="lg">
          <a href="/settings">Settings</a>
        </TopbarItem>
      </>,
    );
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("data-hide-from", "md");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("data-hide-from", "lg");
  });

  it("emits no attribute when hideFrom is not set", () => {
    render(<TopbarItem aria-label="Plain" />);
    expect(screen.getByRole("button", { name: "Plain" })).not.toHaveAttribute("data-hide-from");
  });

  it("drops the cell from each canonical step upwards", () => {
    const blocks = minWidthBlocks(layoutCss);
    const steps: Record<string, string> = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem" };
    for (const [step, width] of Object.entries(steps)) {
      const block = blocks[width] ?? "";
      expect(block, `@media (width >= ${width})`).toMatch(
        new RegExp(`\\.ui-topbar-item\\[data-hide-from="${step}"\\][^{]*\\{[^}]*display:\\s*none`),
      );
    }
  });
});

describe("TopbarItem current page (gh#1428)", () => {
  it("paints aria-current=page with ink and an inset indicator from tokens", () => {
    const rule = shellCss.match(/\.ui-topbar-item\[aria-current="page"\]\s*\{([^}]*)\}/);
    expect(rule, "a rule for the current cell").not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(
      /color:\s*hsl\(var\(--topbar-item-current-color,\s*var\(--foreground\)\)\)/,
    );
    expect(body).toMatch(
      /box-shadow:\s*inset[\s\S]*--topbar-item-current-indicator-size[\s\S]*--topbar-item-current-indicator-color,\s*var\(--primary\)/,
    );
  });

  it("declares the three knobs in the shell token tier", () => {
    expect(shellTokens).toMatch(/--topbar-item-current-color:\s*initial;/);
    expect(shellTokens).toMatch(/--topbar-item-current-indicator-color:\s*initial;/);
    expect(shellTokens).toMatch(/--topbar-item-current-indicator-size:\s*var\(--stroke-md\);/);
  });
});
