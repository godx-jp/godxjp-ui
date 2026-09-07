import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `overflow: hidden` CANNOT LEAVE ROOM FOR A FOCUS RING — the keyword itself is the defect.
 *
 * `overflow-clip-margin` is defined only for `overflow: clip`; on `hidden` the declaration is
 * parsed and then ignored, so a `hidden` box shaves every outset ring flush with its padding box
 * with no way to get the room back (gh#376, `.ui-topbar-start > :last-child`). Chromium honours
 * the margin only when BOTH axes are `clip`, and rejects any `calc()` in it at parse time — a
 * single-axis clip or a calc() silently degrades the margin to 0, which looks exactly like the
 * bug it was meant to fix.
 *
 * MEASURED, not reasoned (headless Chromium, dpr 1, pixel probe 1px outside a flush child's box):
 *   container              overflow: hidden        overflow: clip + 8px
 *   .ui-aspect-ratio       ring gone, both edges   ring paints, both edges
 *   .ui-carousel-viewport  ring gone at bottom     ring paints
 *   .ui-command            ring gone at top        ring paints
 * …and the counter-measurement that decides every case NOT converted here: on a box with
 * `border-radius: 20px`, the pixel 2px inside the corner is the CHILD under `clip + 8px` and the
 * ground under `hidden`. The margin expands the clip SHAPE, radii included, so it destroys a
 * radius crop. A box whose clip exists to round its children to its corners therefore cannot buy
 * ring headroom this way; its headroom has to come from layout (inset the child), not overflow.
 *
 * jsdom does no layout, so this file pins the declarations that make the measured behaviour
 * reachable, and pins the reason each remaining `hidden` is deliberate.
 */

const STYLES_DIR = join(__dirname, "..");

const cssFiles = () => readdirSync(STYLES_DIR).filter((f) => f.endsWith(".css"));
const read = (file: string) => readFileSync(join(STYLES_DIR, file), "utf8");

type Rule = { file: string; selector: string; body: string };

/**
 * Every innermost `selector { … }` block across the stylesheets. `@layer` / `@media` wrappers hold
 * braces of their own so they never match as a rule, which is what we want: the declarations are
 * what carry the bug, not the at-rule they sit in.
 */
function rules(): Rule[] {
  const out: Rule[] = [];
  for (const file of cssFiles()) {
    // Comments are stripped FIRST. They hold no braces, so a `/* … */` sitting above a rule is
    // swallowed into the selector capture and every `selector === …` lookup silently misses.
    const css = read(file).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      out.push({ file, selector: m[1].trim().replace(/\s+/g, " "), body: m[2] });
    }
  }
  return out;
}

const declares = (body: string, prop: string, value: RegExp) =>
  new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*${value.source}`, "m").test(body);

/** Classes that paint a ring — read from the ONE file allowed to define one. */
function ringBearingClasses(): string[] {
  const focusRing = read("focus-ring.css");
  const found = new Set<string>();
  for (const block of focusRing.matchAll(/([^{}]*?):(?:focus-visible|focus-within)/g)) {
    for (const cls of block[1].matchAll(/\.([a-z][\w-]*)/g)) found.add(cls[1]);
  }
  return [...found];
}

/**
 * Containers converted to `clip` + the margin because a control inside them was measured losing
 * its ring. Each MUST keep both declarations: dropping the margin, or going back to `hidden`, or
 * clipping one axis, all reinstate the bug while still reading like a clip.
 */
const CONVERTED: ReadonlyArray<[file: string, selector: string, why: string]> = [
  [
    "layout.css",
    ".ui-aspect-ratio",
    "the ratio box is filled by consumer content, and the common fill is a link/video sized to the box",
  ],
  [
    "data-display-layout.css",
    ".ui-carousel-viewport",
    "every child of <Carousel> lands inside the viewport, dots and arrows included",
  ],
  [
    "control.css",
    ".ui-command",
    "the search input is the first child, flush with the top edge (SearchSelect, Cascader, TreeSelect, palette)",
  ],
  [
    "shell-layout.css",
    ".ui-topbar-start > :last-child",
    "the slot's last child is whatever the consumer passed — often a control (gh#376)",
  ],
];

/**
 * Containers that DO host controls and still clip with `hidden` — on purpose. The exemption is
 * always the same one: the clip is a radius crop, and the margin provably unrounds it. The test
 * re-checks that reason rather than trusting the comment: if the radius goes, so does the
 * exemption, and the rule has to be revisited.
 */
const RADIUS_CROP_EXEMPT: ReadonlyArray<
  [file: string, selector: string, radiusAnchor: string, why: string]
> = [
  [
    "card-layout.css",
    '[data-slot="card"]',
    '[data-slot="card"]',
    "rounds a full-bleed cover / table to the card corners",
  ],
  [
    "card-layout.css",
    '[data-slot="card"]:has([data-slot="card-header"][data-banded])',
    '[data-slot="card"]',
    "same crop, re-asserted when a banded header makes the card a two-band surface",
  ],
  [
    "dialog-layout.css",
    '[data-slot="dialog-content"]',
    '[data-slot="dialog-content"]',
    "rounds the full-bleed header/footer bands with the dialog corners (Ant Modal)",
  ],
];

describe("focus-ring clip margin", () => {
  it("never pairs the clip margin with a keyword that ignores it", () => {
    const dead = rules()
      .filter((r) => /overflow-clip-margin\s*:/.test(r.body))
      .filter((r) => !declares(r.body, "overflow", /clip\s*;/))
      .map((r) => `${r.file}: ${r.selector}`);
    // `hidden` parses the margin and drops it; a single-axis `overflow-x/y: clip` makes Chromium
    // drop it too. Either way the ring is shaved by a rule that reads as if it left room.
    expect(dead).toEqual([]);
  });

  it("keeps the clip margin a bare var(), never a calc()", () => {
    const offenders = rules()
      .filter((r) => /overflow-clip-margin\s*:\s*calc\(/.test(r.body))
      .map((r) => `${r.file}: ${r.selector}`);
    // Chromium rejects calc() in overflow-clip-margin at parse time — even calc(2 * 2px) — and a
    // rejected declaration is a 0 margin, i.e. `hidden` wearing a different keyword.
    expect(offenders).toEqual([]);
    for (const r of rules().filter((x) => /overflow-clip-margin\s*:/.test(x.body))) {
      expect(r.body).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
    }
  });

  it.each(CONVERTED)("%s %s clips with ring headroom (%s)", (file, selector) => {
    const rule = rules().find((r) => r.file === file && r.selector === selector);
    expect(rule, `${selector} disappeared from ${file}`).toBeDefined();
    expect(rule!.body).toMatch(/overflow:\s*clip;/);
    expect(rule!.body).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
    expect(rule!.body).not.toMatch(/overflow:\s*hidden;/);
    // Two-axis only: `overflow-x`/`overflow-y` would drop the margin without changing how the
    // rule reads.
    expect(rule!.body).not.toMatch(/overflow-[xy]\s*:/);
  });

  it("flags any new `overflow: hidden` on a ring-bearing or consumer-content selector", () => {
    const ring = ringBearingClasses();
    // The shapes that make a container's contents UNKNOWABLE from the stylesheet — a slot that
    // takes whatever the consumer passes. This is the exact shape gh#376 hid in.
    const CONSUMER_CONTENT = [
      />\s*:(?:last|first|nth)-child/,
      />\s*\*/,
      /\[data-slot="card"\]/,
      /\[data-slot="[a-z-]*content"\]/,
      /:has\(/,
    ];
    const reviewed = new Set([
      ...CONVERTED.map(([f, s]) => `${f}::${s}`),
      ...RADIUS_CROP_EXEMPT.map(([f, s]) => `${f}::${s}`),
    ]);

    const flagged = rules()
      .filter((r) => /(?:^|;)\s*overflow(?:-[xy])?\s*:\s*hidden/m.test(r.body))
      .filter(
        (r) =>
          ring.some((c) => new RegExp(`\\.${c}(?![\\w-])`).test(r.selector)) ||
          CONSUMER_CONTENT.some((re) => re.test(r.selector)),
      )
      .filter((r) => !reviewed.has(`${r.file}::${r.selector}`))
      .map((r) => `${r.file}: ${r.selector}`);

    // A new entry here is not automatically a bug — it is an unreviewed one. Measure the ring in a
    // browser, then either convert it (add to CONVERTED) or record why it must keep the crop
    // (add to RADIUS_CROP_EXEMPT). Do not silence it by loosening the shapes above.
    expect(flagged).toEqual([]);
  });

  it.each(RADIUS_CROP_EXEMPT)(
    "%s %s still clips for a radius, not by habit (%s · %s)",
    (file, selector, radiusAnchor) => {
      const rule = rules().find((r) => r.file === file && r.selector === selector);
      expect(rule, `${selector} disappeared from ${file}`).toBeDefined();
      // …and it must not carry a margin that `hidden` will silently drop.
      expect(rule!.body).not.toMatch(/overflow-clip-margin/);
      // The whole exemption is "this clip rounds children to the box". The radius may be declared
      // on the same selector or on a responsive/variant rule for it (the dialog only rounds from
      // 640px up), so the anchor is what is checked, not this one rule's body: without a radius
      // anywhere, there is nothing to round and the rule owes its controls the 8px instead.
      const rounds = rules().some(
        (r) =>
          r.file === file && r.selector.includes(radiusAnchor) && /border-radius:/.test(r.body),
      );
      expect(rounds, `${radiusAnchor} no longer declares a border-radius in ${file}`).toBe(true);
    },
  );

  /**
   * SAME FAMILY, DIFFERENT OVERFLOW. `.ui-dropdown-menu-content` is `overflow-y: auto`, and a
   * scroll container has no negative scrollTop: anything pushed ABOVE its scroll origin is
   * unreachable forever and does not even count towards `scrollHeight`. The shared menu-row rule
   * gives every row a definite `height`, which a two-line identity block (name over email, the
   * canonical user menu) overflows; `align-items: center` then splits the excess evenly and pushes
   * the top half out of reach. Measured before the fix, with the DS's own DropdownMenuLabel:
   * label box 32px, its child 95.2px, scrollHeight 64 vs clientHeight 32, ink starting 27.6px above
   * the content's padding box — while the content reported scrollHeight 154 === clientHeight 154,
   * i.e. losing content it could not see it was losing. `min-height` alone can never fix this: a
   * min- cannot grow a box that already has a definite height.
   */
  it("lets a menu LABEL grow past the one-line row height (the user-menu identity block)", () => {
    const label = rules().find(
      (r) =>
        r.file === "navigation-layout.css" &&
        r.selector.includes(".ui-dropdown-menu-label") &&
        /min-height:/.test(r.body),
    );
    expect(label, "the *-label rule disappeared from navigation-layout.css").toBeDefined();
    expect(label!.selector).toContain(".ui-context-menu-label");
    expect(label!.selector).toContain(".ui-menubar-label");
    // `height: auto` releases the definite height the shared row rule set; without it the
    // `min-height` below it is dead code.
    expect(label!.body).toMatch(/height:\s*auto;/);
    expect(label!.body).toMatch(/min-height:\s*var\(--menu-item-height\);/);
  });
});
