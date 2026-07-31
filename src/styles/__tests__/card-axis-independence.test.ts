import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Card inline ↔ block axis independence (gh#232).
 *
 * The consumer blocker: `AuthShell` documented `--auth-shell-card-padding-block-compact` as the
 * public knob for the canonical Login card's height, but the rendered `CardContent` took BOTH the
 * inline column and the block shell edges from the single `--card-space-inset`. The knob reached the
 * card subtree and then did nothing, so Platform had to bridge it with a consumer selector on
 * `[data-slot="card-content"]` — exactly the fork rules #44/#45 forbid.
 *
 * jsdom performs no layout and does not resolve `var()`, so a `getComputedStyle` assertion here
 * would be vacuous. Instead this suite RESOLVES THE REAL CASCADE from the shipped stylesheets: it
 * reads every `:root` token declaration, the `.ui-auth-shell[data-density="compact"]
 * .ui-auth-shell-card` scope block, and the three `[data-slot="card-content"]` padding declarations
 * straight out of `card-layout.css`, then substitutes `var()` exactly as the CSS engine does
 * (a declared value of `initial` is guaranteed-invalid → the call-site fallback wins). Rewire any of
 * those and this fails. Real pixel numbers are re-measured in headless Chromium at ship time.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const cardTokens = read("src/tokens/components/card.css");
const shellTokens = read("src/tokens/components/shell.css");
const cardStyles = read("src/styles/card-layout.css");
const shellStyles = read("src/styles/shell-layout.css");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const squash = (value: string) => value.replace(/\s+/g, " ").trim();

/** Every `--token: value` pair inside the first CSS block opened by `opener`. */
function blockDeclarations(css: string, opener: string): Record<string, string> {
  const clean = stripComments(css);
  const at = clean.indexOf(opener);
  expect(at, `missing CSS block: ${squash(opener)}`).toBeGreaterThan(-1);
  const body = clean.slice(at + opener.length, clean.indexOf("}", at));
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[name] = squash(value);
  }
  return out;
}

/** One property declaration (e.g. `padding-inline`) out of the first block opened by `opener`. */
function property(css: string, opener: string, prop: string): string {
  const clean = stripComments(css);
  const at = clean.indexOf(opener);
  expect(at, `missing CSS block: ${squash(opener)}`).toBeGreaterThan(-1);
  const body = clean.slice(at + opener.length, clean.indexOf("}", at));
  const match = body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+);`));
  expect(match, `missing ${prop} in ${squash(opener)}`).not.toBeNull();
  return squash(match![1]);
}

/** All `:root` custom properties declared across the token tier. */
function rootTokens(): Record<string, string> {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".css")) files.push(full);
    }
  };
  walk(resolve(process.cwd(), "src/tokens"));

  const out: Record<string, string> = {};
  for (const file of files) {
    const clean = stripComments(readFileSync(file, "utf8"));
    for (const [, body] of clean.matchAll(/:root\s*\{([^}]*)\}/g)) {
      for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        out[name] = squash(value);
      }
    }
  }
  return out;
}

/** Split `--name, fallback` at the top-level comma (fallbacks may themselves be `var(…)`). */
function splitFallback(inner: string): [string, string | undefined] {
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "," && depth === 0) {
      return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
  }
  return [inner.trim(), undefined];
}

/**
 * Substitute `var()` the way the CSS engine does. A property declared `initial` holds the
 * guaranteed-invalid value, so `var(--knob, <fallback>)` takes the fallback — this is what lets a
 * knob's default re-resolve at the CALL SITE instead of freezing at `:root` (docs/TOKENS.md).
 */
function substitute(value: string, vars: Record<string, string>, depth = 0): string {
  const at = value.indexOf("var(");
  if (at === -1 || depth > 32) return squash(value);

  let nesting = 0;
  let end = at + 3;
  for (; end < value.length; end++) {
    if (value[end] === "(") nesting++;
    else if (value[end] === ")" && --nesting === 0) break;
  }

  const [name, fallback] = splitFallback(value.slice(at + 4, end));
  const declared = vars[name];
  let replacement: string;
  if (declared !== undefined && declared !== "initial") {
    replacement = substitute(declared, vars, depth + 1);
  } else if (fallback !== undefined) {
    replacement = substitute(fallback, vars, depth + 1);
  } else {
    replacement = `UNRESOLVED(${name})`;
  }

  return substitute(value.slice(0, at) + replacement + value.slice(end + 1), vars, depth + 1);
}

const AUTH_CARD_SCOPE = '.ui-auth-shell[data-density="compact"] .ui-auth-shell-card {';
const CARD_CONTENT = '\n  [data-slot="card-content"] {';
const CARD_CONTENT_SOLO = '\n  [data-slot="card-content"][data-solo] {';
const CARD_HEADER_PLAIN = '\n  [data-slot="card-header"]:not([data-banded]) {';

const ROOT = rootTokens();
const AUTH_CARD = blockDeclarations(shellStyles, AUTH_CARD_SCOPE);
const DECLARED = {
  inline: property(cardStyles, CARD_CONTENT, "padding-inline"),
  blockEnd: property(cardStyles, CARD_CONTENT, "padding-bottom"),
  blockStartSolo: property(cardStyles, CARD_CONTENT_SOLO, "padding-top"),
  headerTop: property(cardStyles, CARD_HEADER_PLAIN, "padding-top"),
};

/**
 * Resolve the four padding edges of a `CardContent` inside a compact AuthShell card, given the
 * service-theme overrides a consumer would put in their `theme.css` (they cascade in above `:root`).
 */
function compactAuthCardPadding(themeOverrides: Record<string, string> = {}) {
  const ambient = { ...ROOT, ...themeOverrides };
  const scoped = { ...ambient };
  for (const [name, value] of Object.entries(AUTH_CARD)) {
    scoped[name] = substitute(value, ambient);
  }
  return {
    inline: substitute(DECLARED.inline, scoped),
    blockEnd: substitute(DECLARED.blockEnd, scoped),
    blockStartSolo: substitute(DECLARED.blockStartSolo, scoped),
    headerTop: substitute(DECLARED.headerTop, scoped),
  };
}

describe("Card content padding is wired on two independent axes (gh#232)", () => {
  it("splits the inline column from the block shell edges in card-layout.css", () => {
    // Inline stays on the shared column token; every BLOCK edge reads the new knob with the column
    // as its call-site default, so a card that overrides neither is byte-identical to before.
    expect(DECLARED.inline).toBe("var(--card-space-inset)");
    for (const edge of [DECLARED.blockEnd, DECLARED.blockStartSolo, DECLARED.headerTop]) {
      expect(edge).toBe("var(--card-space-shell-y, var(--card-space-inset))");
    }
  });

  it("declares --card-space-shell-y `initial` so its default re-resolves at the call site", () => {
    // A `:root` binding to --card-space-inset would freeze at the :root inset and
    // `density="tight|cozy"` (which override the inset ON THE CARD) would stop reaching the block
    // axis — the same trap documented for role-mirror knobs in docs/TOKENS.md.
    expect(stripComments(cardTokens)).toMatch(/--card-space-shell-y:\s*initial;/);
    expect(ROOT["--card-space-shell-y"]).toBe("initial");
  });

  it("lets the density prop re-arm the block axis to its own card inset", () => {
    for (const density of ["tight", "cozy"] as const) {
      const rule = blockDeclarations(cardStyles, `[data-slot="card"][data-density="${density}"] {`);
      // Re-declared `initial` → falls back to THIS card's inset, so an explicit per-instance
      // density still beats an ambient shell-level block override, exactly as before gh#232.
      expect(rule["--card-space-shell-y"]).toBe("initial");
      expect(rule["--card-space-inset"]).toBe(`var(--space-${density === "tight" ? 3 : 5})`);
    }
  });
});

describe("AuthShell compact card — three knobs, three axes (gh#232)", () => {
  it("maps each public knob onto exactly one card token", () => {
    expect(AUTH_CARD["--card-space-inset"]).toBe("var(--auth-shell-compact-card-inset)");
    // Whitespace-tolerant: prettier may wrap the nested var() across lines.
    expect(AUTH_CARD["--card-space-shell-y"].replace(/\s*([(),])\s*/g, "$1")).toBe(
      "var(--auth-shell-card-padding-block-compact,var(--auth-shell-compact-card-inset))",
    );
    expect(AUTH_CARD["--card-space-body-y"]).toBe("var(--auth-shell-card-body-gap-compact)");
    expect(AUTH_CARD["--card-space-gap"]).toBe("var(--auth-shell-card-gap-compact)");
  });

  it("keeps the canonical default output backward compatible", () => {
    const { inline, blockEnd, blockStartSolo, headerTop } = compactAuthCardPadding();
    // Pre-gh#232 the compact card took --auth-shell-compact-card-inset (--space-6) on ALL four
    // edges because one token owned both axes. Unchanged: the block knob is `initial`, so every
    // block edge still resolves through the inline inset.
    const inset = substitute("var(--auth-shell-compact-card-inset)", ROOT);
    expect(inset).toBe(substitute("var(--space-6)", ROOT));
    expect(inline).toBe(inset);
    expect(blockEnd).toBe(inset);
    expect(blockStartSolo).toBe(inset);
    expect(headerTop).toBe(inset);
    expect(inline).not.toContain("UNRESOLVED");
  });

  it("keeps the header↔body gap on its own knob at the pre-gh#232 rhythm", () => {
    // It used to ride on --auth-shell-card-padding-block-compact; the value it produced (12px) is
    // preserved so no existing canonical screen shifts.
    expect(stripComments(shellTokens)).toMatch(
      /--auth-shell-card-body-gap-compact:\s*var\(--space-3\);/,
    );
    const gap = substitute(AUTH_CARD["--card-space-body-y"], ROOT);
    expect(gap).toBe(substitute("var(--space-3)", ROOT));
  });

  it("moves the BLOCK axis only when the block knob is overridden", () => {
    const base = compactAuthCardPadding();
    const tuned = compactAuthCardPadding({ "--auth-shell-card-padding-block-compact": "14px" });

    // This is the exact reproduction from the issue: the knob is set to 14px and CardContent's
    // block padding must follow, while the column stays put.
    expect(tuned.blockEnd).toBe("14px");
    expect(tuned.blockStartSolo).toBe("14px");
    expect(tuned.headerTop).toBe("14px");
    expect(tuned.inline).toBe(base.inline);
  });

  it("moves the INLINE axis only, leaving a tuned block padding untouched", () => {
    const tuned = compactAuthCardPadding({
      "--auth-shell-card-padding-block-compact": "14px",
      "--auth-shell-compact-card-inset": "20px",
    });

    expect(tuned.inline).toBe("20px");
    expect(tuned.blockEnd).toBe("14px");
    expect(tuned.blockStartSolo).toBe("14px");
  });

  it("still mirrors the inline inset on the block axis while the block knob is untouched", () => {
    // Documented default (not a leak): the block knob is `initial`, so its default resolves at the
    // call site against the LIVE inset — a service that only re-measures the column keeps a square
    // card, and a scoped [data-tenant] inset override drags the block default with it.
    const tuned = compactAuthCardPadding({ "--auth-shell-compact-card-inset": "20px" });
    expect(tuned.inline).toBe("20px");
    expect(tuned.blockEnd).toBe("20px");
  });

  it("declares the block knob `initial`, never a frozen :root literal", () => {
    expect(stripComments(shellTokens)).toMatch(
      /--auth-shell-card-padding-block-compact:\s*initial;/,
    );
    expect(ROOT["--auth-shell-card-padding-block-compact"]).toBe("initial");
  });
});
