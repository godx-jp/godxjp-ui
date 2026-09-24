import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chromium } from "playwright";

/**
 * gh#848 — the Segmented track and the selected slab were `:root` role bindings.
 *
 * ```css
 * :root {
 *   --segmented-track-background: var(--muted);
 *   --segmented-item-selected-background: var(--background);
 * }
 * ```
 *
 * A custom property substitutes its `var()`s AT THE ELEMENT THAT DECLARES IT, so both computed
 * once on `<html>` and every scope below inherited the answer root gave. docs/TOKENS.md ·
 * "Role-mirror knobs MUST be `initial`" forbids exactly this shape, and this is the sixth instance
 * of the family (gh#687 opened it, gh#843 fixed its own neighbour in this very file).
 *
 * IT WAS INVISIBLE, WHICH IS WHY IT NEEDED A BROWSER TO SEE. `.dark` lands on `<html>` — the same
 * element that holds `:root` — so the binding is re-evaluated there and happens to be right. The
 * defect only appears when a dark region is scoped BELOW the root: a `[data-tenant]` block, a dark
 * panel on a light page, the theme editor's own preview pane. Measured in Chromium with `.dark` on
 * a `<div>`, before the fix:
 *
 *   scoped `.dark`  --muted = 45 6% 18%   but --segmented-track-background = 45 15% 95%
 *                   track painted rgb(244,243,240)  ← the LIGHT neutral, under dark ink
 *                   slab  painted rgb(253,253,252)  ← the LIGHT surface
 *
 * and after:
 *
 *   scoped `.dark`  track rgb(49,47,43) · slab rgb(25,24,21) — byte-identical to `.dark` on <html>
 *
 * The token-graph half below is read FROM SOURCE rather than from a computed style, the way
 * segmented-selected-contrast-843.test.ts reads it: jsdom cannot see a substitution that happened
 * at declaration time, so a jsdom assertion here would pass on the broken file.
 */

const REPO = process.cwd();
const segmentedTokens = readFileSync(join(REPO, "src/tokens/components/segmented.css"), "utf8");
const controlStyles = readFileSync(join(REPO, "src/styles/control.css"), "utf8");
const foundation = readFileSync(join(REPO, "src/tokens/foundation.css"), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The two knobs this issue is about, and the role each one's call site must name. */
const REPAIRED = [
  ["--segmented-track-background", "--muted"],
  ["--segmented-item-selected-background", "--background"],
] as const;

/**
 * The roles a consumer may re-declare on a subtree — read from foundation.css's own `.dark` block
 * rather than hand-kept, because a hand-kept list is how `--font-size-*` was missed for three
 * releases (see the seed note in scripts/check-frame-token-scope.mjs).
 */
function themeRoles(): Set<string> {
  const start = foundation.search(/\.dark,\s*:root\[data-theme="dark"\]\s*\{/);
  expect(start, "foundation.css must declare a `.dark` theme block").toBeGreaterThan(-1);
  const open = foundation.indexOf("{", start);
  const body = foundation.slice(open + 1, foundation.indexOf("\n}", open));
  const roles = new Set([...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
  expect(roles.size, "the `.dark` block must re-declare roles").toBeGreaterThan(0);
  return roles;
}

/** Every `:root` knob in segmented.css whose value is a BARE `var(--role)` on a theme role. */
function frozenRoleBindings(): string[] {
  const roles = themeRoles();
  return stripComments(segmentedTokens)
    .split("\n")
    .map((line) => line.match(/^\s*(--[\w-]+)\s*:\s*var\((--[\w-]+)\)\s*;/))
    .filter((m): m is RegExpMatchArray => Boolean(m) && roles.has(m![2]))
    .map((m) => `${m[1]} ← ${m[2]}`)
    .sort();
}

describe("Segmented surface knobs follow a scoped theme (gh#848) — the token graph", () => {
  it.each(REPAIRED)("declares %s `initial`, with no role to freeze", (token) => {
    expect(stripComments(segmentedTokens)).toMatch(
      new RegExp(`${token}:\\s*initial;`),
      // A `var(--role)` here substitutes on <html> and the knob stops being a knob.
    );
  });

  it.each(REPAIRED)("reads %s at the call site with a `var(%s)` default", (token, role) => {
    // EVERY reader must carry the fallback. A bare read of an `initial` knob resolves to nothing
    // and the failure is silent and total — the half-applied cure is the likeliest way to reship
    // this defect, so the readers are counted, not merely sampled.
    const src = stripComments(controlStyles);
    const all = [...src.matchAll(new RegExp(`var\\(\\s*${token}\\s*[,)]`, "g"))];
    expect(all.length, `${token} must be read in src/styles/control.css`).toBeGreaterThan(0);
    const guarded = [
      ...src.matchAll(new RegExp(`var\\(\\s*${token}\\s*,\\s*var\\(${role}\\)\\s*\\)`, "g")),
    ];
    expect(guarded.length, `every read of ${token} must fall back to var(${role})`).toBe(
      all.length,
    );
  });

  it("no `:root` knob in segmented.css is bound bare to a re-scopable theme role — except the named debt", () => {
    /* THE LEFTOVERS ARE ASSERTED, NOT FILTERED. These four are the same defect one property over
     * (ink and the pressed fill rather than the two surfaces) and they are NOT in this issue's
     * scope — gh#848 is one issue, one fix. Listing them here means the next one added to this
     * file fails immediately, and fixing one of these four also fails, which is the prompt to
     * delete it from the list. `--segmented-item-hover-color` and `--segmented-item-selected-color`
     * are already carried as debt in preview/frame-token-scope.baseline.json; the other two are
     * invisible to that gate because its COLOUR_SEEDS list does not yet name `--muted-foreground`
     * or `--secondary`. */
    /* Three of the four went away in gh#906: `--segmented-item-color`,
     * `--segmented-item-hover-color` and `--segmented-item-selected-color` are `initial` knobs
     * now, with the role resolved at the call site, so a scoped theme reaches them. The ledger
     * shrinks rather than being deleted — `--segmented-item-active-background ← --secondary` is
     * still bound bare, and it is the ONE remaining debt this test is for. */
    expect(frozenRoleBindings()).toEqual(["--segmented-item-active-background ← --secondary"]);
  });

  it.each(REPAIRED)("%s is no longer one of them", (token) => {
    // The generic form of the first assertion: it states the RULE rather than the string, so a
    // revert that spells the binding differently is caught just the same.
    expect(frozenRoleBindings().map((e) => e.split(" ← ")[0])).not.toContain(token);
  });
});

/** Exactly the files the preview loads for a Segmented, in load order. */
function browserStylesheet(): string {
  return [
    "src/tokens/foundation.css",
    "src/tokens/derived.css",
    "src/tokens/axes.css",
    "src/tokens/components/control.css",
    "src/tokens/components/segmented.css",
    "src/styles/control.css",
  ]
    .map((p) => readFileSync(join(REPO, p), "utf8"))
    .join("\n");
}

const BAR = (id: string) => `
  <div class="ui-segmented" data-slot="segmented" id="${id}">
    <label class="ui-segmented-item" data-state="unchecked"><span>A</span></label>
    <label class="ui-segmented-item" data-state="checked"><span>B</span></label>
  </div>`;

describe("Segmented surface knobs follow a scoped theme (gh#848) — Chromium", () => {
  it("a `.dark` REGION paints the dark track and slab, not the root's light ones", async () => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    // `.dark` on a <div>, NOT on <html>. This is the whole test: on <html> the root binding is
    // re-evaluated and the defect hides.
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>
         ${BAR("light")}
         <div class="dark">${BAR("scoped")}</div>
       </body></html>`,
    );
    const rootDark = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await rootDark.setContent(
      `<!doctype html><html class="dark"><head><style>${css}</style></head><body>${BAR("rootdark")}</body></html>`,
    );

    const read = (p: typeof page, id: string) =>
      p.evaluate((id: string) => {
        const track = document.getElementById(id)!;
        const slab = track.querySelector('[data-state="checked"]')!;
        const cs = getComputedStyle(track);
        return {
          track: cs.backgroundColor,
          slab: getComputedStyle(slab).backgroundColor,
          muted: cs.getPropertyValue("--muted").trim(),
        };
      }, id);

    const light = await read(page, "light");
    const scoped = await read(page, "scoped");
    const root = await rootDark.evaluate(() => {
      const track = document.getElementById("rootdark")!;
      const slab = track.querySelector('[data-state="checked"]')!;
      return {
        track: getComputedStyle(track).backgroundColor,
        slab: getComputedStyle(slab).backgroundColor,
        muted: getComputedStyle(track).getPropertyValue("--muted").trim(),
      };
    });
    await browser.close();

    // The premise: the scope really does move the role. Without this the rest passes trivially.
    expect(scoped.muted).not.toBe(light.muted);
    expect(scoped.muted).toBe(root.muted);

    // The defect, as it was: scoped === light. The fix: scoped === the root-level dark.
    expect(scoped.track, "track froze at the root's light --muted").not.toBe(light.track);
    expect(scoped.slab, "slab froze at the root's light --background").not.toBe(light.slab);
    expect(scoped.track).toBe(root.track);
    expect(scoped.slab).toBe(root.slab);

    // …and the light page is untouched by the repair.
    expect(light.track).toBe("rgb(244, 243, 240)");
    expect(light.slab).toBe("rgb(253, 253, 252)");
  });
});
