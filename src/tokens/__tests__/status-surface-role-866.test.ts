import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb } from "./wcag-contrast";

/**
 * gh#866 — THE STATUS SURFACE TIER, AND THE EIGHT PLACES THAT HAVE TO AGREE ON IT.
 *
 * The palette had three status tiers and all three are INK: FILL (`--success`), TEXT
 * (`--text-success`), MARK (`--mark-success`). A tone is also painted as a pale GROUND that
 * content sits on, and every surface in the library DERIVED that ground from one of the inks
 * through an alpha — `--alert-bg-alpha`, `bg-success/10`, `--table-row-tone-wash-alpha`,
 * `--chat-bubble-tone-background-alpha`, a bare `0.12`.
 *
 * Derivation ties the ground's hue to the ink, and a brand's pair is not a derivation. The kit
 * that opened the issue ships `--success #126342` beside `--success-soft #E8F5EF`: a separately
 * chosen mint, not that green at any alpha. `--card-background` could STORE the colour on a scope
 * and nothing consumed it, because each surface derived its own.
 *
 * ── WHY THIS FILE READS SOURCE AND NOT A COMPUTED STYLE ──────────────────────────────────────
 * jsdom returns `""` for every custom property in this graph, so a jsdom assertion would pass on
 * the broken CSS. Same reason `segmented-scope-freeze-848.test.ts` resolves its graph from source.
 * The browser half — that a `[data-tenant]` on a `<div>` actually reaches these surfaces — is the
 * `--freeze-only` stage of `check:frame-token-scope` plus the probe recorded in the issue.
 *
 * ── THE PART THAT IS NOT THE TOKENS ──────────────────────────────────────────────────────────
 * A role that propagates to three of four places is the defect this repo keeps rediscovering
 * under other names (gh#845, gh#841), so the third block below is a SWEEP, not a checklist: every
 * alpha-composited status background anywhere in `src/` must read its `--surface-*` role, and the
 * two that deliberately do not are named here with the reason. A new component that derives a
 * status tint fails this test on the day it is written rather than on the day a brand notices.
 */

const REPO = process.cwd();
const read = (rel: string) => readFileSync(join(REPO, rel), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
/**
 * One line, and no whitespace hugging a paren. Prettier wraps a long CSS value onto three lines
 * and un-wraps it again when the value shortens, so an assertion that carries the line breaks
 * asserts on Prettier's mood rather than on the token graph — measured: the same four ChatBubble
 * rules came back from `prettier --write` with three collapsed and one still wrapped.
 */
const squash = (s: string) => s.replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

const FOUNDATION = read("src/tokens/foundation.css");
const STATUSES = ["success", "warning", "info", "destructive"] as const;

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * 1 · THE TIER ITSELF — declared, and declared `initial`.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

describe("the status SURFACE tier exists and cannot freeze (gh#866)", () => {
  it.each(STATUSES)("declares --surface-%s as `initial`, with no role to freeze", (status) => {
    expect(stripComments(FOUNDATION)).toContain(`--surface-${status}: initial;`);
  });

  it("never binds a surface role to another token at `:root`", () => {
    // docs/TOKENS.md · "Role-mirror knobs MUST be `initial`". A `:root` binding substitutes on
    // `<html>`, so a scoped `[data-tenant]` below it inherits root's answer — the gh#687/#834/#848
    // family. The formula belongs at the call site, which block 2 measures.
    const bound = [...stripComments(FOUNDATION).matchAll(/--surface-(\w+)\s*:\s*([^;]+);/g)]
      .filter(([, name, value]) => STATUSES.includes(name as never) && value.trim() !== "initial")
      .map(([line]) => line.trim());
    expect(bound).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * 2 · THE CONSUMERS — the complete list, each with the derived formula it must still fall back
 *     to. The right-hand side is the EXACT expression that shipped before this change, so the
 *     default appearance is asserted to be byte-identical and not merely "close".
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

const CONSUMERS: ReadonlyArray<{
  component: string;
  file: string;
  /** status → the call site as it must read now, whitespace-squashed. */
  callSite: (status: string) => string;
  statuses?: readonly string[];
}> = [
  {
    component: "Alert / Banner / Callout",
    file: "src/styles/alert-layout.css",
    callSite: (s) =>
      `background-color: var(--surface-${s}, hsl(var(--${s}) / var(--alert-bg-alpha)));`,
  },
  {
    component: "Badge tone",
    file: "src/lib/control-styles.ts",
    callSite: (s) =>
      `[background-color:var(--surface-${s},color-mix(in_oklab,hsl(var(--${s}))_10%,transparent))]`,
  },
  {
    component: "Dialog / AlertDialog / Sheet header band",
    file: "src/components/feedback/overlay-header-tone.ts",
    callSite: (s) =>
      `[background-color:var(--surface-${s},color-mix(in_oklab,hsl(var(--${s}))_10%,transparent))]`,
  },
  {
    component: "ChatBubble tone",
    file: "src/styles/data-display-layout.css",
    callSite: (s) =>
      `background: var(--surface-${s}, hsl(var(--${s}) / var(--chat-bubble-tone-background-alpha)));`,
  },
  {
    component: "DataTable / Table row tone",
    file: "src/styles/table-layout.css",
    callSite: (s) => `--table-row-tone-surface: var(--surface-${s});`,
  },
  {
    component: "EmptyState tone medallion",
    file: "src/styles/layout.css",
    callSite: (s) => `--empty-state-icon-tint: var(--surface-${s}, hsl(var(--${s}) / 0.12));`,
  },
  {
    component: 'Flex surface="warning"',
    file: "src/styles/layout.css",
    statuses: ["warning"],
    callSite: (s) => `var(--surface-${s}, hsl(var(--${s}) / var(--flex-surface-warning-alpha)))`,
  },
  {
    component: "Upload draft-undo strip",
    file: "src/styles/data-entry-layout.css",
    statuses: ["destructive"],
    callSite: (s) => `background-color: var(--surface-${s}, hsl(var(--${s}) / 0.05));`,
  },
];

describe("every status surface consumes the role (gh#866)", () => {
  for (const { component, file, callSite, statuses = STATUSES } of CONSUMERS) {
    const source = squash(stripComments(read(file)));
    it.each(statuses)(
      `${component} · %s reads --surface-* with today's formula as the fallback`,
      (status) => {
        expect(source).toContain(squash(callSite(status)));
      },
    );
  }

  it("Toast (Sonner) · all four types read --surface-* with today's composite as the fallback", () => {
    // Sonner writes ONE template per tone (`--success-bg`, `--error-bg`, …) from a table that
    // pairs the sonner type name with this library's role, so the assertion is on the template
    // plus the table — a per-status `toContain` would be asserting on `${hue}`.
    const source = squash(stripComments(read("src/components/feedback/sonner.tsx")));
    expect(source).toContain(
      squash(
        "`var(--surface-${hue}, color-mix(in srgb, hsl(var(--${hue}))" +
          " calc(var(--alert-bg-alpha) * 100%), hsl(var(--popover) / var(--popover-alpha, 100%))))`",
      ),
    );
    for (const [type, hue] of [
      ["success", "success"],
      ["error", "destructive"],
      ["warning", "warning"],
      ["info", "info"],
    ]) {
      expect(source).toContain(`{ type: "${type}", hue: "${hue}"`);
    }
  });

  it("the DataTable row wash reads the hand-off knob, not the tone colour alone", () => {
    expect(squash(stripComments(read("src/styles/table-layout.css")))).toContain(
      squash(`background-image: linear-gradient(
        var(--table-row-tone-surface, hsl(var(--table-row-tone-color) / var(--table-row-tone-wash-alpha))),
        var(--table-row-tone-surface, hsl(var(--table-row-tone-color) / var(--table-row-tone-wash-alpha))));`),
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * 3 · THE SWEEP — no tenth surface may derive a status ground in silence.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The two alpha-composited status backgrounds that deliberately do NOT read a surface role.
 * Each entry is `file` → the reason, and the reason is the point: an exemption without one is
 * how the list grows back into the defect.
 */
const EXEMPT: Record<string, string> = {
  // An INTERACTION state, not a status surface. The wash says "you are pointing at a destructive
  // item", so it must track that item's own ink; painted in a brand's error ground it would read
  // as a permanently-flagged row rather than as hover.
  "src/styles/navigation-layout.css": "DropdownMenu destructive item highlight — hover feedback",
  // A hand-rolled row tone: PermissionMatrix marks a differing row with `bg-warning/[0.07]`
  // instead of the `TableRow tone="warning"` primitive that block 2 wires. Pointing it at the
  // role here would leave the duplication in place; using the primitive changes its default wash
  // from 7% to 6%, which is a visible change and belongs in its own issue.
  "src/components/data-display/permission-matrix.tsx":
    "diff row hand-rolls a row tone — should use TableRow tone, tracked separately",
};

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(css|ts|tsx)$/.test(entry)) out.push(full);
    }
  };
  walk(join(REPO, "src"));
  return out;
}

/** `--success` but never `--success-foreground`: only the status role itself seeds a ground. */
const ROLE = "(?:success|warning|info|destructive)(?![\\w-])";
/**
 * A background painted from a status role AT AN ALPHA — a CSS declaration that names the role and
 * then a `/` before its semicolon (`hsl(var(--x) / 0.1)`, `color-mix(… x 5%, …)` is caught by the
 * `%`-less companion below), or a Tailwind `bg-x/…` modifier. A SOLID `hsl(var(--destructive))`
 * fill is the FILL tier and stays exactly as it is — a chip with a label on it is not a ground.
 *
 * Matched against the comment-free source SQUASHED to one line, because the repair wraps several
 * of these onto three lines and a line-anchored sweep would stop seeing the very declarations it
 * was written for.
 */
const BG_PROPERTY = `(?:background[a-z-]*|--[a-z-]*(?:bg|background|tint|surface|wash)[a-z-]*)\\s*:`;
const ALPHA_BACKGROUND = new RegExp(
  // an alpha channel …          `hsl(var(--success) / 0.1)`
  `(?:${BG_PROPERTY}[^;]*--${ROLE}[^;]*/[^;]*;)|` +
    // … or a mix percentage …   `color-mix(in oklab, hsl(var(--success)) 10%, transparent)`
    `(?:${BG_PROPERTY}[^;]*color-mix\\([^;]*--${ROLE}[^;]*;)|` +
    // … or Tailwind's modifier  `bg-success/10`
    `(?:\\bbg-${ROLE}/)`,
  "g",
);

/** Comments blanked, then squashed — the shape both sweep assertions read. */
const sweepable = (rel: string) => squash(stripComments(read(rel)));

describe("no status surface derives its ground in silence (gh#866)", () => {
  it("every alpha-composited status background reads --surface-*, or is a named exemption", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const rel = file.slice(REPO.length + 1);
      for (const match of sweepable(rel).matchAll(ALPHA_BACKGROUND)) {
        if (match[0].includes("--surface-")) continue;
        if (EXEMPT[rel]) continue;
        offenders.push(`${rel}: ${match[0].trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the exemption list honest — an exempt file must still hold the thing it exempts", () => {
    for (const [rel, reason] of Object.entries(EXEMPT)) {
      const derived = [...sweepable(rel).matchAll(ALPHA_BACKGROUND)].filter(
        (m) => !m[0].includes("--surface-"),
      );
      expect(derived.length, `${rel} (${reason})`).toBeGreaterThan(0);
    }
  });

  it("sees the two exemptions when they are not exempt — the sweep is not vacuous", () => {
    for (const rel of Object.keys(EXEMPT)) {
      const derived = [...sweepable(rel).matchAll(ALPHA_BACKGROUND)].map((m) => m[0]);
      expect(
        derived.some((d) => !d.includes("--surface-")),
        rel,
      ).toBe(true);
    }
    // and it still sees a wired one, so a regex that matches nothing cannot pass this file
    expect(
      [...sweepable("src/styles/alert-layout.css").matchAll(ALPHA_BACKGROUND)].length,
    ).toBeGreaterThanOrEqual(4);
  });
});

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * 4 · THE CONTRACT THE ROLE MAKES WITH A BRAND — the four pairs from the kit in the issue,
 *     measured against the ink this library actually paints on them.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

const LIGHT = (() => {
  const open = FOUNDATION.indexOf("{", FOUNDATION.indexOf(":root {"));
  return FOUNDATION.slice(open + 1, FOUNDATION.indexOf("\n}", open));
})();

const hex = (value: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];

/** The Caimono kit, verbatim from gh#866. */
const KIT = [
  { status: "success", ink: "text-success", surface: "#E8F5EF" },
  { status: "warning", ink: "text-warning", surface: "#FFF4D8" },
  { status: "error", ink: "text-error", surface: "#FFF0F1" },
  { status: "info", ink: "text-info", surface: "#EAF1FF" },
] as const;

describe("a brand's pale ground still carries this library's status ink (gh#866)", () => {
  it.each(KIT)("$status · --$ink on $surface clears WCAG 2.2 AA for text", ({ ink, surface }) => {
    const ratio = contrast(hslToRgb(hsl(LIGHT, ink)), hex(surface));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(KIT)("$status · body ink on $surface clears AA too", ({ surface }) => {
    // Alert and ChatBubble keep `color: hsl(var(--foreground))` on a toned surface.
    expect(contrast(hslToRgb(hsl(LIGHT, "foreground")), hex(surface))).toBeGreaterThanOrEqual(4.5);
  });
});
