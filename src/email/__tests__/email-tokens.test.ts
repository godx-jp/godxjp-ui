/**
 * The no-drift contract for `@godxjp/ui/email` (issue #227).
 *
 * Every assertion here re-derives the expected value straight from the CSS token files — the same
 * source `scripts/gen-email-tokens.mjs` reads — so this suite fails the moment an email value stops
 * matching the web token it mirrors. It also locks the three properties an email template depends
 * on and cannot check for itself: literal-only values (no `var()`/`calc()`/rem), zero external or
 * relative asset references, and a brand mark identical to the canonical `<Logo mark="godx" />`.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import {
  EMAIL_BRAND_MARK,
  EMAIL_COLORS,
  EMAIL_COLORS_DARK,
  EMAIL_COLOR_SOURCE,
  EMAIL_COLOR_SOURCE_DARK,
  EMAIL_CTA,
  EMAIL_FOCUS,
  EMAIL_FOOTER,
  EMAIL_GEOMETRY_SOURCE,
  EMAIL_MOBILE,
  EMAIL_SHELL,
  EMAIL_TOKENS,
  EMAIL_TOKENS_JSON,
  EMAIL_TYPOGRAPHY,
  emailBrandMarkSvg,
  emailBrandMarkTableHtml,
  emailInlineStyle,
  hslToHex,
} from "../index";

const ROOT = join(__dirname, "../../..");
const EMAIL_DIR = join(ROOT, "src/email");

/** Read the declarations of a top-level CSS block, exactly like the generator does. */
function readBlock(file: string, selector: RegExp): Record<string, string> {
  const css = readFileSync(join(ROOT, file), "utf8");
  const start = css.search(selector);
  expect(start, `${file}: ${selector} not found`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("\n}", open));
  const decls: Record<string, string> = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    decls[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }
  return decls;
}

const FOUNDATION_LIGHT = readBlock("src/tokens/foundation.css", /^:root\s*\{/m);
const FOUNDATION_DARK = readBlock(
  "src/tokens/foundation.css",
  /^\.dark,\s*\n:root\[data-theme="dark"\]\s*\{/m,
);
const EMAIL_CSS = readBlock("src/tokens/components/email.css", /^:root\s*\{/m);

// ── 1. Colours derive from the web roles, never from a copied hex ───────────────────────────────
describe("email colours derive from the web token roles", () => {
  it("every light slot resolves the SAME hsl triplet the role declares in foundation.css", () => {
    for (const [token, source] of Object.entries(EMAIL_COLOR_SOURCE)) {
      expect(FOUNDATION_LIGHT[source.cssVar], `${token} → ${source.cssVar}`).toBe(source.hsl);
    }
  });

  it("every light hex equals hslToHex() of the live foundation.css role value", () => {
    for (const [token, source] of Object.entries(EMAIL_COLOR_SOURCE)) {
      const expected = hslToHex(FOUNDATION_LIGHT[source.cssVar]);
      expect(EMAIL_COLORS[token as keyof typeof EMAIL_COLORS], token).toBe(expected);
    }
  });

  it("every dark slot resolves the dark-scheme role value", () => {
    for (const [token, source] of Object.entries(EMAIL_COLOR_SOURCE_DARK)) {
      expect(FOUNDATION_DARK[source.cssVar], `${token} → ${source.cssVar}`).toBe(source.hsl);
      expect(EMAIL_COLORS_DARK[token as keyof typeof EMAIL_COLORS_DARK], token).toBe(
        hslToHex(FOUNDATION_DARK[source.cssVar]),
      );
    }
  });

  it("covers exactly the slots the issue requires (surface/background/foreground/muted/border/primary/focus)", () => {
    expect(Object.keys(EMAIL_COLORS).sort()).toEqual(
      [
        "background",
        "border",
        "brand",
        "brandForeground",
        "focus",
        "foreground",
        "muted",
        "mutedForeground",
        "primary",
        "primaryForeground",
        "surface",
        "surfaceForeground",
      ].sort(),
    );
    expect(EMAIL_COLOR_SOURCE.surface.cssVar).toBe("--card");
    expect(EMAIL_COLOR_SOURCE.focus.cssVar).toBe("--ring");
    // The GoDX identity mark is the --success role (what --logo-godx-color points at), NOT --primary.
    expect(EMAIL_COLOR_SOURCE.brand.cssVar).toBe("--success");
  });

  it("hslToHex matches the reference conversions the design comments record", () => {
    expect(hslToHex("204 100% 39%")).toBe("#0077c7"); // SmartHR MAIN, per foundation.css
    expect(hslToHex("0 0% 100%")).toBe("#ffffff");
    expect(hslToHex("0 0% 0%")).toBe("#000000");
    expect(hslToHex("0 100% 50%")).toBe("#ff0000");
    expect(hslToHex("120 100% 25%")).toBe("#008000");
    expect(EMAIL_COLORS.primary).toBe("#0077c7");
  });

  it("rejects anything that is not a bare HSL channel triplet", () => {
    expect(() => hslToHex("#0077c7")).toThrow(TypeError);
    expect(() => hslToHex("hsl(204 100% 39%)")).toThrow(TypeError);
  });
});

// ── 2. Geometry derives from the component token tier ───────────────────────────────────────────
describe("email geometry derives from src/tokens/components/email.css", () => {
  it("mirrors every --email-* declaration verbatim", () => {
    expect(EMAIL_GEOMETRY_SOURCE).toEqual(EMAIL_CSS);
    expect(Object.keys(EMAIL_CSS).length).toBeGreaterThan(20);
  });

  it("exposes the 480px shell geometry the issue specifies", () => {
    expect(EMAIL_SHELL.widthPx).toBe(480);
    expect(EMAIL_SHELL.width).toBe(EMAIL_CSS["--email-shell-width"]);
    // content column = width − both insets, so a template never recomputes it
    expect(EMAIL_SHELL.contentWidthPx).toBe(EMAIL_SHELL.widthPx - 2 * EMAIL_SHELL.paddingPx);
    // the canonical invitation reference measures 480×407 (the regression target)
    expect(EMAIL_SHELL.referenceHeightPx).toBe(407);
  });

  it("exposes CTA, footer, focus and mobile groups straight from their tokens", () => {
    expect(EMAIL_CTA.heightPx).toBe(Number.parseFloat(EMAIL_CSS["--email-cta-height"]));
    // an Outlook-safe button centres by line-height == height, not flexbox
    expect(EMAIL_CTA.lineHeightPx).toBe(EMAIL_CTA.heightPx);
    expect(EMAIL_FOOTER.linkGapPx).toBe(Number.parseFloat(EMAIL_CSS["--email-footer-link-gap"]));
    expect(EMAIL_FOCUS.borderWidthPx).toBe(
      Number.parseFloat(EMAIL_CSS["--email-focus-border-width"]),
    );
    expect(EMAIL_MOBILE.paddingPx).toBe(Number.parseFloat(EMAIL_CSS["--email-mobile-padding"]));
    expect(EMAIL_MOBILE.ctaWidth).toBe("100%");
    expect(EMAIL_TYPOGRAPHY.bodyFontSizePx).toBe(
      Number.parseFloat(EMAIL_CSS["--email-body-font-size"]),
    );
  });

  it("the generated module is not stale (the CSS is the only source of truth)", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/gen-email-tokens.mjs", "--check"], {
        cwd: ROOT,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });
});

// ── 3. Every exported value is inline-email-safe ────────────────────────────────────────────────
describe("values are compatible with inline email styles", () => {
  const flat = (value: unknown, path: string, out: [string, string][] = []) => {
    if (typeof value === "string") out.push([path, value]);
    else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) flat(v, `${path}.${k}`, out);
    }
    return out;
  };
  const STRINGS = flat(EMAIL_TOKENS, "EMAIL_TOKENS");

  it("no exported value uses var(), calc(), or a relative unit", () => {
    for (const [path, value] of STRINGS) {
      expect(value, path).not.toMatch(/var\(|calc\(/);
      expect(value, path).not.toMatch(/\d(?:rem|em|ch|vw|vh)\b/);
    }
  });

  it("every colour is a 6-digit lowercase hex — the one form every client renders", () => {
    for (const hex of [...Object.values(EMAIL_COLORS), ...Object.values(EMAIL_COLORS_DARK)]) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("every geometry token is a literal px / % / unitless number", () => {
    for (const [name, value] of Object.entries(EMAIL_GEOMETRY_SOURCE)) {
      if (name === "--email-font-family-sans") continue;
      expect(value, name).toMatch(/^\d+(?:\.\d+)?(?:px|%)?$/);
    }
  });

  it("the font stack names only email-safe system faces (no @font-face dependency)", () => {
    expect(EMAIL_TYPOGRAPHY.fontFamily).toContain("Arial");
    expect(EMAIL_TYPOGRAPHY.fontFamily).toContain("sans-serif");
    expect(EMAIL_TYPOGRAPHY.fontFamily).not.toMatch(/url\(|@font-face/);
    expect(EMAIL_TYPOGRAPHY.fontFamily).not.toMatch(/["']/);
  });

  it("emailInlineStyle serialises to a style attribute and refuses unresolvable values", () => {
    expect(
      emailInlineStyle({
        width: EMAIL_SHELL.width,
        backgroundColor: EMAIL_COLORS.surface,
        borderRadius: EMAIL_SHELL.radius,
        color: null,
      }),
    ).toBe(`width:480px;background-color:${EMAIL_COLORS.surface};border-radius:10px`);
    expect(() => emailInlineStyle({ color: "var(--primary)" })).toThrow(TypeError);
    expect(() => emailInlineStyle({ width: "calc(100% - 8px)" })).toThrow(TypeError);
  });

  it("EMAIL_TOKENS_JSON round-trips for non-JS template engines", () => {
    expect(JSON.parse(EMAIL_TOKENS_JSON)).toEqual(JSON.parse(JSON.stringify(EMAIL_TOKENS)));
    expect(JSON.parse(EMAIL_TOKENS_JSON).colors.primary).toBe(EMAIL_COLORS.primary);
  });
});

// ── 4. No relative or external asset dependency ─────────────────────────────────────────────────
describe("no relative or external asset dependency", () => {
  const sources = readdirSync(EMAIL_DIR)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => [f, readFileSync(join(EMAIL_DIR, f), "utf8")] as const);

  it("ships no hex literal — every colour is derived, never hand-copied", () => {
    for (const [file, text] of sources) {
      const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      // `&#8203;` and friends are HTML entities, not colours — require a real `#rrggbb` literal.
      expect(code, file).not.toMatch(/(?<![&\w])#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("references no URL, file path, or import beyond the module's own siblings", () => {
    for (const [file, text] of sources) {
      const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      expect(code, file).not.toMatch(/https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
      expect(code, file).not.toMatch(/\.(?:png|jpe?g|gif|webp|svg|woff2?|ttf|css)\b/);
      expect(code, file).not.toMatch(/\bcid:|\burl\(/);
      for (const m of code.matchAll(/from\s+"([^"]+)"/g)) {
        expect(m[1], `${file} imports ${m[1]}`).toMatch(/^\.\/[a-z.-]+$/);
      }
    }
  });

  it("the brand mark markup embeds its artwork — no src/href to fetch", () => {
    for (const markup of [
      EMAIL_BRAND_MARK.svg,
      EMAIL_BRAND_MARK.tableHtml,
      emailBrandMarkSvg({ label: "" }),
      emailBrandMarkTableHtml({ width: 64, height: 64 }),
    ]) {
      expect(markup).not.toMatch(/\bsrc=|\bhref=|\bxlink:href=|\burl\(|\bcid:/);
    }
    // the data: URI is self-contained — it is a payload, not a fetch
    expect(EMAIL_BRAND_MARK.dataUri.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(decodeURIComponent(EMAIL_BRAND_MARK.dataUri.split(",")[1])).toBe(EMAIL_BRAND_MARK.svg);
  });
});

// ── 5. The mark is the canonical GoDX artwork, capsule AND internal glyph ───────────────────────
describe("canonical GoDX brand mark", () => {
  const logo = readFileSync(join(ROOT, "src/components/general/logo.tsx"), "utf8");
  const logoPath = /d="([^"]+)"/.exec(logo)?.[1] ?? "";

  it('the capsule path is byte-identical to the one <Logo mark="godx" /> paints', () => {
    expect(logoPath).not.toBe("");
    expect(logoPath.startsWith(EMAIL_BRAND_MARK.capsulePath)).toBe(true);
  });

  it("uses the component's 32×32 viewBox and default box size", () => {
    expect(logo).toContain(`viewBox="${EMAIL_BRAND_MARK.viewBox}"`);
    expect(EMAIL_BRAND_MARK.widthPx).toBe(32);
    expect(EMAIL_BRAND_MARK.heightPx).toBe(32);
  });

  it("draws BOTH the emerald capsule and the internal glyph (a pill-only mark is the bug)", () => {
    expect(EMAIL_BRAND_MARK.svg).toContain(`fill="${EMAIL_COLORS.brand}"`);
    expect(EMAIL_BRAND_MARK.svg).toContain(`fill="${EMAIL_COLORS.brandForeground}"`);
    expect(EMAIL_BRAND_MARK.capsulePath).not.toBe(EMAIL_BRAND_MARK.glyphPath);
    expect(EMAIL_BRAND_MARK.tableHtml).toContain(`background-color:${EMAIL_COLORS.brand}`);
    expect(EMAIL_BRAND_MARK.tableHtml).toContain(
      `background-color:${EMAIL_COLORS.brandForeground}`,
    );
  });

  it("the glyph sits inside the capsule bounds", () => {
    const { capsule, glyph } = EMAIL_BRAND_MARK;
    expect(glyph.x).toBeGreaterThanOrEqual(capsule.x);
    expect(glyph.y).toBeGreaterThanOrEqual(capsule.y);
    expect(glyph.x + glyph.width).toBeLessThanOrEqual(capsule.x + capsule.width);
    expect(glyph.y + glyph.height).toBeLessThanOrEqual(capsule.y + capsule.height);
  });

  it("is decorative when label is empty and an image otherwise (WAI-ARIA)", () => {
    expect(emailBrandMarkSvg()).toContain('role="img"');
    expect(emailBrandMarkSvg()).toContain('aria-label="GoDX"');
    expect(emailBrandMarkSvg({ label: "" })).toContain('aria-hidden="true"');
    expect(emailBrandMarkSvg({ label: "" })).not.toContain("aria-label");
    expect(emailBrandMarkSvg({ label: 'Go"DX' })).toContain("Go&quot;DX");
  });

  it("scales without re-authoring the artwork", () => {
    const big = emailBrandMarkSvg({ width: 64, height: 64 });
    expect(big).toContain('width="64"');
    expect(big).toContain(`viewBox="${EMAIL_BRAND_MARK.viewBox}"`);
    expect(big).toContain(EMAIL_BRAND_MARK.capsulePath);
  });
});
