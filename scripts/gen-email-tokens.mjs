#!/usr/bin/env node
/**
 * WHY A GENERATOR. HTML email cannot read CSS custom properties: Gmail/Outlook strip <style>
 * blocks and demand LITERAL inline values, so a Blade/Twig/MJML template can never `var()` the
 * design tokens.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const FOUNDATION = join(ROOT, "src/tokens/foundation.css");
// The identity artwork. Email carries the SAME two paths the web component paints, and it is
// GENERATED rather than imported because src/email may only import its own siblings — it has to
// stay consumable without the component runtime. Hand-copying is exactly what let the email mark
// stay a placeholder capsule while the web mark became the real artwork.
const MARK = join(ROOT, "src/brand/godx-mark.ts");

/** Pull an `export const NAME = "value";` string literal out of the shared artwork module. */
function markConst(source, name) {
  const m = new RegExp(`export const ${name} =\\s*"([^"]+)"`).exec(source);
  if (!m) throw new Error(`gen-email-tokens: ${name} not found in src/brand/godx-mark.ts`);
  return m[1];
}

const markSource = readFileSync(MARK, "utf8");
const mark = {
  viewBox: markConst(markSource, "GODX_MARK_VIEW_BOX"),
  transform: markConst(markSource, "GODX_MARK_TRANSFORM"),
  bodyPath: markConst(markSource, "GODX_MARK_BODY_PATH"),
  arrowPath: markConst(markSource, "GODX_MARK_ARROW_PATH"),
};
const EMAIL_CSS = join(ROOT, "src/tokens/components/email.css");
const OUT = join(ROOT, "src/email/tokens.generated.ts");
const OUT_REL = "src/email/tokens.generated.ts";
// SECOND CONSUMER OF THE SAME SEED (gh#823). `scripts/visual-audit.mjs` ships to consumers and runs
// standalone out of their node_modules, so it cannot import the `.ts` above — it gets a plain .mjs
// sibling carrying the one value its 渋み rule has to recognise as ours. Generated here, from the
// same foundation.css read, so the exemption moves if the brand ever does.
const ACCENT_OUT = join(ROOT, "scripts/brand-accent.generated.mjs");
const ACCENT_OUT_REL = "scripts/brand-accent.generated.mjs";

/**
 * The email palette ↔ web role map. LEFT is the stable public email token name, RIGHT is the
 * semantic role in foundation.css it derives from.
 */
export const EMAIL_COLOR_ROLES = {
  background: "--background",
  foreground: "--foreground",
  surface: "--card",
  surfaceForeground: "--card-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  // The focus hue. It reads `--primary` and not `--ring` because `--ring` is no longer a value:
  // There is no separate focus-colour token — a focused control simply takes the primary —
  // so the generated tier declares `--ring: var(--primary)`. An email is a static document
  // with no focus state; this slot exists so a CTA can be tinted with the same hue the app
  // focuses with, and the seed is where that hue lives.
  focus: "--primary",
  // IDENTITY, not status: the GoDX capsule reads --brand (canonical emerald), the same role
  // `--logo-godx-color` defaults to on the web.
  brand: "--brand",
  brandForeground: "--brand-foreground",
  urgency: "--attention",
  urgencyForeground: "--attention-foreground",
};

/** Extract the declarations of a top-level CSS block, keyed by custom-property name. */
function readBlock(css, selectorPattern, file) {
  const start = css.search(selectorPattern);
  if (start < 0) throw new Error(`${file}: block ${selectorPattern} not found`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  if (open < 0 || close < 0) throw new Error(`${file}: block ${selectorPattern} is unterminated`);
  const body = css.slice(open + 1, close);
  const decls = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    decls[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }
  return decls;
}

/** A colour role must be a bare `H S% L%` channel triplet — anything else is not email-derivable. */
const TRIPLET = /^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/;

/** `H S% L%` → integer sRGB channels — the CSS Color 4 conversion a browser applies to `hsl()`. */
function hslTripletToRgb(triplet) {
  const [h, s, l] = triplet.replace(/%/g, "").split(/\s+/).map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return { r: channel(0), g: channel(8), b: channel(4) };
}

function collectPalette(decls, where) {
  const out = {};
  for (const [token, role] of Object.entries(EMAIL_COLOR_ROLES)) {
    const value = decls[role];
    if (!value) throw new Error(`${where}: role ${role} (email token "${token}") is missing`);
    if (!TRIPLET.test(value)) {
      throw new Error(
        `${where}: role ${role} is "${value}" — the email export needs a bare HSL triplet ` +
          `(H S% L%) so it can be converted to hex.`,
      );
    }
    out[token] = { cssVar: role, hsl: value };
  }
  return out;
}

const foundation = readFileSync(FOUNDATION, "utf8");
const light = collectPalette(readBlock(foundation, /^:root\s*\{/m, FOUNDATION), "foundation :root");
const dark = collectPalette(
  readBlock(foundation, /^\.dark,\s*\n:root\[data-theme="dark"\]\s*\{/m, FOUNDATION),
  "foundation .dark",
);

const geometry = readBlock(readFileSync(EMAIL_CSS, "utf8"), /^:root\s*\{/m, EMAIL_CSS);
for (const name of Object.keys(geometry)) {
  if (!name.startsWith("--email-")) throw new Error(`${EMAIL_CSS}: stray token ${name}`);
  if (/var\(|calc\(/.test(geometry[name])) {
    throw new Error(
      `${EMAIL_CSS}: ${name} is "${geometry[name]}" — email tokens must be LITERAL values ` +
        `(no var()/calc(); email clients resolve neither).`,
    );
  }
  // Quote normalisation. A multi-word font family MUST be quoted in CSS ("M PLUS 2" is not a valid
  // unquoted identifier sequence), and the repo's prettier config writes CSS strings with DOUBLE
  // quotes. But the only place an email consumes this value is an inline `style="…"` attribute,
  // which a double quote terminates. CSS treats '…' and "…" identically, so the export swaps to
  // single quotes here — one transform, in the one place that already owns CSS→export conversion,
  // instead of a hand-maintained second copy of the stack.
  geometry[name] = geometry[name].replace(/"/g, "'");
  if (geometry[name].includes('"')) {
    throw new Error(`${EMAIL_CSS}: ${name} still carries a double quote after normalisation`);
  }
}

const body = `// AUTO-GENERATED by scripts/gen-email-tokens.mjs — do not edit.
// Sources: src/tokens/foundation.css (colour roles) + src/tokens/components/email.css (geometry).
// Run \`node scripts/gen-email-tokens.mjs\` (guard: \`node scripts/gen-email-tokens.mjs --check\`).

/** One email colour slot and the web role it is derived from. \`hsl\` is the raw channel triplet. */
export interface EmailColorSource {
  /** The semantic role in src/tokens/foundation.css this slot mirrors. */
  readonly cssVar: string;
  /** The role's HSL channel triplet, verbatim (\`H S% L%\`). Converted to hex at module load. */
  readonly hsl: string;
}

/** Light-scheme colour sources — the canonical transactional-email palette. */
export const EMAIL_COLOR_SOURCE = ${JSON.stringify(light, null, 2)} as const;

/** Dark-scheme colour sources, for \`@media (prefers-color-scheme: dark)\` overrides. */
export const EMAIL_COLOR_SOURCE_DARK = ${JSON.stringify(dark, null, 2)} as const;

/** Raw \`--email-*\` declarations from the component token tier, verbatim. */
export const EMAIL_GEOMETRY_SOURCE = ${JSON.stringify(geometry, null, 2)} as const;

/**
 * The GoDX identity artwork — the same two paths \`<Logo mark="godx" />\` paints, from
 * \`src/brand/godx-mark.ts\`. Regenerate with the rest of this file; \`--check\` fails on drift.
 */
export const EMAIL_MARK_SOURCE = ${JSON.stringify(mark, null, 2)} as const;
`;

/**
 * The light-scheme roles that ARE the GoDX identity: the accent a consumer receives from this
 * package rather than picks. Deduplicated by resolved sRGB, so while `--primary` and `--brand`
 * hold the same violet they produce ONE entry naming both.
 */
const BRAND_ACCENT_ROLES = ["primary", "brand"];
const brandAccents = [];
for (const token of BRAND_ACCENT_ROLES) {
  const { cssVar, hsl } = light[token];
  const rgb = hslTripletToRgb(hsl);
  const same = brandAccents.find(
    (a) => a.rgb.r === rgb.r && a.rgb.g === rgb.g && a.rgb.b === rgb.b,
  );
  if (same) same.cssVars.push(cssVar);
  else brandAccents.push({ cssVars: [cssVar], hsl, rgb });
}

const accentBody = `// AUTO-GENERATED by scripts/gen-email-tokens.mjs — do not edit.
// Source: src/tokens/foundation.css (:root — the LIGHT scheme).
// Run \`node scripts/gen-email-tokens.mjs\` (guard: \`node scripts/gen-email-tokens.mjs --check\`).

/**
 * The accent colour(s) THIS PACKAGE SHIPS as its own default — the one accent on a consumer's page
 * that the consumer did not choose and cannot change without abandoning the GoDX brand (gh#823).
 * \`scripts/visual-audit-rules.mjs\` exempts exactly these from the 渋み chroma bound.
 *
 * LIGHT SCHEME ONLY, deliberately: the dark \`--primary\`/\`--brand\` (#DCBCFF) measures OKLCH
 * chroma 0.097, comfortably inside the 0.18 bound, so it never reaches an exemption. Listing it
 * would widen the carve-out for nothing.
 */
export const SHIPPED_BRAND_ACCENTS = ${JSON.stringify(brandAccents, null, 2)};
`;

const OUTPUTS = [
  { path: OUT, rel: OUT_REL, body },
  { path: ACCENT_OUT, rel: ACCENT_OUT_REL, body: accentBody },
];

if (process.argv.includes("--check")) {
  const stale = OUTPUTS.filter((o) => {
    let current = "";
    try {
      current = readFileSync(o.path, "utf8");
    } catch {
      /* missing → stale */
    }
    return current !== o.body;
  });
  if (stale.length) {
    console.error(
      `✗ check:email-token-sync — ${stale.map((o) => o.rel).join(", ")} ` +
        `${stale.length === 1 ? "is" : "are"} stale. Run \`node scripts/gen-email-tokens.mjs\`.`,
    );
    process.exit(1);
  }
  console.log(
    `✓ check:email-token-sync — ${Object.keys(light).length} colour roles + ` +
      `${Object.keys(geometry).length} email tokens + ${brandAccents.length} brand accent(s) ` +
      `derived from the web tokens.`,
  );
} else {
  for (const o of OUTPUTS) writeFileSync(o.path, o.body);
  console.log(
    `wrote ${OUT_REL} (${Object.keys(light).length} colour roles, ` +
      `${Object.keys(geometry).length} email tokens) and ` +
      `${ACCENT_OUT_REL} (${brandAccents.length} brand accent(s))`,
  );
}
