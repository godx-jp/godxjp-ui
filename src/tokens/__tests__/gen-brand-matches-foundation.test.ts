import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { contrast, hslToRgb, triplet } from "./wcag-contrast";

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
const emitted = {
  light: blockOf(generated, ":root {"),
  dark: blockOf(generated, `${DARK} {`),
};

describe("gen:brand reproduces foundation.css on foundation.css's own seed", () => {
  it("emits the seed back unchanged", () => {
    expect(role(emitted.light, "primary")).toEqual(role(authored.light, "primary"));
  });

  /* Lightness, not the whole triplet: the generator hue-LOCKS every derived role to the seed, and
   * foundation.css's hand-authored values drift up to 0.7° off it (268.3 and 268 against a 268.7
   * seed). That drift is the gh#648 class of defect, so the generator being stricter than the file
   * is the correct direction — asserting the full triplet would pin the generator to the drift. */
  it.each(["text-link", "text-brand", "text-primary"])(
    "puts light --%s on the same ramp step foundation.css authored",
    (name) => {
      expect(role(emitted.light, name)[2]).toBeCloseTo(role(authored.light, name)[2], 1);
    },
  );

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
  it("puts the dark link ink ON the dark seed, as foundation.css does", () => {
    expect(role(emitted.dark, "text-link")).toEqual(role(emitted.dark, "primary"));
    expect(role(authored.dark, "text-link")[2]).toBeCloseTo(role(authored.dark, "primary")[2], 1);
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
