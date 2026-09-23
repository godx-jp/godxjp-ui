import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

const dialogStyles = read("src/styles/dialog-layout.css");
const sheetSource = read("src/components/feedback/sheet.tsx");

/** The declarations of the LAST rule whose selector list contains `selector` exactly. */
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

/**
 * A PORTALLED SURFACE MUST DECLARE ITS OWN INK (gh#877).
 *
 * Both of these paint `--background` and, before gh#877, took their text colour from whatever they
 * inherited. Every overlay portals to `document.body`, so on a page-level theme that inheritance
 * happens to be `<body>` already carrying the matching `--foreground` and the omission is
 * invisible. It stops being invisible the moment a REGION is themed and `ThemeScope` makes the
 * overlay follow it: the panel went dark while the ink stayed the light-mode ink, measured in
 * Chromium at rgb(25,24,21) behind rgb(36,35,30) — 1.03:1, WCAG 2.2 SC 1.4.3 failed at every size.
 *
 * `.ui-popover-content` and `.ui-tooltip-content` already state their own pair, which is why the
 * Popover and the Select listbox were correct in the same measurement. These two were the
 * outliers.
 */
describe("portalled overlay surfaces declare the ink that pairs with their background", () => {
  it("[data-slot=dialog-content] declares `color` beside `background-color`", () => {
    const declarations = declarationsFor(dialogStyles, '[data-slot="dialog-content"]');

    expect(declarations).toContain("background-color: hsl(var(--background))");
    expect(declarations).toContain("color: hsl(var(--foreground))");
  });

  it("the Sheet panel pairs `text-foreground` with `bg-background`", () => {
    const panelClass = /"ui-sheet-panel[^"]*"/.exec(sheetSource)?.[0] ?? "";

    expect(panelClass).toContain("bg-background");
    expect(panelClass).toContain("text-foreground");
  });

  it("the two surfaces that already paired them are left alone", () => {
    expect(declarationsFor(dialogStyles, ".ui-popover-content")).toContain(
      "color: var(--popover-surface-foreground, hsl(var(--popover-foreground)))",
    );
    expect(declarationsFor(dialogStyles, ".ui-tooltip-content")).toContain(
      "color: var(--tooltip-foreground, hsl(var(--popover-foreground)))",
    );
  });
});
