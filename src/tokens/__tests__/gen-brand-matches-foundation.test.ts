import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

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

const blockOf = (css: string, selector: string) => {
  const at = css.indexOf(selector);
  if (at === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("\n}", open));
};
const role = (body: string, name: string) => {
  const m = new RegExp(`^\\s*--${name}:\\s*([\\d.]+\\s+[\\d.]+%\\s+[\\d.]+%)\\s*;`, "m").exec(body);
  if (!m) throw new Error(`--${name} not found`);
  return triplet(m[1]);
};

const DARK = '.dark,\n:root[data-theme="dark"]';
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

  /* `--text-primary` is still AUTHORED in foundation.css (it feeds `--mark-primary`, which is
   * contracted to a RAW triple that CSS relative colour cannot produce), so it is compared against
   * the literal. Lightness, not the whole triplet: the generator hue-LOCKS every derived role to
   * the seed and the authored value drifts 0.7° off it — the gh#648 class of defect, so the
   * generator being stricter is the correct direction. */
  it("puts light --text-primary on the ramp step foundation.css authored", () => {
    expect(role(emitted.light, "text-primary")[2]).toBeCloseTo(
      role(authored.light, "text-primary")[2],
      1,
    );
  });

  /* `--text-link` and `--text-brand` DERIVE now (gh#664), so there is no literal to compare to —
   * the thing worth asserting is that the generator lands on the value the CSS would paint. A
   * generator that agreed with an old literal but not with the live formula would be the same
   * class of bug one layer out. */
  it.each([
    ["light", "text-link"],
    ["light", "text-brand"],
    ["dark", "text-link"],
    ["dark", "text-brand"],
  ] as const)("puts %s --%s exactly where derived.css would paint it", (theme, name) => {
    const seed = role(emitted[theme], "primary");
    const expected = relative(seed, channelsOf(name, ...derivedScopes[theme]));
    expect(role(emitted[theme], name)).toEqual(expected.map((n) => Number(n.toFixed(1))));
  });

  it.each(["text-link", "text-brand", "text-primary"])(
    "holds light --%s on the seed's hue",
    (name) => {
      expect(role(emitted.light, name)[0]).toBeCloseTo(role(emitted.light, "primary")[0], 1);
    },
  );

  /* The dark seed is the one value a generator cannot reproduce: foundation.css took #DCBCFF from
   * the published identity kit, not from a formula. What IS reproducible is how the dark text roles
   * sit relative to whatever the dark seed is — the link ink IS the seed, and the pressed ink is
   * one hover step above it — and that is the rule foundation.css follows too. */
  it("puts the dark link ink ON the dark seed, as derived.css does", () => {
    expect(role(emitted.dark, "text-link")).toEqual(role(emitted.dark, "primary"));
    expect(channelsOf("text-link", ...derivedScopes.dark)).toBe("h s l");
  });

  it("puts the dark pressed ink one hover step above the seed, as foundation.css does", () => {
    const step = (body: string) => role(body, "text-primary")[2] - role(body, "primary")[2];
    expect(step(emitted.dark)).toBeCloseTo(step(authored.dark), 1);
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
