#!/usr/bin/env node
/**
 * check:frame-token-scope — a token DECLARED somewhere the scope that needs it cannot reach.
 *
 * WHY THIS GATE EXISTS, AND WHY IT IS NOT ONE OF THE THREE THAT ALREADY RUN. Three guards stand
 * next to this defect and each of them walks past it:
 *
 *   • `check:token-tiers`          judges the NAME (`--{component}-{part}-{property}`) and the file
 *                                  it lives in. A name says nothing about where the value arrives.
 *   • `check:dist-tokens-resolve`  catches a `var()` with NO declaration ANYWHERE in the shipped
 *                                  CSS. These tokens ARE declared — just under a selector almost
 *                                  nothing matches (`--space-inline-xl`, declared only inside
 *                                  `.ui-scale-fixed`, gh#835).
 *   • `check:frame-token-wins`     catches a token the browser THROWS AWAY because a declaration
 *                                  outside `@layer components` outranks it (gh#822). These are
 *                                  never in the cascade to begin with.
 *
 * The gap between the three is exactly "declared, but not where it is needed", and it has shipped
 * FOUR times — the four cases this gate carries as its own fixtures (test/gates/…):
 *
 *   1. `--ring` read through a `:root` intermediate (gh#687). `--focus-outline-color:
 *      var(--focus-ring-color, var(--ring))` on `:root` substituted ONCE, on `<html>`, so every
 *      element inherited the ANSWER root gave. A `[data-tenant]` that re-seeded `--primary`/`--ring`
 *      moved every fill, border and link and left EVERY FOCUS RING on the old brand.
 *   2. `--control-surface-background` / `-border-color` / `--control-filled-background` bound to
 *      `var(--background)` / `var(--input)` at `:root`. A `Select` inside a `.dark` SUBTREE painted
 *      the frozen light surface under near-white ink — measured 1.05:1 — while the `Input` beside
 *      it was correctly dark.
 *   3. The whole `--font-size-*` ramp (gh#834). `--font-size-5xl: var(--font-size-display)` at
 *      `:root`: a showcase that scoped `--font-size-display` for an "80px hero via text-5xl"
 *      measured 54px, and `--font-size-lg` froze on `--font-size-base` identically.
 *   4. `--space-inline-xl` (gh#835), declared ONLY inside `.ui-scale-fixed`, so the documented
 *      `GapProp` member `Flex gap="xl"` painted `gap: normal` on an ordinary page.
 *
 * Cases 1-3 are the FREEZE half; case 4 is the REACH half. Both are the same sentence — the token
 * is declared somewhere the scope that needs it cannot reach — so they are one gate with two
 * stages rather than two gates with one preview server each.
 *
 * ── WHY A NEW GATE AND NOT A SECOND MODE OF check:frame-token-wins ────────────────────────────
 * They share a preview server, a Chromium and the frame list, and nothing else:
 *
 *   • DIFFERENT INSTRUMENT. frame-token-wins asks CDP `CSS.getMatchedStylesForNode` which
 *     declarations the cascade discarded — ~60ms and ~930KB per element, which is why it has a
 *     prefilter. This gate asks `getComputedStyle().getPropertyValue()`, which is free, and for
 *     the FREEZE stage it asks it on a probe element it creates itself. Folding the two together
 *     would put a mutation (setting a token on an injected scope) inside a sweep whose whole
 *     premise is that the page is untouched.
 *   • DIFFERENT SHAPE OF WORK. FREEZE needs NO frames at all: the token tier is the same
 *     stylesheet on every route, so it is one page load and a few hundred property reads —
 *     seconds. Folded into frame-token-wins it would have paid for 192 navigations it does not
 *     need, or run once inside a loop and read as if it had swept.
 *   • DIFFERENT VERDICT AND BASELINE. "this knob never arrives" and "this knob arrives and loses"
 *     are repaired differently (declare it at the tier / move the formula to the call site vs drop,
 *     chain or accept the losing declaration), so one failure message cannot serve both, and one
 *     baseline cannot either — an entry fixed here must not read as fixed there.
 *
 * The honest cost of that decision: REACH sweeps the 192 frames a second time, ~10 minutes, which
 * is why it is wired into `ci-browser-full.yml` beside gh#822's sweep and NOT into the 5-minute
 * merge lane.
 *
 * ── STAGE 1 · REACH ───────────────────────────────────────────────────────────────────────────
 * For every rule `S { p: var(--t) }` where the `var()` carries NO FALLBACK and `--t` is not
 * declared on a ROOT selector, visit every element matching `S` on every frame and ask the browser
 * what `--t` computes to THERE. Empty means the declaration paints the property's initial value —
 * `gap: normal` for gh#835 — and the author who wrote a documented vocabulary member got nothing.
 *
 * THE "NO FALLBACK" CLAUSE IS THE WHOLE FILTER, and it is not a convenience. `var(--x, <default>)`
 * is this repo's DOCUMENTED shape for a knob that is deliberately empty (docs/TOKENS.md, the
 * `initial` rule): an `initial` knob MUST compute to nothing, and its reader MUST carry the
 * default. Reporting those would report the fix as the defect. A BARE `var(--x)` is the opposite
 * statement: the author asserted the token is always there.
 *
 * ── STAGE 2 · FREEZE ──────────────────────────────────────────────────────────────────────────
 * A custom property substitutes its `var()`s AT THE ELEMENT THAT DECLARES IT. So `:root { --a:
 * var(--seed) }` computes once, on `<html>`, and a scope below it that re-declares `--seed`
 * inherits the answer root already gave. The probe is the issue's own proposal, mechanically:
 * append a `<div>` to `<body>`, set ONE seed on it to a sentinel, and read every token whose own
 * declaration reads that seed. A token whose computed value on the probe equals its value on
 * `<html>` did not follow the scope. It is FROZEN.
 *
 * WHICH TOKENS COUNT AS A SEED — never a hand-kept list alone, because a hand-kept list is how
 * `--font-size-*` was missed for three releases. Two sources, unioned:
 *   (a) EMPIRICAL — any token this library's own CSS re-declares under a NON-root selector while
 *       also declaring it at root. `.dark { --background: … }` makes `--background` a seed by
 *       construction, which is what makes fixture 2 unmissable.
 *   (b) DOCUMENTED — `docs/CUSTOMER-THEMING.md`'s level-1 seeds and level-3 scoped roles, listed
 *       in `DOCUMENTED_SEEDS` below. `--font-size-base` is here and not in (a): nothing in the
 *       library re-scopes it, and the promise that it may be re-scoped is made by the docs.
 *
 * ONLY THE DIRECT READER IS REPORTED. If `--font-size-lg` freezes on `--font-size-base` then every
 * token reading `--font-size-lg` is frozen too, transitively, and reporting the closure turns one
 * broken promise into forty. The entry is the EDGE: the token whose own declaration text names the
 * seed.
 *
 * ── THE BASELINE, AND WHY ITS KEY CARRIES NO MEASUREMENT ──────────────────────────────────────
 * `preview/frame-overflow.baseline.json` keyed its first entries on a pixel amount and every known
 * entry read as NEW on the first CI run, because rasterisation differs per machine. Identity here
 * is the ARRANGEMENT and nothing else:
 *     REACH   `property · token · selector`
 *     FREEZE  `token ← seed`
 * No frame, no element, no value. `seenOn` carries a frame and an element beside the key so a
 * finding is still locatable, and it moving is visible in the diff rather than silently retiring
 * an entry. `entries` is DEBT and may only SHRINK; the gate fails on anything new.
 *
 * WHAT THIS CANNOT SEE — read before trusting a green run:
 *   1. ONLY WHAT THE FRAMES RENDER. REACH needs an element matching the selector; a rule no
 *      example exercises is not covered. `check:frame-coverage` tracks that.
 *   2. FREEZE READS THE TIER, NOT THE PAINT. It proves the token's VALUE follows a scope. Whether
 *      the element then paints it is `check:frame-token-wins`'s question.
 *   3. ONE VIEWPORT for REACH's element set (1280px). A selector that only matches narrower is
 *      not visited. `check:frame-geometry` is the gate that walks viewports.
 *
 * Usage: node scripts/check-frame-token-scope.mjs [--update-baseline] [--report] [--freeze-only]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { DEFAULT_BASE, REPO_ROOT, resolveChromiumExecutable } from "./frame-harness.mjs";

const base = process.argv.find((a) => a.startsWith("http")) ?? DEFAULT_BASE;
const UPDATE = process.argv.includes("--update-baseline");
const REPORT = process.argv.includes("--report");
const FREEZE_ONLY = process.argv.includes("--freeze-only");
const BASELINE = path.join(REPO_ROOT, "preview/frame-token-scope.baseline.json");

/**
 * THE THEME ROLES ARE DERIVED, NOT LISTED (gh#854).
 *
 * This was a hand-kept array of 18 names, and it was missing 18 of the 36 roles the dark theme
 * actually re-declares — among them `--muted-foreground`, `--secondary`, `--secondary-foreground`,
 * `--popover-foreground` and `--warning`. Anything bound to one of those was filtered out by the
 * tier clause below (`!COLOUR.has(seed) && componentTier.has(token)`) and never reached the
 * baseline, so **14 real freeze instances were invisible to the gate that exists to find them** —
 * including four in `segmented.css`, two of them beside the pair gh#848 had just fixed.
 *
 * The header of this file already warned about exactly this shape: a hand-kept list is how the
 * `--font-size-*` ramp went unseen for three releases. It was the colour half's turn.
 *
 * So the theme half is now READ from `foundation.css`'s dark block. A role added there tomorrow
 * seeds this gate for free and cannot be forgotten by someone who does not know it exists — the
 * same move `scripts/regen-generated.mjs` makes for generators.
 */
function darkThemeRoles() {
  const css = readFileSync(path.join(REPO_ROOT, "src/tokens/foundation.css"), "utf8");
  const lines = css.split("\n");
  const open = lines.findIndex((line) =>
    /^\s*(\.dark|:root\[data-theme="dark"\])\s*,?\s*$/.test(line),
  );
  if (open === -1) {
    throw new Error(
      "check:frame-token-scope: could not find the dark theme block in foundation.css.\n" +
        "  The seeds are derived from it, so an empty set would silently pass everything. Refusing.",
    );
  }
  const roles = new Set();
  let depth = 0;
  let started = false;
  for (let i = open; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.includes("{")) {
      depth += 1;
      started = true;
    }
    if (started && depth > 0) {
      const match = line.match(/^\s*(--[a-z0-9-]+)\s*:/);
      if (match) roles.add(match[1]);
    }
    if (line.includes("}")) {
      depth -= 1;
      if (started && depth <= 0) break;
    }
  }
  if (roles.size === 0) {
    throw new Error("check:frame-token-scope: the dark theme block declared no roles. Refusing.");
  }
  return roles;
}

/**
 * Re-scopable but NOT by the theme — a consumer moves these under `[data-tenant]`, and the dark
 * block has no opinion on them, so deriving alone would drop them. Kept explicit and small, with
 * the reason, rather than folded into a list that hides which half is which.
 */
const TENANT_ONLY_SEEDS = [
  "--ring",
  "--shadow-color",
  "--focus-ring-color",
  "--text-primary",
  "--text-link",
  "--text-brand",
];

export const COLOUR_SEEDS = [...new Set([...darkThemeRoles(), ...TENANT_ONLY_SEEDS])].sort();

/**
 * The non-colour seeds. A RATIO is deliberately absent: `--font-size-ratio` and
 * `--font-size-display-ratio` never appear in a formula without the base they scale, so every edge
 * they would add is already reported through that base — measured, listing them doubled the type
 * findings from 115 to 230 and told nobody anything new.
 */
export const SIZE_SEEDS = ["--radius", "--scaling", "--font-size-base", "--font-size-display"];

const DOCUMENTED_SEEDS = [...COLOUR_SEEDS, ...SIZE_SEEDS, "--font-family-sans"];
const COLOUR = new Set(COLOUR_SEEDS);

/**
 * A selector that is a CONSUMER-FACING theme scope, and therefore makes anything it re-declares a
 * seed by construction. This is deliberately NOT "any non-root selector".
 *
 * Measured: "any non-root selector" makes `--space-1 … --space-24` seeds, because
 * `.ui-density-comfortable` and `.ui-scale-fixed` re-declare the linear spacing grid, and the
 * report goes from 30-odd findings to **631** — every `--upload-row-space-inline: var(--space-3)`
 * in the library at once. Those ARE frozen with respect to `.ui-scale-fixed`, and that is a real
 * and much larger defect (a fixed-scale band inside a comfortable density inherits the SCALED
 * step); it is also a different question from "may a consumer re-theme this", it is invisible at
 * the default density, and 631 lines is a landfill rather than a gate — the lesson
 * check:frame-overflow learned at 422 findings of which 420 were `sr-only`. It is named here
 * rather than filtered silently, so whoever takes it on knows the number they are starting from.
 */
export const THEME_SCOPE = /\.dark\b|\[data-theme|\[data-tenant|\[data-brand|\[data-program/;

/**
 * Properties that are not this library's tier at all.
 *
 * `--tw-*` are Tailwind's own registered properties, composed by its utilities, and they surface
 * here only because a focus utility reads `--primary`. `--radix-*` are set by Radix ON THE ELEMENT
 * AT RUNTIME when an overlay opens (`--radix-dropdown-menu-content-available-height`), so they are
 * legitimately empty on a closed menu and nothing in this repo declares them. Neither is a knob
 * anyone was promised.
 */
const FOREIGN = /^--(tw|radix)-/;

/** A sentinel no token in this library could already hold, valid as a custom-property value. */
const SENTINEL = "987.654321px";

/**
 * The COMPONENT tier, read from `src/tokens/components/*.css` — the names only, and from disk
 * because the page's compiled CSS has long since forgotten which file a declaration came from.
 *
 * WHY THE TIER DECIDES WHAT IS REPORTED. Practically every component token in this library mirrors
 * a foundation step at `:root` — `--badge-font-size: var(--font-size-xs)`, `--tooltip-font-size`,
 * `--table-head-font-size`, two hundred and thirty of them. Every one is frozen with respect to a
 * scoped `--font-size-base`, and reporting all of them says "the library is wrong" rather than
 * naming a defect anyone can act on; at 341 entries the baseline would be four times the size of
 * the largest one in this repo and a new line would be invisible in it.
 *
 * docs/TOKENS.md already draws the line this gate needs, in the `initial` rule itself: colour,
 * fill, border and shadow knobs whose default is a role token ALWAYS need the call-site shape —
 * "under a dark theme this is glaring, under a light theme it hides silently" — while "pure
 * non-colour knobs (spacing, radius, font-size) don't need this" UNLESS their default is a token
 * some scope re-declares. So:
 *
 *   • a COLOUR seed freezes a knob in ANY tier      → reported (fixtures 1 and 2)
 *   • a SIZE seed freezes a knob in its OWN tier     → reported (fixture 3: the ramp on its base)
 *   • a SIZE seed freezes a COMPONENT knob           → NOT reported; that is the tier's shape, and
 *                                                      it is the next tranche of this work, named
 *                                                      here rather than filtered silently.
 */
export function componentTierTokens() {
  const dir = path.join(REPO_ROOT, "src/tokens/components");
  const names = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".css")) continue;
    const css = stripComments(readFileSync(path.join(dir, file), "utf8"));
    for (const [, name] of css.matchAll(/^\s*(--[\w-]+)\s*:/gm)) names.add(name);
  }
  return names;
}

/** Every docs frame, derived the way the preview derives its route id — never a hand-kept list. */
function frameRoutes() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return e.name.endsWith(".tsx") && !e.name.startsWith("_") ? [full] : [];
    });
  return walk(path.join(REPO_ROOT, "docs"))
    .map((f) => path.relative(path.join(REPO_ROOT, "docs"), f).replace(/\.tsx$/, ""))
    .filter((rel) => !rel.startsWith("showcase/"))
    .map((rel) => rel.replace(/\//g, "-").toLowerCase())
    .sort();
}

/**
 * Runs INSIDE the page. Returns the page's stylesheet TEXT, not its CSSOM.
 *
 * The CSSOM was the first version and it lied: on a 1.4 MB inline sheet, `rule.style` enumerated
 * 253 of the 365 declarations its own `cssText` carried, so `--centered-shell-width-md: 46rem`
 * read as "declared NOWHERE" while `getComputedStyle` cheerfully returned `46rem`. A gate that
 * reports a token as missing because the browser's own object model dropped it is worse than no
 * gate. Text is what the browser parsed; parse the same thing.
 */
const STYLESHEET_TEXT = async () => {
  const parts = [];
  for (const el of document.querySelectorAll("style")) parts.push(el.textContent ?? "");
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    try {
      parts.push(await (await fetch(link.href)).text());
    } catch {
      /* a sheet we cannot read is a sheet we cannot judge */
    }
  }
  return parts.join("\n");
};

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * A tolerant brace walker: every declaration in the sheet, with the selector chain that carries
 * it. Not a CSS parser — it does not need to be. It needs the property, the value, and whether the
 * thing it sits in is `:root`.
 *
 * @returns {{ selector: string, atRules: string[], prop: string, value: string }[]}
 */
export function declarations(css) {
  const out = [];
  const stack = [];
  let buf = "";
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      stack.push(buf.trim().replace(/\s+/g, " "));
      buf = "";
      continue;
    }
    if (ch === "}") {
      pushDecl();
      stack.pop();
      buf = "";
      continue;
    }
    if (ch === ";") {
      pushDecl();
      buf = "";
      continue;
    }
    buf += ch;
  }
  return out;

  function pushDecl() {
    const text = buf.trim();
    if (!text || text.startsWith("@")) return;
    const colon = text.indexOf(":");
    if (colon < 1) return;
    const prop = text.slice(0, colon).trim();
    /* A selector never reaches here as a declaration — a prelude is flushed by `{`, not by `;`. */
    if (/[{}]/.test(prop) || /\s/.test(prop)) return;
    const atRules = stack.filter((s) => s.startsWith("@"));
    const selectors = stack.filter((s) => !s.startsWith("@"));
    if (!selectors.length) return;
    out.push({
      selector: resolveNesting(selectors),
      atRules,
      prop,
      value: text.slice(colon + 1).trim(),
    });
  }
}

/** `&`-aware descendant join. Deep or exotic nesting is left as-is; REACH simply skips it. */
function resolveNesting(selectors) {
  return selectors.reduce((parent, child) =>
    child.includes("&") ? child.replaceAll("&", parent) : `${parent} ${child}`,
  );
}

/**
 * Does this selector list put the declaration on the document root?
 *
 * `:root`, `html`, `:root[data-theme="dark"]`, `.dark, :root[data-theme="dark"]` — yes. `:root
 * .ui-card` — NO, and the lookahead exists to say so: a descendant of the root is a scope like any
 * other, and counting it as root is how an unreachable token would read as declared.
 */
const ROOTISH = /(^|,\s*)(:root|html)(?=$|[,:[])/;
const isRoot = (selector) => ROOTISH.test(selector);

/** The guaranteed-invalid value docs/TOKENS.md prescribes for a knob with a call-site default. */
const isInitial = (value) => /^initial$/i.test(String(value ?? "").trim());

const VAR_RE = /var\(\s*(--[\w-]+)\s*([,)])/g;
/** Tokens a value reads, split by whether the `var()` carried a fallback. */
function varsIn(value) {
  const bare = [];
  const guarded = [];
  for (const [, token, close] of String(value ?? "").matchAll(VAR_RE))
    (close === "," ? guarded : bare).push(token);
  return { bare, guarded, all: [...bare, ...guarded] };
}

/** The static half: what is declared where, who reads what bare, and which tokens are seeds. */
export function analyse(css, componentTier = new Set()) {
  const decls = declarations(stripComments(css));
  const rootDeclared = new Map(); // token -> declaration text at a root selector
  const scopeDeclared = new Map(); // token -> the non-root selector PARTS that re-declare it
  /* CLASSIFIED PER SELECTOR PART, not per rule. `.dark, :root[data-theme="dark"]` declares the
   * same token at the root AND in a subtree, and judging the rule as a whole threw the subtree
   * half away — which made `--background` invisible as a scope re-declaration (fixture 2's whole
   * mechanism) and made the density tier read as frozen on `--scaling` even though
   * `.ui-density-comfortable` re-derives the grid inside itself. */
  for (const d of decls) {
    if (!d.prop.startsWith("--")) continue;
    for (const raw of d.selector.split(",")) {
      const part = raw.trim();
      if (!part) continue;
      if (isRoot(part)) rootDeclared.set(d.prop, d.value);
      else {
        if (!scopeDeclared.has(d.prop)) scopeDeclared.set(d.prop, new Set());
        scopeDeclared.get(d.prop).add(part);
      }
    }
  }

  /* REACH candidates: a BARE var() on a token no root selector gives a VALUE to.
   *
   * An `initial` knob counts as undeclared here on purpose. That is the documented cure, and a
   * bare read of one paints nothing at all — "silent and total", as the gh#664 call-site test puts
   * it. Applying the cure and missing one reader is the likeliest way to ship this defect, so the
   * gate has to be able to see it. */
  const candidates = new Map();
  for (const d of decls) {
    if (d.selector.split(",").every((part) => isRoot(part.trim()))) continue;
    for (const token of varsIn(d.value).bare) {
      if (FOREIGN.test(token)) continue;
      if (rootDeclared.has(token) && !isInitial(rootDeclared.get(token))) continue;
      /* A token the same rule sets on the same element is a local alias, not a tier read. */
      const key = `${d.prop} · ${token} · ${d.selector}`;
      if (!candidates.has(key)) candidates.set(key, { prop: d.prop, token, selector: d.selector });
    }
  }

  /* FREEZE seeds: documented, plus anything the library re-declares under a THEME scope. */
  const seeds = new Set(DOCUMENTED_SEEDS.filter((s) => rootDeclared.has(s)));
  for (const [token, parts] of scopeDeclared)
    if (rootDeclared.has(token) && [...parts].some((p) => THEME_SCOPE.test(p))) seeds.add(token);

  /* FREEZE edges: a root-declared token whose OWN text names a seed. `initial` is the documented
   * cure, not a defect — a knob with no value has nothing to freeze. */
  const edges = [];
  for (const [token, value] of rootDeclared) {
    if (isInitial(value) || FOREIGN.test(token)) continue;
    const restatedBy = scopeDeclared.get(token) ?? new Set();
    for (const seed of new Set(varsIn(value).all)) {
      if (seed === token || !seeds.has(seed)) continue;
      /* THE TIER MAY ANSWER FOR ITSELF. `--space-1: calc(0.25rem * var(--scaling))` is frozen with
       * respect to `--scaling` — and `.ui-density-comfortable` re-states the ENTIRE linear grid
       * inside itself, on the same selector that flips `--scaling`, precisely so it does not have
       * to rely on inheritance. The probe is a naked `<div>` matching no such rule, so without
       * this clause the gate reports the repair as the defect, thirty times over.
       *
       * The overlap has to be on the SELECTOR, not merely "is re-declared somewhere": `.ui-auth-
       * shell[data-preset="login"]` re-points `--heading-h1` to its own heading size and says
       * nothing about `--font-size-base`, so that re-declaration must NOT excuse h1 from following
       * a scoped type scale. Selector parts, because the two rules that make density work are
       * spelled `.ui-density-comfortable, :root[data-density="comfortable"]` and
       * `.ui-density-compact, .ui-density-default, .ui-density-comfortable` — different strings,
       * overlapping sets. */
      const seedRestatedBy = scopeDeclared.get(seed) ?? new Set();
      if ([...restatedBy].some((p) => seedRestatedBy.has(p))) continue;
      /* See `componentTierTokens` for the measurement behind this clause. */
      if (!COLOUR.has(seed) && componentTier.has(token)) continue;
      edges.push({ token, seed });
    }
  }
  return { decls: decls.length, rootDeclared, scopeDeclared, candidates, seeds, edges };
}

/** Runs INSIDE the page. One seed at a time on a probe scope; which dependents did not follow. */
const PROBE_FREEZE = (edges) => {
  const probe = document.createElement("div");
  probe.setAttribute("data-token-scope-probe", "");
  document.body.appendChild(probe);
  const rootStyle = getComputedStyle(document.documentElement);
  const probeStyle = getComputedStyle(probe);

  const bySeed = new Map();
  for (const { token, seed, sentinel } of edges) {
    if (!bySeed.has(seed)) bySeed.set(seed, { sentinel, tokens: [] });
    bySeed.get(seed).tokens.push(token);
  }
  const frozen = [];
  for (const [seed, { sentinel, tokens }] of bySeed) {
    probe.style.setProperty(seed, sentinel);
    for (const token of tokens) {
      const atRoot = rootStyle.getPropertyValue(token).trim();
      const inScope = probeStyle.getPropertyValue(token).trim();
      if (atRoot === inScope) frozen.push({ token, seed, value: atRoot });
    }
    probe.style.removeProperty(seed);
  }
  probe.remove();
  return frozen;
};

/** Runs INSIDE the page. Which REACH candidates have a live element where the token is empty. */
const PROBE_REACH = (candidates) => {
  const hits = [];
  for (const { prop, token, selector } of candidates) {
    let matches;
    try {
      matches = document.querySelectorAll(selector);
    } catch {
      continue; // a selector this engine will not parse standalone
    }
    for (const el of matches) {
      if (getComputedStyle(el).getPropertyValue(token).trim()) continue;
      const classes = [...el.classList].filter((c) => /^(ui|sb)-/.test(c)).sort();
      hits.push({
        prop,
        token,
        selector,
        el: el.localName + (classes.length ? `.${classes.join(".")}` : ""),
      });
      break; // one witness is enough; the entry is the arrangement, not the element
    }
  }
  return hits;
};

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn("⚠ check:frame-token-scope skipped — playwright not installed (browser gate).");
    return;
  }
  const { ensurePreviewServer } = await import("./frame-harness.mjs");
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`⚠ check:frame-token-scope skipped — ${e.message}.`);
    return;
  }

  const exec = resolveChromiumExecutable();
  const browser = await chromium.launch(exec && existsSync(exec) ? { executablePath: exec } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

  const routes = frameRoutes();
  const seenOn = {};
  const keys = new Set();
  let asked = 0;
  let missing = 0;

  /* ── STAGE 2 · FREEZE — one page, because the token tier is the same sheet on every route. */
  await page.goto(`${base}/isolate/${routes[0]}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(250);
  const css = await page.evaluate(STYLESHEET_TEXT);
  const model = analyse(css, componentTierTokens());
  const frozen = await page.evaluate(
    PROBE_FREEZE,
    model.edges.map((e) => ({ ...e, sentinel: SENTINEL })),
  );
  for (const f of frozen) {
    const key = `FREEZE · ${f.token} ← ${f.seed}`;
    keys.add(key);
    seenOn[key] ??= `${routes[0]} · :root = ${f.value.slice(0, 40) || "(empty)"}`;
  }

  /* ── STAGE 1 · REACH — needs a real element, so it needs the frames. */
  const candidates = [...model.candidates.values()];
  if (!FREEZE_ONLY) {
    for (const id of routes) {
      try {
        await page.goto(`${base}/isolate/${id}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(150);
        /* A route that does not resolve renders a four-word "not found" card, which matches no
         * component selector and would read as clean — the way check:contrast once swept two
         * showcases that were never there. */
        if (await page.evaluate(() => /Preview not found/.test(document.body.innerText))) {
          missing += 1;
          continue;
        }
        const hits = await page.evaluate(PROBE_REACH, candidates);
        asked += 1;
        for (const h of hits) {
          const key = `REACH · ${h.prop} · ${h.token} · ${h.selector}`;
          keys.add(key);
          const where = `${id} · ${h.el}`;
          if (!seenOn[key] || where < seenOn[key]) seenOn[key] = where;
        }
      } catch (e) {
        console.warn(`  ! ${id}: ${e.message.slice(0, 80)}`);
      }
    }
  }
  await browser.close();
  await stopServer?.();

  /* INTENTIONAL — the third verdict, and the only permanent one (check:frame-token-wins, same
   * shape and the same reason). Some of what this gate sees is correct BY DESIGN: gh#831's glass
   * bar expresses "off" as an EMPTY knob, `backdrop-filter: blur(var(--topbar-backdrop-blur-size))`
   * with nothing to substitute, and `src/styles/__tests__/topbar-glass.test.ts` asserts the reader
   * carries no fallback on purpose. Left in `entries` that is a debt nobody can ever pay; stripped
   * out silently it could come back as a real defect unnoticed. Keyed exactly like `entries` and
   * carrying the REASON, so the gate keeps watching the arrangement while the list of owed work
   * stays honest. Adding a line here is a judgement a human writes down; the script never invents
   * one. */
  const intentional = existsSync(BASELINE)
    ? (JSON.parse(readFileSync(BASELINE, "utf8")).intentional ?? {})
    : {};
  for (const k of Object.keys(intentional)) keys.delete(k);

  const flat = [...keys].sort();
  const summary =
    `${model.decls} declaration(s) parsed · ${model.seeds.size} seed(s) · ` +
    `${model.edges.length} root edge(s) · ${candidates.length} bare-read candidate(s) · ` +
    `${asked} frame(s) swept${missing ? `, ${missing} did not resolve` : ""}`;

  if (REPORT) {
    for (const f of flat) console.log(`${f}\n    seen on: ${seenOn[f]}`);
    for (const [k, why] of Object.entries(intentional))
      console.log(`${k}\n    INTENTIONAL: ${why}`);
    console.log(`\n${summary} → ${flat.length} finding(s).`);
    return;
  }

  if (UPDATE) {
    /* PRESERVE WHAT A HUMAN WROTE — `note` and `tracked` survive regeneration, so whoever fixes an
     * entry does not have to restore the issue link by hand (check:frame-token-wins, same shape). */
    const existing = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};

    /* THE BASELINE SAID "MAY ONLY SHRINK" AND NOTHING ENFORCED IT (gh#854).
     *
     * The note has always declared the rule; this path rewrote the file unconditionally, so
     * `--update-baseline` would happily absorb a regression someone had just introduced. A rule
     * stated in prose and not in code is a rule until somebody is in a hurry.
     *
     * Growth is legitimate in exactly one case — the GATE widened, so defects that already existed
     * became visible. That is a different act from accepting new debt and should have to say so:
     * `--accept-growth` with the reason going into `tracked` by hand. Anything else is refused. */
    const priorEntries = Array.isArray(existing.entries) ? existing.entries : [];
    const grew = flat.filter((f) => !priorEntries.includes(f));
    if (grew.length > 0 && !process.argv.includes("--accept-growth")) {
      console.error(
        `✗ refusing to grow the baseline: ${priorEntries.length} → ${flat.length} ` +
          `(+${grew.length}).\n` +
          "  This list is DEBT and its own note says it may only SHRINK, so a bigger number is\n" +
          "  either a regression you are about to absorb, or a gate you just widened.\n\n" +
          grew.map((f) => `    + ${f}`).join("\n") +
          "\n\n  If you widened the gate, re-run with --accept-growth and record WHY in `tracked`.\n" +
          "  If you did not, these are new findings: fix them.",
      );
      process.exit(1);
    }
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          note:
            existing.note ??
            "Tokens declared somewhere the scope that needs them cannot reach. FREEZE: a `:root` " +
              "declaration that reads a re-scopable seed substitutes once on <html>, so a scope " +
              "below it inherits the answer root gave — the cure is `--x: initial` with the " +
              "formula at the call site (docs/TOKENS.md). REACH: a bare `var(--t)` on an element " +
              "where --t computes to nothing, because --t is declared only under a selector that " +
              "element is not inside. Every entry is DEBT and the list may only SHRINK; the gate " +
              "fails on anything new. Keyed on the ARRANGEMENT and never on a frame, an element " +
              "or a measured value — a pixel in the key makes every known entry read as new on a " +
              "different renderer (preview/frame-overflow.baseline.json learned that the hard " +
              "way). `seenOn` is where to go and look.",
          ...(existing.tracked ? { tracked: existing.tracked } : {}),
          count: flat.length,
          entries: flat,
          ...(Object.keys(intentional).length ? { intentional } : {}),
          seenOn,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`✓ baseline written — ${flat.length} finding(s). ${summary}.`);
    return;
  }

  const prior = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : { entries: [] };
  const known = new Set(prior.entries);
  const added = flat.filter((f) => !known.has(f));
  const fixed = prior.entries.filter((f) => !flat.includes(f));

  if (added.length) {
    console.error(`✗ check:frame-token-scope — ${added.length} NEW unreachable token(s):\n`);
    for (const a of added) console.error(`  ${a}\n      seen on: ${seenOn[a]}`);
    console.error(
      `\nFREEZE · <token> ← <seed>: the token's ':root' declaration reads a seed a consumer may ` +
        `re-scope, so it computes once on <html>. Declare the token 'initial' and move its ` +
        `formula to the call site as a var() FALLBACK, where it re-resolves under any scope ` +
        `(docs/TOKENS.md · "Role-mirror knobs MUST be initial"). ` +
        `\nREACH · <property> · <token> · <selector>: the element matching that selector is not ` +
        `inside the scope that declares the token, so the declaration paints the property's ` +
        `INITIAL value. Declare the token at the tier its readers live in, or give the reader a ` +
        `fallback if it is meant to be optional.\n${summary}.`,
    );
    process.exit(1);
  }
  console.log(
    `✓ check:frame-token-scope — ${summary}, ${flat.length} known finding(s)` +
      `${fixed.length ? `, ${fixed.length} FIXED since the baseline (run --update-baseline to bank it)` : ""}.`,
  );
}

/* Importable: the fixture suite in src/test/__tests__ feeds synthetic stylesheets through
 * `analyse()` to prove the gate still reproduces the four defects that motivated it. Only the
 * CLI entry point drives a browser. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
