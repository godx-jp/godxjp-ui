import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderWithUi, screen } from "@/test/render";
import { AppShell } from "../app-shell";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

/** Declarations of every rule whose selector list contains `selector`, top-level commas only. */
function declarationsFor(selector: string): string {
  const stripped = shellStyles.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  for (const match of stripped.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const list: string[] = [];
    let depth = 0;
    let current = "";
    for (const char of match[1]) {
      if (char === "(" || char === "[") depth += 1;
      else if (char === ")" || char === "]") depth -= 1;
      if (char === "," && depth === 0) {
        list.push(current.trim().replace(/\s+/g, " "));
        current = "";
        continue;
      }
      current += char;
    }
    list.push(current.trim().replace(/\s+/g, " "));
    if (list.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n").replace(/\s+/g, " ");
}

const POSITIONS = ["start", "end", "top", "bottom"] as const;

describe("navRailPosition", () => {
  it("publishes the edge, and only when a rail is actually passed", () => {
    for (const position of POSITIONS) {
      const { unmount } = renderWithUi(
        <AppShell
          sidebar={<nav aria-label="主">ナビ</nav>}
          navRail={<nav aria-label="組織">レール</nav>}
          navRailPosition={position}
        >
          <p>本文</p>
        </AppShell>,
      );
      expect(document.querySelector(".app-root")).toHaveAttribute(
        "data-nav-rail-position",
        position,
      );
      unmount();
    }

    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    expect(document.querySelector(".app-root")).not.toHaveAttribute("data-nav-rail-position");
  });

  it('defaults to "start", so the shipped three-column shape is unchanged', () => {
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>} navRail={<nav aria-label="組織">レール</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    expect(document.querySelector(".app-root")).toHaveAttribute("data-nav-rail-position", "start");
  });

  it("gives every position a grid map, at both topbar spans — an unnamed one falls back to one column", () => {
    for (const position of POSITIONS) {
      const base = declarationsFor(`.app-root[data-nav-rail][data-nav-rail-position="${position}"]`);
      const full = declarationsFor(
        `.app-root[data-nav-rail][data-nav-rail-position="${position}"][data-topbar-span="full"]`,
      );
      expect(base, `${position} base map`).toMatch(/grid-template-areas:/);
      expect(full, `${position} full-span map`).toMatch(/grid-template-areas:/);
      expect(base).toMatch(/navrail/);
      expect(full).toMatch(/navrail/);
    }
  });

  it("sizes a COLUMN rail by its width token and a STRIP rail by its height token", () => {
    for (const position of ["start", "end"] as const) {
      expect(
        declarationsFor(`.app-root[data-nav-rail][data-nav-rail-position="${position}"]`),
      ).toMatch(/grid-template-columns:[^;]*--app-shell-nav-rail-width/);
    }
    for (const position of ["top", "bottom"] as const) {
      const rule = declarationsFor(`.app-root[data-nav-rail][data-nav-rail-position="${position}"]`);
      expect(rule).toMatch(/grid-template-rows:[^;]*--app-shell-nav-rail-height/);
      // A strip must NOT be a column: a width token here would put it back in the column track.
      expect(rule).not.toMatch(/grid-template-columns:[^;]*--app-shell-nav-rail-width/);
    }
  });

  it("turns the strip positions along the inline axis and moves their border with them", () => {
    const strip = declarationsFor(
      '.app-root:is([data-nav-rail-position="top"], [data-nav-rail-position="bottom"]) > .app-nav-rail',
    );
    expect(strip).toMatch(/flex-direction: row;/);
    expect(strip).toMatch(/border-inline-end: 0;/);
    expect(
      declarationsFor('.app-root[data-nav-rail-position="top"] > .app-nav-rail'),
    ).toMatch(/border-block-end: 1px solid/);
    expect(
      declarationsFor('.app-root[data-nav-rail-position="bottom"] > .app-nav-rail'),
    ).toMatch(/border-block-start: 1px solid/);
    // `end` mirrors the column, so its border faces the content it separates.
    expect(declarationsFor('.app-root[data-nav-rail-position="end"] > .app-nav-rail')).toMatch(
      /border-inline-start: 1px solid/,
    );
  });

  it("releases a child's inline fill in a strip, so one control cannot eat the whole bar", () => {
    // `width: 100%` on a rail control is a CROSS-size request in a column (fill the rail) and a
    // MAIN-size claim in a strip. Measured before this rule: a 44px OrgSwitcher trigger inside a
    // 1416px wrapper, centred at x=698 on a 1440px screen.
    const rule = declarationsFor(
      '.app-root:is([data-nav-rail-position="top"], [data-nav-rail-position="bottom"]) > .app-nav-rail > .ui-org-switcher',
    );
    expect(rule).toMatch(/inline-size: auto;/);
    // flex-grow is deliberately untouched — that is how a child still opts INTO the leftover room.
    expect(rule).not.toMatch(/flex/);
    // And it must NOT be a blanket `> *`: that took the square cells with it — measured, the
    // launcher collapsed from 36x36 to 16x36, because an icon Button's width is a real square.
    expect(
      declarationsFor(
        '.app-root:is([data-nav-rail-position="top"], [data-nav-rail-position="bottom"]) > .app-nav-rail > *',
      ),
    ).toBe("");
  });

  it("drops the strip's extra row below the breakpoint, where the rail is hidden", () => {
    // The single-column template restates areas and columns but not ROWS, so a surviving rail row
    // would be a band of dead space sized by a rail nobody can see.
    const reset = declarationsFor(
      '.app-root[data-nav-rail]:is( [data-nav-rail-position="top"], [data-nav-rail-position="bottom"] )',
    );
    expect(reset).toMatch(
      /grid-template-rows: var\(--app-shell-bar-height\) minmax\(0, 1fr\) auto;/,
    );
  });

  it("folds the sidebar track at EVERY position — a strip must not out-specify the collapse rule", () => {
    // The shipped bug this pins: a strip position restates `grid-template-columns` with the
    // EXPANDED sidebar width at (0,3,0), which beats the generic `.app-root[data-collapsed]` at
    // (0,2,0). Measured with the rail on top — `data-collapsed="true"` was set, the rows went
    // icon-only, and the track stayed 256px, so the icons sat centred in a column 3x their width.
    for (const position of POSITIONS) {
      const collapsed =
        declarationsFor(
          `.app-root[data-nav-rail][data-nav-rail-position="${position}"][data-collapsed="true"]`,
        ) ||
        declarationsFor(
          '.app-root[data-nav-rail]:is( [data-nav-rail-position="top"], [data-nav-rail-position="bottom"] )[data-collapsed="true"]',
        );
      expect(collapsed, `${position} has no collapsed column template`).toMatch(
        /grid-template-columns:[^;]*--app-shell-sidebar-collapsed-width/,
      );
      expect(collapsed, `${position} must not keep the expanded sidebar width`).not.toMatch(
        /grid-template-columns:[^;]*--app-shell-sidebar-width/,
      );
    }
  });

  it("is ONE thickness on both axes, and lifts to the tap floor on a coarse pointer", () => {
    const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
    // Same measure whichever edge it is docked to: two numbers for one rail is a shape that drifts
    // the moment either is retuned, and a service has to remember both.
    expect(tokens).toMatch(
      /--app-shell-nav-rail-height:\s*var\(--app-shell-nav-rail-width\);/,
    );
    // The rail sizes its own cells — a control carries its own band token, so a narrower TRACK
    // alone clips it instead of shrinking it (the rail clips).
    expect(tokens).toMatch(/--app-shell-nav-rail-item-size:\s*var\(--band-height-lg\);/);
    // EVERY cell tier, not one component's knob: retuning only the organization trigger left the
    // rail with two sizes and two left offsets (36x36 at x=1.5 beside 28x28 at x=5.5).
    const railCells = declarationsFor(".app-nav-rail");
    expect(railCells).toMatch(/--org-switcher-trigger-height:\s*var\(--app-shell-nav-rail-item-size\)/);
    expect(railCells).toMatch(/--control-height-sm:\s*var\(--app-shell-nav-rail-item-size\)/);
    // Rule #24 on a finger: both the cell and the track it must fit inside go back up together.
    const coarse = tokens.slice(tokens.indexOf("@media (pointer: coarse)"));
    expect(coarse).toMatch(/--app-shell-nav-rail-item-size:\s*var\(--band-height-xl\);/);
    expect(coarse).toMatch(/--app-shell-nav-rail-width:\s*3rem;/);
  });

  it("keeps the rail one named landmark wherever it sits", () => {
    renderWithUi(
      <AppShell
        sidebar={<nav aria-label="主">ナビ</nav>}
        navRail={<nav aria-label="組織">レール</nav>}
        navRailPosition="bottom"
        navRailLabel="プラットフォーム"
      >
        <p>本文</p>
      </AppShell>,
    );
    expect(screen.getByRole("complementary", { name: "プラットフォーム" })).toBeInTheDocument();
  });
});
