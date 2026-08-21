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
  EMAIL_URGENCY,
  EMAIL_URGENCY_DARK,
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

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

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
        "urgency",
        "urgencyForeground",
      ].sort(),
    );
    expect(EMAIL_COLOR_SOURCE.surface.cssVar).toBe("--card");
    expect(EMAIL_COLOR_SOURCE.focus.cssVar).toBe("--ring");
    // The GoDX identity mark is the --brand IDENTITY role (what --logo-godx-color points at) —
    // NOT --primary, and NOT the --success status green it wrongly borrowed before gh#250.
    expect(EMAIL_COLOR_SOURCE.brand.cssVar).toBe("--brand");
    expect(EMAIL_COLOR_SOURCE.brandForeground.cssVar).toBe("--brand-foreground");
    expect(EMAIL_COLOR_SOURCE.urgency.cssVar).toBe("--attention");
    expect(EMAIL_COLOR_SOURCE.urgencyForeground.cssVar).toBe("--attention-foreground");
  });

  it("publishes an action-required accent with an explicit contrast and usage contract", () => {
    expect(EMAIL_URGENCY).toEqual({
      accent: EMAIL_COLORS.urgency,
      solidBackground: EMAIL_COLORS.urgency,
      solidForeground: EMAIL_COLORS.urgencyForeground,
    });
    expect(EMAIL_URGENCY_DARK).toEqual({
      accent: EMAIL_COLORS_DARK.urgency,
      solidBackground: EMAIL_COLORS_DARK.urgency,
      solidForeground: EMAIL_COLORS_DARK.urgencyForeground,
    });

    expect(contrastRatio(EMAIL_URGENCY.accent, EMAIL_COLORS.surface)).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(EMAIL_URGENCY.solidBackground, EMAIL_URGENCY.solidForeground),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(EMAIL_URGENCY_DARK.accent, EMAIL_COLORS_DARK.surface),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(EMAIL_URGENCY_DARK.solidBackground, EMAIL_URGENCY_DARK.solidForeground),
    ).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(EMAIL_COLORS.foreground, EMAIL_COLORS.surface)).toBeGreaterThanOrEqual(
      4.5,
    );
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
  it("mirrors every --email-* declaration verbatim (bar the documented quote swap)", () => {
    // The ONE transform the generator applies: CSS string literals are double-quoted (prettier's
    // house style), but an inline style="…" attribute is too — so the export re-quotes with '.
    const normalised = Object.fromEntries(
      Object.entries(EMAIL_CSS).map(([name, value]) => [name, value.replace(/"/g, "'")]),
    );
    expect(EMAIL_GEOMETRY_SOURCE).toEqual(normalised);
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

  it("holds the CTA to the 44px TOUCH-TARGET floor, not the web control height", () => {
    // A CONTRACT, not a restatement of the current value. Asserting only
    // `heightPx === EMAIL_CSS["--email-cta-height"]` is green for ANY number, which is exactly how
    // a 36px CTA (the old --control-height-lg mirror) survived: it clears SC 2.5.8 (AA, 24x24) and
    // nothing downstream could see that it failed SC 2.5.5 (AAA, 44x44), Apple HIG 44pt and
    // Material 48dp. Email is touch-only — no hover, no precise pointer, no reliable zoom — so the
    // AAA target size is the floor here. A consumer may still raise it; lowering it fails.
    expect(EMAIL_CTA.heightPx).toBeGreaterThanOrEqual(44);
    expect(EMAIL_CTA.lineHeightPx).toBeGreaterThanOrEqual(44);
    // and it is deliberately NOT the web control tier any more
    expect(EMAIL_CTA.heightPx).toBeGreaterThan(36);
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

// ── 2b. The SCR-302 canonical reference (gh#250) ────────────────────────────────────────────────
/**
 * Values measured from the canonical design source `.design/DXS Email Templates.dc.html`
 * (payment-failure card) and confirmed pixel-for-pixel against the 1440 reference raster
 * `.design/evidence/reference/email-1440.png` in dxs-platform/platform. Locking them here is what
 * stops a "tidy-up" from quietly walking the email ramp back onto the WEB scale — the two ramps are
 * deliberately different (an email is read once, in a client the reader cannot re-densify).
 */
describe("matches the SCR-302 canonical reference", () => {
  it("typography: 17px/500 title, 14px/1.9 body, 11px/1.8 legal band", () => {
    expect(EMAIL_TYPOGRAPHY.headingFontSizePx).toBe(17);
    expect(EMAIL_TYPOGRAPHY.headingFontWeight).toBe(500);
    expect(EMAIL_TYPOGRAPHY.headingLineHeight).toBe(1.7);
    expect(EMAIL_TYPOGRAPHY.bodyFontSizePx).toBe(14);
    expect(EMAIL_TYPOGRAPHY.bodyLineHeight).toBe(1.9);
    expect(EMAIL_TYPOGRAPHY.bodyFontWeight).toBe(400);
    expect(EMAIL_FOOTER.fontSizePx).toBe(11);
    expect(EMAIL_FOOTER.lineHeight).toBe(1.8);
    // the mobile title must never be LARGER than the desktop one
    expect(EMAIL_MOBILE.headingFontSizePx).toBeLessThan(EMAIL_TYPOGRAPHY.headingFontSizePx);
  });

  it("primary CTA: 44×auto, 16px inline padding, 6px radius, 14px/500 label", () => {
    // 44, not the 36 this pinned until 18.8.0 (dxs-platform/platform#559). The box used to mirror
    // --control-height-lg; that mirror is now deliberately broken, because a mail client is a
    // touch-only surface with no hover, no precise pointer and no dependable zoom.
    expect(EMAIL_CTA.heightPx).toBe(44);
    expect(EMAIL_CTA.lineHeightPx).toBe(44);
    expect(EMAIL_CTA.paddingXPx).toBe(16);
    expect(EMAIL_CTA.radiusPx).toBe(6);
    expect(EMAIL_CTA.fontSizePx).toBe(14);
    expect(EMAIL_CTA.fontWeight).toBe(500);
    // Clears WCAG 2.2 SC 2.5.8 Target Size (Minimum, AA, 24×24) as it always did, and now also
    // SC 2.5.5 Target Size (Enhanced, AAA, 44×44) / Apple HIG 44pt / Material 48dp.
    // The floor itself is asserted as a contract above, not just as this literal.
    expect(EMAIL_CTA.heightPx).toBeGreaterThanOrEqual(24);
    expect(EMAIL_MOBILE.ctaWidth).toBe("100%");
  });

  it("CTA colours come from the --primary role, never from a canonical hex paste", () => {
    expect(EMAIL_COLOR_SOURCE.primary.cssVar).toBe("--primary");
    expect(EMAIL_COLOR_SOURCE.primaryForeground.cssVar).toBe("--primary-foreground");
    expect(EMAIL_COLORS.primary).toBe(hslToHex(FOUNDATION_LIGHT["--primary"]));
    expect(EMAIL_COLORS.primaryForeground).toBe(hslToHex(FOUNDATION_LIGHT["--primary-foreground"]));
    expect(
      contrastRatio(EMAIL_COLORS.primary, EMAIL_COLORS.primaryForeground),
    ).toBeGreaterThanOrEqual(4.5);
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
      if (name.startsWith("--email-font-family-")) continue;
      expect(value, name).toMatch(/^\d+(?:\.\d+)?(?:px|%)?$/);
    }
  });

  it("the font stacks carry the canonical face and degrade to a generic, with no @font-face", () => {
    for (const stack of [EMAIL_TYPOGRAPHY.fontFamily, EMAIL_TYPOGRAPHY.monoFontFamily]) {
      expect(stack).not.toMatch(/url\(|@font-face/);
      // a double quote would close the style="…" attribute the value is written into
      expect(stack).not.toContain('"');
      // ASCII only: a non-ASCII family name does not survive every transfer encoding
      // eslint-disable-next-line no-control-regex
      expect(stack).toMatch(/^[\x20-\x7e]+$/);
    }
    expect(EMAIL_TYPOGRAPHY.fontFamily.startsWith("'Noto Sans JP'")).toBe(true);
    expect(EMAIL_TYPOGRAPHY.fontFamily).toContain("Arial");
    expect(EMAIL_TYPOGRAPHY.fontFamily.endsWith("sans-serif")).toBe(true);
    expect(EMAIL_TYPOGRAPHY.monoFontFamily.endsWith("monospace")).toBe(true);
    // the CSS source is the only author; the export differs from it ONLY by quote style
    expect(EMAIL_TYPOGRAPHY.fontFamily).toBe(
      EMAIL_CSS["--email-font-family-sans"].replace(/"/g, "'"),
    );
    expect(EMAIL_TYPOGRAPHY.monoFontFamily).toBe(EMAIL_CSS["--email-font-family-mono"]);
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
    // a double-quoted family would close style="…" mid-tag; the shipped stack must pass
    expect(() => emailInlineStyle({ fontFamily: '"M PLUS 2", sans-serif' })).toThrow(TypeError);
    expect(emailInlineStyle({ fontFamily: EMAIL_TYPOGRAPHY.fontFamily })).toBe(
      `font-family:${EMAIL_TYPOGRAPHY.fontFamily}`,
    );
  });

  it("EMAIL_TOKENS_JSON round-trips for non-JS template engines", () => {
    expect(JSON.parse(EMAIL_TOKENS_JSON)).toEqual(JSON.parse(JSON.stringify(EMAIL_TOKENS)));
    expect(JSON.parse(EMAIL_TOKENS_JSON).colors.primary).toBe(EMAIL_COLORS.primary);
    expect(JSON.parse(EMAIL_TOKENS_JSON).urgency.accent).toBe(EMAIL_URGENCY.accent);
  });

  it("serialises urgency as an inline-safe rail without changing surface body copy", () => {
    expect(
      emailInlineStyle({
        backgroundColor: EMAIL_COLORS.surface,
        borderTop: `${EMAIL_SHELL.borderWidth} solid ${EMAIL_URGENCY.accent}`,
        color: EMAIL_COLORS.foreground,
      }),
    ).toBe(
      `background-color:${EMAIL_COLORS.surface};border-top:${EMAIL_SHELL.borderWidth} solid ${EMAIL_URGENCY.accent};color:${EMAIL_COLORS.foreground}`,
    );
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

  it("uses the component's 32×32 viewBox, rendered in the canonical 22px header box", () => {
    expect(logo).toContain(`viewBox="${EMAIL_BRAND_MARK.viewBox}"`);
    // the ARTWORK space is the component's; only the RENDERED box is email-specific (gh#250)
    expect(EMAIL_BRAND_MARK.viewBox).toBe("0 0 32 32");
    expect(EMAIL_BRAND_MARK.widthPx).toBe(22);
    expect(EMAIL_BRAND_MARK.heightPx).toBe(22);
    expect(EMAIL_BRAND_MARK.widthPx).toBe(EMAIL_BRAND_MARK.heightPx);
  });

  it("publishes the header LOCKUP metrics, so a template never hand-types the wordmark", () => {
    expect(EMAIL_BRAND_MARK.gapPx).toBe(Number.parseFloat(EMAIL_CSS["--email-mark-gap"]));
    expect(EMAIL_BRAND_MARK.wordmarkFontSizePx).toBe(
      Number.parseFloat(EMAIL_CSS["--email-wordmark-font-size"]),
    );
    expect(EMAIL_BRAND_MARK.wordmarkFontWeight).toBe(
      Number.parseFloat(EMAIL_CSS["--email-wordmark-font-weight"]),
    );
    // the canonical SCR-302 header: 22px mark · 8px gap · 13px/700 wordmark
    expect(EMAIL_BRAND_MARK.gapPx).toBe(8);
    expect(EMAIL_BRAND_MARK.wordmarkFontSizePx).toBe(13);
    expect(EMAIL_BRAND_MARK.wordmarkFontWeight).toBe(700);
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
