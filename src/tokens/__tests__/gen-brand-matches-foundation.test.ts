import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";

import { channelsOf, contrast, hslToRgb, relative, triplet } from "./wcag-contrast";

/**
 * `pnpm gen:brand <hex>` WRITES THE FILE A CONSUMER WOULD OTHERWISE AUTHOR BY EYE.
 *
 * The risk in a generator like this is not that it crashes — it is that it invents a rule. A brand
 * file whose ramp steps differ from this repo's produces a product that is subtly not the design
 * system: links a shade off, a pressed state that steps the wrong way, a dark seed that clears no
 * threshold anyone measured.
 *
 * So the generator is held to FOUNDATION.CSS ITSELF. Run it on this repo's own seed and it must
 * reproduce the roles that foundation.css authors by hand. Where it cannot — the dark seed, which
 * came from the published brand kit (#D8BCFF) rather than from any formula — the test asserts the
 * RELATIONSHIP instead, because that is the part a generator can be right about.
 */
const ROOT = process.cwd();
const foundation = readFileSync(join(ROOT, "src/tokens/foundation.css"), "utf8");
const out = mkdtempSync(join(tmpdir(), "godx-gen-brand-"));
afterAll(() => rmSync(out, { recursive: true, force: true }));

execFileSync(
  "node",
  [join(ROOT, "scripts/gen-brand.mjs"), "#7A00FF", "--name", "seed", "--out", out],
  {
    stdio: "pipe",
  },
);
const generated = readFileSync(join(out, "seed.service.css"), "utf8");

/* `anchorIndex`, not `indexOf` (gh#769): a hand-wrapped selector literal pins PRETTIER'S line
 * breaks, so the probe reads "rule not found" the next time the selector crosses the print width
 * and the failure blames the CSS. Written on one line here whatever the stylesheet does. */
const blockOf = (css: string, selector: string) => {
  const at = anchorIndex(css, selector);
  if (at === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("\n}", open));
};
const role = (body: string, name: string) => {
  const m = new RegExp(`^\\s*--${name}:\\s*([\\d.]+\\s+[\\d.]+%\\s+[\\d.]+%)\\s*;`, "m").exec(body);
  if (!m) throw new Error(`--${name} not found`);
  return triplet(m[1]);
};

const DARK = '.dark, :root[data-theme="dark"]';
const authored = {
  light: blockOf(foundation, ":root {"),
  dark: blockOf(foundation, `${DARK} {`),
};
const derivedCss = readFileSync(join(ROOT, "src/tokens/derived.css"), "utf8");
const derivedScopes = {
  light: [blockOf(derivedCss, ":root {")],
  dark: [blockOf(derivedCss, `${DARK} {`), blockOf(derivedCss, ":root {")],
};
const emitted = {
  light: blockOf(generated, ":root {"),
  dark: blockOf(generated, `${DARK} {`),
};

describe("gen:brand reproduces foundation.css on foundation.css's own seed", () => {
  it("emits the seed back unchanged", () => {
    expect(role(emitted.light, "primary")).toEqual(role(authored.light, "primary"));
  });

  /* THE GENERATOR WRITES THREE TOKENS PER THEME AND NOTHING ELSE. Everything a brand needs beyond
   * the seed, its label and the ring DERIVES from the `--primary` in scope — the interaction
   * states (gh#678) and the brand text roles (gh#664) alike. A literal for any of them would pin
   * it to this seed and stop it following the next change, which is the regression the derived
   * tier exists to prevent. Asserting the ABSENCE is what keeps a future edit from "helpfully"
   * emitting them back. */
  it.each([":root", DARK])("writes exactly seed + label + ring in %s", (selector) => {
    const declared = [...blockOf(generated, `${selector} {`).matchAll(/^\s*(--[\w-]+):/gm)].map(
      (m) => m[1],
    );
    expect(declared.sort()).toEqual(["--primary", "--primary-foreground", "--ring"]);
  });

  /* The dark link ink IS the dark seed — the dark ramp's bright end is already the anchor, so the
   * step is zero. foundation.css authored them equal here and one step apart in light. */
  it("keeps the dark link ink ON the seed", () => {
    expect(channelsOf("text-link", ...derivedScopes.dark)).toBe("h s l");
  });

  /* The dark ramp runs UPWARD, so the pressed ink is brighter than the seed, not darker — the
   * relationship foundation.css authored (#DCBCFF seed, #E8DAFF pressed). */
  it("puts the dark pressed ink one hover step ABOVE the seed", () => {
    expect(channelsOf("text-primary", ...derivedScopes.dark)).toBe(
      channelsOf("primary-hover", ...derivedScopes.dark),
    );
  });

  /* The generator prints these ratios and exits non-zero when one misses. Re-measuring them here
   * means a change to the ramp formulas cannot quietly ship a brand file that fails AA. */
  it("emits a light theme that clears AA on its own label and 3:1 on the canvas", () => {
    const primary = hslToRgb(role(emitted.light, "primary"));
    expect(
      contrast(primary, hslToRgb(role(emitted.light, "primary-foreground"))),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrast(primary, hslToRgb(role(authored.light, "background")))).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("emits a dark theme that clears AA on its own label and 3:1 on the canvas", () => {
    const primary = hslToRgb(role(emitted.dark, "primary"));
    expect(
      contrast(primary, hslToRgb(role(emitted.dark, "primary-foreground"))),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrast(primary, hslToRgb(role(authored.dark, "background")))).toBeGreaterThanOrEqual(
      3,
    );
  });

  /* The four state knobs derive from the --primary in scope (gh#678). A generated file that wrote
   * them would pin them to this seed — which is the drift famgia.service.css still carries. */
  it.each(["primary-hover", "primary-active", "primary-border", "control-outline"])(
    "does NOT write --%s, which derives",
    (name) => {
      expect(generated).not.toMatch(new RegExp(`^\\s*--${name}:`, "m"));
    },
  );

  /* gh#250: re-theming the action colour must leave the identity alone. */
  it("does NOT write --brand", () => {
    expect(generated).not.toMatch(/^\s*--brand:/m);
  });
});
