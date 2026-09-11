import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo, logoGlyphAdvance } from "../logo";

/**
 * REGRESSION GATE — gh#377. A mark must stay INSIDE its own box.
 *
 * THE DEFECT. `.ui-logo` is a fixed square and the glyph was set at a fixed per-tier font-size,
 * so nothing related the string's inline ADVANCE to the box it had to fit in. `東京` at `xs` wants
 * 2em against a 20px box holding 1.80em, and CJK offers a break opportunity between every pair of
 * ideographs, so the mark WRAPPED onto two lines: measured, the glyph occupied 22.22px of a 20px
 * box, with 1.88px of ink below it. The fit cap fixed that — and then under-stated the advance in
 * two more places, so marks it was supposed to be fitting still spilled:
 *
 *   ·  ONE constant for every proportional form. `W` measures 1.058em on Hiragino Sans — WIDER
 *      than a kanji — against a 0.81em model, so `WW` at `xs` painted 23.50px of ink in a 20px
 *      box (3.50px out, 17.5% of the box).
 *   ·  WHITE SPACE dropped from the count while `white-space: nowrap` still PAINTS it. `東 京` —
 *      the issue's own two kanji with a space — modelled 2.000em and painted up to 2.333em, so it
 *      spilled 2.63px at `md`, on every face, at every tier.
 *
 * HOW THIS IS MEASURED. The `MEASURED_ADVANCE` table below is real paint, not font metrics: a DOM
 * advance read at 200px under the shipped `white-space: nowrap`, in Chromium, after
 * `document.fonts.ready`, across the four faces gh#370 used. A canvas `fillText` is NOT usable
 * here — it silently substitutes a fallback face for a webfont, so it measures a different font
 * than the DOM paints. The wrap and the spill were confirmed separately by rasterising the painted
 * element at 8x and scanning its alpha bounding box (480 cells, 4 faces × 4 tiers × 30 strings):
 * 66 cells wrapped and 20 spilled up to 3.50px before, 0 and 0 after.
 *
 * WHAT THE TEST DOES. It re-derives the SHIPPED arithmetic — the token constants out of
 * `tokens/components/logo.css`, the winning `font-size` declaration per tier out of
 * `styles/logo-layout.css` (resolved by real cascade rules), and the class counts out of the real
 * `logoGlyphAdvance()` — and asserts the one thing a user can see: fitted font-size × painted
 * advance ≤ the box. Nothing is hard-coded that the stylesheets already state, so a change to the
 * type scale, the box ramp, the fit cap or any class constant is re-tested rather than assumed.
 */

/** Root font size the rem-valued tokens resolve against (`html` default; the library sets none). */
const ROOT_FONT_SIZE_PX = 16;

const tokenCss = readFileSync(resolve(process.cwd(), "src/tokens/components/logo.css"), "utf8");
const foundationCss = readFileSync(resolve(process.cwd(), "src/tokens/foundation.css"), "utf8");
const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/logo-layout.css"), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Every `--name: value` declaration in a stylesheet, last one winning. */
function customProperties(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi)) {
    out[match[1]] = match[2].trim();
  }
  return out;
}

const VARS = { ...customProperties(foundationCss), ...customProperties(tokenCss) };

/* ── A CSS value evaluator, just wide enough for the shipped declarations ──────────────────────
 * `min()`, `max()`, `calc()`, `var()` with a fallback, `+ - * /`, and `rem`/`px` lengths. Values
 * are carried in px (unitless numbers stay unitless), which is exactly how the fit formula mixes
 * them: a box length times a unitless share divided by a unitless advance. */

type Token = { kind: "number" | "ident" | "punct"; text: string; value?: number };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const rest = input.slice(i);
    if (/^\s/.test(rest)) {
      i += 1;
      continue;
    }
    const number = /^-?\d*\.?\d+(rem|px)?/.exec(rest);
    if (number) {
      const raw = parseFloat(number[0]);
      const unit = number[1];
      tokens.push({
        kind: "number",
        text: number[0],
        value: unit === "rem" ? raw * ROOT_FONT_SIZE_PX : raw,
      });
      i += number[0].length;
      continue;
    }
    const ident = /^(--)?[a-z][a-z0-9-]*/i.exec(rest);
    if (ident) {
      tokens.push({ kind: "ident", text: ident[0] });
      i += ident[0].length;
      continue;
    }
    tokens.push({ kind: "punct", text: rest[0] });
    i += 1;
  }
  return tokens;
}

class Evaluator {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly vars: Record<string, string>,
    private readonly overrides: Record<string, number>,
  ) {}

  static run(expression: string, vars: Record<string, string>, overrides: Record<string, number>) {
    const evaluator = new Evaluator(tokenize(expression), vars, overrides);
    return evaluator.expression();
  }

  private peek() {
    return this.tokens[this.position];
  }

  private take(text?: string) {
    const token = this.tokens[this.position];
    if (text !== undefined && token?.text !== text) {
      throw new Error(`expected "${text}", found "${token?.text ?? "<end>"}"`);
    }
    this.position += 1;
    return token;
  }

  private expression(): number {
    let value = this.term();
    for (;;) {
      const next = this.peek();
      if (next?.text !== "+" && next?.text !== "-") return value;
      this.take();
      value = next.text === "+" ? value + this.term() : value - this.term();
    }
  }

  private term(): number {
    let value = this.factor();
    for (;;) {
      const next = this.peek();
      if (next?.text !== "*" && next?.text !== "/") return value;
      this.take();
      value = next.text === "*" ? value * this.factor() : value / this.factor();
    }
  }

  private factor(): number {
    const token = this.peek();
    if (!token) throw new Error("unexpected end of expression");
    if (token.kind === "number") {
      this.take();
      return token.value as number;
    }
    if (token.text === "(") {
      this.take("(");
      const value = this.expression();
      this.take(")");
      return value;
    }
    if (token.kind !== "ident") throw new Error(`unexpected "${token.text}"`);
    this.take();
    const name = token.text;
    this.take("(");
    if (name === "var") {
      const variable = this.take().text;
      let fallback: number | undefined;
      if (this.peek()?.text === ",") {
        this.take(",");
        fallback = this.expression();
      }
      this.take(")");
      if (variable in this.overrides) return this.overrides[variable];
      const declaration = this.vars[variable];
      if (declaration !== undefined) return Evaluator.run(declaration, this.vars, this.overrides);
      if (fallback !== undefined) return fallback;
      throw new Error(`unresolved ${variable}`);
    }
    const args = [this.expression()];
    while (this.peek()?.text === ",") {
      this.take(",");
      args.push(this.expression());
    }
    this.take(")");
    if (name === "calc") return args[0];
    if (name === "min") return Math.min(...args);
    if (name === "max") return Math.max(...args);
    throw new Error(`unsupported function ${name}()`);
  }
}

const evaluateCss = (expression: string, overrides: Record<string, number> = {}) =>
  Evaluator.run(expression, VARS, overrides);

/* ── The shipped cascade: which `font-size` actually wins on `.ui-logo-glyph` per tier ───────── */

type Rule = { selector: string; body: string; order: number };

function parseRules(css: string): Rule[] {
  const rules: Rule[] = [];
  let order = 0;
  for (const match of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!selector || selector.startsWith("@")) continue;
    rules.push({ selector, body: match[2], order: order++ });
  }
  return rules;
}

const LAYOUT_RULES = parseRules(layoutCss);

/** Selector specificity for the class + attribute selectors this stylesheet is built from. */
const specificity = (selector: string) =>
  (selector.match(/\.[a-z0-9-]+|\[[^\]]+\]/gi) ?? []).length;

/**
 * The `font-size` declaration that WINS on the glyph element of a `<Logo size={tier}>` — highest
 * specificity, then latest in source, exactly like the browser. A tier that stopped out-ranking
 * the base rule would silently fall back to `md`'s cap, which is how the godx size ramp broke.
 */
function winningGlyphFontSize(tier: string): { selector: string; value: string } {
  let best: { selector: string; value: string; spec: number; order: number } | undefined;
  for (const rule of LAYOUT_RULES) {
    const parts = rule.selector.split(/\s+/);
    if (parts[parts.length - 1] !== ".ui-logo-glyph") continue;
    if (parts.length > 1 && parts[0] !== `.ui-logo[data-size="${tier}"]`) continue;
    const declaration = /(?:^|;)\s*font-size\s*:\s*([^;]+)/.exec(rule.body);
    if (!declaration) continue;
    const spec = specificity(rule.selector);
    if (!best || spec > best.spec || (spec === best.spec && rule.order > best.order)) {
      best = { selector: rule.selector, value: declaration[1].trim(), spec, order: rule.order };
    }
  }
  if (!best) throw new Error(`no font-size wins on .ui-logo-glyph at size="${tier}"`);
  return { selector: best.selector, value: best.value };
}

/** The shipped `--logo-glyph-advance-width` expression, off the base `.ui-logo-glyph` rule. */
const ADVANCE_WIDTH_EXPRESSION = (() => {
  const rule = LAYOUT_RULES.find((candidate) => candidate.selector === ".ui-logo-glyph");
  const declaration = /--logo-glyph-advance-width\s*:\s*([^;]+)/.exec(rule?.body ?? "");
  if (!declaration) throw new Error("no --logo-glyph-advance-width on .ui-logo-glyph");
  return declaration[1].trim();
})();

/** The advance the STYLESHEET models for a string, from the component's own class counts. */
function modelledAdvanceEm(glyph: string): number {
  const advance = logoGlyphAdvance(glyph);
  if (!advance) throw new Error(`unclassified glyph ${JSON.stringify(glyph)}`);
  return evaluateCss(ADVANCE_WIDTH_EXPRESSION, {
    "--logo-glyph-fullwidth-count": advance.fullwidth,
    "--logo-glyph-wide-count": advance.wide,
    "--logo-glyph-narrow-count": advance.narrow,
    "--logo-glyph-space-count": advance.space,
  });
}

/** The font-size the browser lands on for that string at that tier, in px. */
function fittedFontSizePx(glyph: string, tier: string): number {
  return evaluateCss(winningGlyphFontSize(tier).value, {
    "--logo-glyph-advance-width": modelledAdvanceEm(glyph),
  });
}

const boxPx = (tier: string) => evaluateCss(`var(--logo-size-${tier})`);

/* ── The measurements ─────────────────────────────────────────────────────────────────────────
 * Inline advance in em (`textW / font-size`), read off the DOM in Chromium at 200px under the
 * shipped `white-space: nowrap`, after `document.fonts.ready`, on the four faces gh#370 used:
 * Noto Sans JP 700, M PLUS 2 700, Hiragino Sans, and the pure system stack. Only the max over the
 * four is kept — it is the one the box has to hold. */

const FACES = ["Noto Sans JP", "M PLUS 2", "Hiragino Sans", "system"] as const;

/** Per-character advance, max over the four faces. The class constants are derived from these. */
const MEASURED_CHARACTER_ADVANCE: Record<string, number> = {
  // full-width: every one exactly 1.0000 on all four faces
  神: 1.0,
  東: 1.0,
  あ: 1.0,
  ゴ: 1.0,
  株: 1.0,
  "「": 1.0,
  "、": 1.0,
  Ｇ: 1.0,
  // the proportional forms that reach that em — all three on Hiragino Sans
  W: 1.058,
  m: 1.01,
  M: 0.987,
  // the rest of the proportional forms
  w: 0.863,
  O: 0.838,
  Q: 0.838,
  U: 0.8291,
  H: 0.826,
  N: 0.821,
  X: 0.811,
  G: 0.79,
  T: 0.7091,
  "8": 0.712,
  k: 0.652,
  t: 0.4841,
  g: 0.692,
  l: 0.315,
  // a collapsible space, measured as the delta between 東京 and 東 京
  " ": 0.333,
};

/** Per-string advance, max over the four faces — the paint the box has to hold. */
const MEASURED_ADVANCE: Record<string, number> = {
  // the issue's case and its neighbours
  東京: 2.0,
  神戸: 2.0,
  ゴジ: 2.0,
  株式: 2.0,
  東京都: 3.0,
  神A: 1.808,
  Aあ: 1.808,
  神: 1.0,
  あ: 1.0,
  // full-width forms belonging to no script, Hangul, a CJK-Ext-B surrogate pair, half-width kana
  ＧＸ: 2.0,
  "「あ": 2.0,
  한국: 1.73,
  "𠮷野": 2.0,
  "、。": 2.0,
  ｱｲ: 1.0,
  // white space: an ASCII space is collapsible and painted; U+3000 is a full-width form
  "東 京": 2.333,
  "東　京": 3.0,
  // Latin and digits, including the em-wide forms
  g: 0.692,
  G: 0.79,
  GX: 1.601,
  TH: 1.535,
  "8": 0.712,
  MW: 2.045,
  WW: 2.116,
  mm: 2.02,
  Mg: 1.6791,
  OO: 1.676,
  ww: 1.726,
  HN: 1.647,
};

const TIERS = ["xs", "sm", "md", "lg"] as const;

describe("Logo glyph fit — the mark stays inside its box (gh#377 regression)", () => {
  it.each(TIERS)('caps the glyph at its own box on size="%s"', (tier) => {
    const box = boxPx(tier);
    const failures: string[] = [];
    for (const [glyph, advance] of Object.entries(MEASURED_ADVANCE)) {
      const painted = advance * fittedFontSizePx(glyph, tier);
      if (painted > box) {
        failures.push(
          `${JSON.stringify(glyph)} paints ${painted.toFixed(2)}px in a ${box.toFixed(2)}px box`,
        );
      }
    }
    expect(failures, `marks outside the ${tier} box (max over ${FACES.join(" / ")})`).toEqual([]);
  });

  it("models an advance no narrower than the one that gets painted", () => {
    // The two under-states that shipped: `WW` modelled 1.62em against 2.116em of paint, and
    // `東 京` modelled 2.000em against 2.333em. Both are marks that then spilled the box above.
    const failures: string[] = [];
    for (const [glyph, advance] of Object.entries(MEASURED_ADVANCE)) {
      const modelled = modelledAdvanceEm(glyph);
      if (modelled + 1e-9 < advance) {
        failures.push(
          `${JSON.stringify(glyph)}: modelled ${modelled.toFixed(4)}em < painted ${advance.toFixed(4)}em`,
        );
      }
    }
    // Six proportional forms (w O Q U H N X) sit up to 0.053em above the narrow constant. They are
    // recorded slack, not a licence: `w` is the widest of them, so `ww` bounds the whole set.
    expect(failures.sort()).toEqual([
      '"HN": modelled 1.6200em < painted 1.6470em',
      '"OO": modelled 1.6200em < painted 1.6760em',
      '"ww": modelled 1.6200em < painted 1.7260em',
    ]);
    // …and the slack never reaches the box edge, which the per-tier test above proves for each.
    expect(MEASURED_ADVANCE.ww * fittedFontSizePx("ww", "xs")).toBeLessThan(boxPx("xs"));
  });

  it("keeps every class constant at or above the widest member it is asked to hold", () => {
    const fullwidth = evaluateCss("var(--logo-glyph-fullwidth-width)");
    const wide = evaluateCss("var(--logo-glyph-wide-width)");
    const space = evaluateCss("var(--logo-glyph-space-width)");
    for (const character of ["神", "東", "あ", "ゴ", "株", "「", "、", "Ｇ"]) {
      expect(logoGlyphAdvance(character)).toMatchObject({ fullwidth: 1 });
      expect(fullwidth).toBeGreaterThanOrEqual(MEASURED_CHARACTER_ADVANCE[character]);
    }
    for (const character of ["M", "W", "m"]) {
      expect(logoGlyphAdvance(character)).toMatchObject({ wide: 1 });
      expect(wide).toBeGreaterThanOrEqual(MEASURED_CHARACTER_ADVANCE[character]);
    }
    expect(space).toBeGreaterThanOrEqual(MEASURED_CHARACTER_ADVANCE[" "]);
    // `W` is wider than a kanji — the fact that makes a proportional-only constant impossible.
    expect(MEASURED_CHARACTER_ADVANCE.W).toBeGreaterThan(MEASURED_CHARACTER_ADVANCE.神);
  });

  it("leaves a mark whose advance already fits at its tier font-size, to the byte", () => {
    // The cap is a CAP, not a target: `min()` must not touch the marks that never needed it.
    for (const tier of TIERS) {
      for (const glyph of ["g", "G", "神", "あ"]) {
        expect(fittedFontSizePx(glyph, tier)).toBe(evaluateCss(`var(--logo-font-size-${tier})`));
      }
    }
  });

  it("keeps each tier out-ranking the base rule, so source order cannot re-break the cap", () => {
    for (const tier of TIERS.filter((candidate) => candidate !== "md")) {
      const winner = winningGlyphFontSize(tier);
      expect(winner.selector).toBe(`.ui-logo[data-size="${tier}"] .ui-logo-glyph`);
      expect(winner.value).toContain(`--logo-size-${tier}`);
      expect(specificity(winner.selector)).toBeGreaterThan(specificity(".ui-logo-glyph"));
    }
    expect(winningGlyphFontSize("md").selector).toBe(".ui-logo-glyph");
  });

  it("holds the mark to ONE line — the invariant the wrap violated", () => {
    // Without this the 20px xs box broke `東京` onto two lines (22.22px tall, 1.88px of ink out).
    const rule = LAYOUT_RULES.find((candidate) => candidate.selector === ".ui-logo-glyph");
    expect(rule?.body).toMatch(/white-space\s*:\s*nowrap/);
  });

  it("floors the modelled advance so an unclassified glyph cannot divide by zero", () => {
    expect(evaluateCss(ADVANCE_WIDTH_EXPRESSION)).toBe(
      evaluateCss("var(--logo-glyph-fullwidth-width)"),
    );
  });
});

describe("logoGlyphAdvance — the counts the fit cap is computed from", () => {
  it("splits a string into the four advance classes", () => {
    expect(logoGlyphAdvance("東京")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 0 });
    expect(logoGlyphAdvance("GX")).toEqual({ fullwidth: 0, wide: 0, narrow: 2, space: 0 });
    expect(logoGlyphAdvance("WW")).toEqual({ fullwidth: 0, wide: 2, narrow: 0, space: 0 });
    expect(logoGlyphAdvance("Mg")).toEqual({ fullwidth: 0, wide: 1, narrow: 1, space: 0 });
    expect(logoGlyphAdvance("神A")).toEqual({ fullwidth: 1, wide: 0, narrow: 1, space: 0 });
  });

  it("counts a surrogate pair once, not twice", () => {
    expect(logoGlyphAdvance("𠮷野")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 0 });
  });

  it("counts an interior space, because `nowrap` still paints one", () => {
    expect(logoGlyphAdvance("東 京")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 1 });
  });

  it("collapses a run of interior white space to one space, as CSS does", () => {
    expect(logoGlyphAdvance("東   京")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 1 });
    expect(logoGlyphAdvance("東\t\n京")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 1 });
  });

  it("drops leading and trailing white space, as CSS does", () => {
    expect(logoGlyphAdvance("  東京 ")).toEqual({ fullwidth: 2, wide: 0, narrow: 0, space: 0 });
  });

  it("gives U+3000 its full em rather than the collapsible-space width", () => {
    // CSS does not collapse the ideographic space and it paints 1.000em on all four faces.
    expect(logoGlyphAdvance("東　京")).toEqual({ fullwidth: 3, wide: 0, narrow: 0, space: 0 });
    expect(modelledAdvanceEm("東　京")).toBe(3);
  });

  it("leaves a non-string or empty glyph unclassified rather than guessing", () => {
    expect(logoGlyphAdvance(<svg />)).toBeUndefined();
    expect(logoGlyphAdvance(undefined)).toBeUndefined();
    expect(logoGlyphAdvance("")).toBeUndefined();
    expect(logoGlyphAdvance("   ")).toBeUndefined();
  });
});

describe("Logo glyph counts reach the element CSS reads them from", () => {
  it("emits all four counts on the glyph, not on the box", () => {
    render(<Logo glyph="東 京" label="mark" />);
    const glyph = screen
      .getByLabelText("mark")
      .querySelector<HTMLElement>('[data-slot="logo-glyph"]');
    expect(glyph?.style.getPropertyValue("--logo-glyph-fullwidth-count")).toBe("2");
    expect(glyph?.style.getPropertyValue("--logo-glyph-wide-count")).toBe("0");
    expect(glyph?.style.getPropertyValue("--logo-glyph-narrow-count")).toBe("0");
    expect(glyph?.style.getPropertyValue("--logo-glyph-space-count")).toBe("1");
  });

  it("leaves artwork unmeasured — the library never guesses at a node it cannot read", () => {
    render(<Logo glyph={<svg data-testid="art" />} label="mark" />);
    const glyph = screen
      .getByLabelText("mark")
      .querySelector<HTMLElement>('[data-slot="logo-glyph"]');
    expect(glyph?.style.getPropertyValue("--logo-glyph-fullwidth-count")).toBe("");
  });
});
