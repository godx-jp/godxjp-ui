import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The focus ring has ONE definition (styles/focus-ring.css) and four tokens.
 *
 * It did not always. Same state, four thicknesses, and no single knob a
 * service could retune. Components that forgot the rule got the browser
 * default instead (Chrome's `rgb(0,95,204)`, which is how the pagination
 * defect surfaced).
 *
 * These tests fail the moment someone writes a ring by hand again.
 */

const STYLES_DIR = join(__dirname, "..");
const FOCUS_RING_CSS = readFileSync(join(STYLES_DIR, "focus-ring.css"), "utf8");

/** Files allowed to mention a ring outside focus-ring.css, with the reason. */
const ALLOWED: Record<string, string> = {
  // The REGION ring is a different affordance with its own token pair and its
  // own default (OFF) — see tokens/foundation.css. It is inset, covers a scroll
  // region rather than a control, and must not follow the control ring.
  "shell-layout.css": "region ring (--region-focus-ring-*), documented opt-in",
};
// NOTE: a file is exempted ONLY when it paints a genuinely different affordance.
// `border-color` tints on :focus-visible are not exemptions — they never trip the
// check, because the check looks for box-shadow/outline. Blanket-exempting a file
// is what let a mutation slip through while this test was being written: with
// control.css on the list, re-adding a hand-written `.ui-button:focus-visible`
// ring there stayed green.

function cssFiles(): string[] {
  return readdirSync(STYLES_DIR).filter((f) => f.endsWith(".css") && f !== "focus-ring.css");
}

describe("focus ring — single source", () => {
  // A hand-written ring is exactly what drifted last time. Anything that paints
  // box-shadow/outline on :focus-visible outside focus-ring.css is a regression.
  it("no stylesheet paints a :focus-visible ring outside focus-ring.css", () => {
    const offenders: string[] = [];

    for (const file of cssFiles()) {
      const css = readFileSync(join(STYLES_DIR, file), "utf8");
      // Every `:focus-visible {…}` block in this file, with its declarations.
      for (const match of css.matchAll(/:focus-visible[^{]*\{([^}]*)\}/g)) {
        const body = match[1];
        // Read each declaration's VALUE rather than negative-lookahead on the property. With
        // `/box-shadow:\s*(?!none)/` the `\s*` backtracks to zero width, the lookahead then sees
        // " none" rather than "none", and EVERY `box-shadow: none` was reported as a hand-written
        // ring. That false positive sat here undetected — suppressing a ring is the opposite of
        // painting one.
        const paints = (prop: string) =>
          [...body.matchAll(new RegExp(`${prop}\\s*:\\s*([^;]+)`, "g"))].some(
            (d) => d[1].trim() !== "none",
          );
        const paintsRing = paints("box-shadow") || paints("outline");
        if (!paintsRing) continue;
        if (ALLOWED[file]) continue;
        offenders.push(`${file}: ${body.trim().slice(0, 80)}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  // The four knobs ARE the API. If a value is inlined instead of read from a
  // token, a service can no longer retune every ring at once — the exact
  // failure that produced 3px/0.35 and 3px/0.3 rings.
  it("both forms read their geometry and hue from tokens and hardcode none of it", () => {
    // The FIELD form: the whole shadow arrives as one token, and the boundary is rebound to the
    // focus hue rather than declared as a colour.
    expect(FOCUS_RING_CSS).toContain("var(--focus-field-shadow)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-color, var(--ring))");
    // The MARK: width, hue and offset, each as a token. The width is `weight × switch`, so a
    // rule reading it can never paint while `--focus-outline` is 0.
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-width)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-outline-color)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-offset)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-opacity, 1)");

    // No literal px thickness inside a mark declaration.
    //
    // COMMENTS ARE STRIPPED FIRST, and that is not tidiness. This file's prose QUOTES CSS — it has
    // to, because the reason a rule exists is usually another rule that beat it (`outline: auto
    // 1px`, the browser default an unlisted control falls back to). Scanning the raw text read
    // those quotations as declarations and failed on a stylesheet that hardcodes nothing, which
    // is the same class of false positive the `box-shadow: none` note above records.
    const withoutComments = FOCUS_RING_CSS.replace(/\/\*[\s\S]*?\*\//g, "");
    const ringDeclarations = [...withoutComments.matchAll(/(box-shadow|outline):\s*([^;]+);/g)]
      .map((m) => m[2])
      .filter((value) => value !== "none");
    for (const value of ringDeclarations) {
      expect(value, `hardcoded thickness in: ${value}`).not.toMatch(/\b[1-9]\d*px\b/);
    }
  });

  // Turning the ring off must stay possible AND stay a deliberate act: the
  // shipped default is on (WCAG 2.4.7), and the attribute is the documented switch.
  it("ships the mark ON by default, behind the one multiplier flag", () => {
    const foundation = readFileSync(join(STYLES_DIR, "../tokens/foundation.css"), "utf8");
    const axes = readFileSync(join(STYLES_DIR, "../tokens/axes.css"), "utf8");
    // ON is the shipped default since gh#544 — three of four consumers had silently shipped with
    // no indicator, because the old OFF default was discoverable only by reading foundation.css.
    expect(foundation).toMatch(/--focus-outline:\s*1;/);
    // The thickness is still a member of the stroke scale rather than a parallel authority, so a
    // theme retunes marks and borders together. The ON weight is the hairline stroke = 1px.
    expect(foundation).toMatch(/--focus-outline-weight:\s*var\(--stroke-hairline\)/);
    expect(foundation).toMatch(/--stroke-hairline:\s*1px;/);
    expect(foundation).toMatch(/--focus-ring-opacity:\s*1/);
    // And ONE attribute turns the whole thing off, with no code change. `"on"` is kept so every
    // consumer that already set it under the old default keeps working.
    expect(axes).toContain(':root[data-focus-outline="off"]');
    expect(axes).toContain(':root[data-focus-outline="on"]');
    // The per-surface off switch is the composed halo token (`.ui-command-input`).
    expect(FOCUS_RING_CSS).toContain("--focus-field-shadow: none");
  });

  // A control carrying a Tailwind shadow/ring utility (shadow-xs on Checkbox,
  // Radio, Switch, Input…) resolves box-shadow from the UTILITIES layer, which
  // outranks `components`. Feeding --tw-ring-shadow is what makes the
  // utility's composite paint our ring; drop it and those controls silently
  // lose their focus affordance again.
  it("feeds --tw-ring-shadow so controls with Tailwind shadow utilities still ring", () => {
    expect(FOCUS_RING_CSS).toMatch(/--tw-ring-shadow:\s*var\(--focus-field-shadow\)/);
  });
});

describe("trạng thái lỗi đổi màu vòng focus (gh#363)", () => {
  const focusRing = readFileSync(resolve(process.cwd(), "src/styles/focus-ring.css"), "utf8");

  it("aria-invalid gán lại chính biến mà các luật vẽ vòng đang đọc", () => {
    const rule = focusRing.match(/\[aria-invalid="true"\]\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule, "phải có luật cho aria-invalid").not.toBe("");
    expect(rule).toContain("--focus-ring-color");
    expect(rule).toContain("var(--destructive)");
  });

  it("chỉ đổi MÀU, không viết công thức vòng thứ hai", () => {
    const rule = focusRing.match(/\[aria-invalid="true"\]\s*\{[^}]*\}/)?.[0] ?? "";
    // Bề rộng, độ mờ và độ lệch phải tiếp tục đến từ token chung, nếu không một service chỉnh
    // cường độ vòng focus sẽ không kéo theo trạng thái lỗi.
    // `--focus-outline-color` IS a colour, so the forbidden list names the PROPERTIES that would
    // constitute a second formula rather than any token whose name contains "outline".
    for (const forbidden of [
      "box-shadow:",
      "outline:",
      "--focus-ring-width",
      "--focus-outline-width",
      "--focus-ring-opacity",
    ]) {
      expect(rule, `luật lỗi không được khai ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("luật lỗi đặt sau mọi lần gán lại theo component, nên nó thắng", () => {
    const invalidAt = focusRing.indexOf('[aria-invalid="true"]');
    const lastRebind = focusRing.lastIndexOf("--focus-ring-offset:");
    expect(invalidAt).toBeGreaterThan(lastRebind);
  });
});
