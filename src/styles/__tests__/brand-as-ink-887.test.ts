import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#887 — THE BRAND USED AS INK, EVERYWHERE IT IS USED AS INK.
 *
 * `tenantTheme()` guarantees `--primary` against `--primary-foreground`: a fill and the label
 * riding on it. It says nothing about `--primary` painted as TEXT on a page surface, and the theme
 * lab's `base` column measured 1.18-2.06:1 at `#FFD400` and 2.16-3.64:1 at `#E2564A` on nine
 * strings, at rest and hovered. The first half of the fix (917a2449) gave the three brand-ink
 * roles a 4.5:1 floor. This half is the WIRING: nine of those ten strings never read a role, so the
 * floor could not reach them.
 *
 * ── WHY THIS IS A SWEEP AND NOT NINE ASSERTIONS ──────────────────────────────────────────────
 * The theme lab renders the components it happens to put on one page. Closing the six rows it
 * draws and leaving the rest is the failure this repo has already paid for three times (gh#841,
 * gh#845, gh#866): `.ui-timeline-title` measured 1.41:1 at citron and the lab never showed it.
 * So the contract is stated over the WHOLE stylesheet set — every `color:` declaration that
 * resolves to the brand FILL family must first read a brand INK role — and every exemption is
 * listed below with the reason it is one. A thirtieth call site added tomorrow fails this test
 * until it is wired or listed.
 *
 * ── THE SHAPE, AND WHY IT IS NOT THE CANONICAL ONE ───────────────────────────────────────────
 * The form used elsewhere is `hsl(var(--text-link, from hsl(var(--primary)) var(--text-link-channels)))`
 * — the role, falling back to its RAMP STEP. That step is one stop off the action colour, so
 * adopting it at these sites would move the shipped look at every seed (a MegaMenu label would go
 * from L 50% to L 41.6% on the package default). The requirement was byte-identical defaults, so
 * the fallback here is WHAT THE SITE PAINTED BEFORE:
 *
 *     var(--text-brand, var(--primary))                       // was var(--primary)
 *     var(--text-primary, var(--primary-active, from …))      // was the --primary-active chain
 *
 * The roles are `initial` at `:root` (derived.css), so an unseeded page resolves straight through
 * and nothing moves; `tenantTheme()` emits them as clamped literals, so a customer's hex is floored
 * the moment it is in scope. Measured in Chromium on the preview, light and dark, all six chain
 * shapes: before === after, byte for byte.
 *
 * jsdom resolves no `var()`, so this asserts the shipped cascade CONTRACT — which declaration
 * exists with which fallback — and the pixel measurement lives in `scripts/measure-glass.mjs`.
 */
const STYLES = resolve(process.cwd(), "src/styles");
const FILES = readdirSync(STYLES)
  .filter((f) => f.endsWith(".css"))
  .sort();

/** The three roles derived.css publishes for "the brand as ink on a page surface". */
const INK_ROLES = /--text-(?:link|brand|primary)\b/;
/** The FILL family. `--primary-foreground` is deliberately absent: it is the label ON the fill. */
const FILL_FAMILY = /--primary(?:-hover|-active|-border)?\s*[,)]|--primary(?:-hover|-active)?\s*$/;

type Site = { file: string; selector: string; value: string };

/** Strip comments, then read every `color:` declaration with the selector of the rule it sits in. */
function inkSites(file: string): Site[] {
  const css = readFileSync(resolve(STYLES, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Site[] = [];
  // Anchored on `{`, `}` or `;` so `background-color:`, `border-color:` and the `color` inside a
  // `transition:` list can never match — only the ink property itself.
  const decl = /(?:^|[;{}])\s*color\s*:\s*([^;}]+)/g;
  for (let m = decl.exec(css); m !== null; m = decl.exec(css)) {
    const value = m[1].replace(/\s+/g, " ").trim();
    // A declaration cannot contain `{`, so the nearest `{` before it opens its own rule, and the
    // prelude runs back to the previous brace. True at any nesting depth.
    const open = css.lastIndexOf("{", m.index);
    const prev = Math.max(css.lastIndexOf("}", open), css.lastIndexOf("{", open - 1));
    const selector = css
      .slice(prev + 1, open)
      .replace(/\s+/g, " ")
      .trim();
    out.push({ file, selector, value });
  }
  return out;
}

const brandInk = FILES.flatMap(inkSites).filter(
  (s) => FILL_FAMILY.test(s.value) && !/--primary-foreground/.test(s.value),
);

/**
 * The declarations that read the brand fill as ink AND STAY THAT WAY, each with the reason. A
 * blanket "wire everything" would have made two of these WORSE, which is why the list is here
 * rather than absent.
 */
const EXEMPT: Record<string, string> = {
  // The count badge inside a FILLED brand button: brand ink on `--primary-foreground`. That is the
  // pair `tenantTheme()` already contracts at >= 4.5:1, and contrast is symmetric, so this site is
  // floored already. Walking it towards a page surface it never touches would make it worse — at
  // `#FFD400` the ground here is BLACK, and the ink role is walked DARKER.
  "control.css::.ui-button--default .ui-button-count":
    "on --primary-foreground: the guaranteed pair, inverted",
  "toggle.css::.ui-toggle[data-state='on'] .ui-toggle-count":
    "on --primary-foreground: the guaranteed pair, inverted",
};

const key = (s: Site) => `${s.file}::${s.selector.replace(/"/g, "'")}`;

describe("gh#887 · every brand-as-ink call site reads a brand INK role", () => {
  it("finds the call sites at all (the sweep is not vacuously green)", () => {
    // If a refactor renames the property or the roles, the filter above would quietly match
    // nothing and this file would pass while measuring zero declarations.
    expect(brandInk.length).toBeGreaterThanOrEqual(25);
  });

  it("leaves no `color:` on the brand fill family unwired and unexplained", () => {
    const unwired = brandInk
      .filter((s) => !INK_ROLES.test(s.value))
      .filter((s) => !(key(s) in EXEMPT))
      .map((s) => `${key(s)}\n      ${s.value}`);
    expect(unwired).toEqual([]);
  });

  it("keeps every exemption real — a stale entry is a site nobody is checking", () => {
    const live = new Set(brandInk.map(key));
    expect(Object.keys(EXEMPT).filter((k) => !live.has(k))).toEqual([]);
  });

  it("keeps the shipped default: a site wired here falls back to what it painted before", () => {
    // The role is `initial` in the package, so the FALLBACK is the default. Adopting the role's
    // RAMP STEP instead (`from hsl(var(--primary)) var(--text-*-channels)`) moves the unseeded look
    // — `--text-brand-channels` is one stop down, so a MegaMenu label would go L 50% -> 41.6% on
    // the package seed. Four sites legitimately use that canonical form because they ALWAYS did;
    // they are named, so switching a gh#887 site to it cannot pass unnoticed.
    const CANONICAL_BY_DESIGN = new Set([
      "control.css::.ui-calendar .ui-calendar-day.day-today:not(.day-selected) .ui-calendar-day-button",
      "control.css::.ui-calendar .ui-calendar-day.day-today:not(:has(button))",
      "data-display-layout.css::.ui-code-block [data-code-token='link'], .ui-prose pre [data-code-token='link']",
      "text-layout.css::[data-slot='text'][data-link][data-tone='primary']:not([data-disabled])",
    ]);
    const moved = brandInk
      .filter((s) => /--text-(?:link|brand|primary)-channels/.test(s.value))
      .map(key)
      .filter((k) => !CANONICAL_BY_DESIGN.has(k));
    expect(moved).toEqual([]);
  });
});

describe("gh#887 · the six rows the theme lab measured", () => {
  const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
  const shell = read("src/styles/shell-layout.css");
  const nav = read("src/styles/navigation-layout.css");
  const control = read("src/styles/control.css");
  const display = read("src/styles/data-display-layout.css");
  const text = read("src/styles/text-layout.css");

  const rule = (css: string, selector: string) =>
    css.match(
      new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*\\}`),
    )?.[0] ?? "";

  it("Sidebar / NavList active row — 1.25:1 citron, 2.18:1 coral", () => {
    // One knob, two rules: `.sb-nav-item` is shared by Sidebar and NavList (shell-layout.css).
    const active = rule(shell, '.sb-nav-item[data-active="true"]');
    expect(active).toMatch(/--text-primary,\s*var\(\s*--primary-active,/);
    expect(shell.match(/--text-primary,\s*var\(\s*--primary-active,/g)).toHaveLength(2);
  });

  it("Sidebar sub-link — 1.31:1 citron, 2.51:1 coral", () => {
    const sub = rule(shell, '.sb-nav-item--sub[data-active="true"]');
    expect(sub).toMatch(/--text-primary,\s*var\(\s*--primary-active,/);
  });

  it("MegaMenu trigger and link at aria-current — 1.41:1 citron, 3.64:1 coral", () => {
    expect(rule(nav, '.ui-mega-menu-trigger[aria-current="page"]')).toMatch(
      /--mega-menu-trigger-current-foreground,\s*hsl\(var\(--text-brand,\s*var\(--primary\)\)\)/,
    );
    expect(rule(nav, '.ui-mega-menu-link[aria-current="page"]')).toMatch(
      /--mega-menu-link-current-foreground,\s*hsl\(var\(--text-link,\s*var\(--primary\)\)\)/,
    );
  });

  it("Anchor active link — 1.41:1 citron, 3.64:1 coral", () => {
    expect(nav).toMatch(/--anchor-ink-color,\s*var\(--text-link,\s*var\(--primary\)\)/);
  });

  it('Button variant="link" — 1.41:1 citron, 3.64:1 coral (gh#884 kept its knob)', () => {
    const link = rule(control, ".ui-button--link");
    // The gh#884 consumer knob is still FIRST: wiring the role must not take an override away.
    expect(link).toMatch(
      /color:\s*var\(--button-link-foreground,\s*hsl\(var\(--text-link,\s*var\(--primary\)\)\)\)/,
    );
  });

  it("Timeline current title — 1.41:1 citron, and the lab never drew it", () => {
    // The seventh site. It is in this list precisely because no rendered frame reported it.
    expect(rule(display, '.ui-timeline-title[data-current="true"]')).toMatch(
      /color:\s*hsl\(var\(--text-brand,\s*var\(--primary\)\)\)/,
    );
  });

  it('Separator tone="primary" — the LABEL is ink, the RULE is not', () => {
    // The one brand-ink site that is not a `color:` declaration, so the sweep above cannot see it:
    // `.ui-separator[data-tone="primary"]` hands two knobs down and the label knob carries text.
    // The rule knob stays on `--primary` deliberately — a 1px divider is a non-text graphic under
    // WCAG 1.4.11, and walking it towards the surface would only make the line harder to see.
    const layout = read("src/styles/layout.css");
    expect(layout).toMatch(
      /--separator-label-color:\s*var\(\s*--separator-tone-primary-label-color,\s*var\(--text-brand,\s*var\(--primary\)\)\s*\)/,
    );
    expect(layout).toMatch(
      /--separator-rule-color:\s*var\(--separator-tone-primary-rule-color,\s*var\(--primary\)\)/,
    );
  });

  it('Text/Heading/Icon tone="primary" — the generic brand ink the status tones already had', () => {
    // `--success` / `--warning` read the TEXT tier three lines below this rule and say why in a
    // comment; `primary` alone read the FILL tier.
    expect(text).toMatch(
      /\[data-slot="icon"\]\[data-tone="primary"\]\s*\{\s*color:\s*hsl\(var\(--text-brand,\s*var\(--primary\)\)\)/,
    );
  });
});
