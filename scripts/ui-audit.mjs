#!/usr/bin/env node
/**
 * godxjp-ui audit — the design system's own linter for consumer UI code. Enforces the
 * UI-standardization rules that ship with @godxjp/ui (see the app's
 * .claude/skills/frontend-design/rules/ui-standardization.md): use the design system, never
 * hand-roll.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const CWD = process.cwd();
const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const quiet = args.includes("--quiet");
const dirArgs = args.filter((a) => !a.startsWith("--") && a !== "json");
const SCAN_DIRS = dirArgs.length
  ? dirArgs
  : ["resources/js/components", "resources/js/pages", "resources/js/layouts"];

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone";

/**
 * Emoji in product text — Unicode "Extended_Pictographic" set (UTS #51). Catches
 * ✅🎉🔥🚀 etc. but NOT typographic punctuation (· — × ✓), which have their own rules.
 */
const EMOJI = /\p{Extended_Pictographic}/u;
/** Regional-indicator pairs = emoji flags (🇯🇵) — broken on Win/Linux; use Intl.DisplayNames. */
const EMOJI_FLAG = /\p{Regional_Indicator}/u;

/**
 * @type {{id:string, severity:'error'|'warn', test:RegExp, message:string, standard?:string, exempt?:RegExp}[]}
 *
 * `exempt` is an optional SECOND escape a rule may declare, matched against the ORIGINAL (un-blanked)
 * line or the one above it. `ui-audit-disable-line <id>` silences any rule; an `exempt` marker is for
 * a rule whose correct answer is sometimes "this value is deliberate" rather than "skip the check",
 * and it makes the reason part of the source instead of a bare opt-out.
 *
 * `standard` cites the international spec a rule enforces, so a finding is auditable
 * against a real norm rather than house taste alone:
 *   WCAG 2.2 (W3C Rec) · WAI-ARIA 1.2 + APG (W3C) · ECMA-402 Intl (TC39) ·
 *   Unicode UTS #51 emoji · BCP-47 · ISO 4217 / 3166 / 8601 · IANA tz ·
 *   CSS Logical Properties L1 (W3C) · HTML Living Standard (WHATWG).
 */
const RULES = [
  {
    id: "no-utility-spacing",
    scope: "consumer",
    severity: "error",
    // Any Tailwind spacing step on the consumer's own markup. Arbitrary values ([13px]) have their
    // own rule; this is README rule 3, documented for a long time and never enforced: rhythm
    // comes from Flex gap / ResponsiveGrid / PageContainer, never from gap-*/p-*/m-* utilities.
    test: /\b(?:gap|gap-x|gap-y|p|px|py|pt|pb|ps|pe|pl|pr|m|mx|my|mt|mb|ms|me|ml|mr)-(?:\d+(?:\.\d+)?|px)\b/,
    message:
      "No Tailwind spacing utilities (gap-*/p-*/m-*) for layout — space siblings with <Flex gap> / <ResponsiveGrid>; sections of a page are spaced by <PageContainer> (docs/CONSUMER-RULES.md §3).",
  },
  {
    id: "no-utility-layout",
    scope: "consumer",
    severity: "error",
    // A hand-rolled flex/grid container. The primitives exist precisely so a row is <Flex>, a
    // stack is <Flex direction="col">, a grid is <ResponsiveGrid> — token gaps, RTL, density.
    test: /className=(?:"[^"]*|'[^']*|\{`[^`]*)(?<![\w-])(?:flex|inline-flex|grid|inline-grid)(?![\w-])/,
    message:
      'No hand-rolled flex/grid — use <Flex> (row), <Flex direction="col"> (stack) or <ResponsiveGrid> (docs/CONSUMER-RULES.md §3).',
  },
  {
    id: "no-hand-rolled-surface",
    scope: "consumer",
    severity: "warn",
    // rounded + border/bg on the consumer's own element = a fake Card / Badge / Avatar / ListRow
    // that drifts from the real ones (a 38px account pill beside 32px controls).
    test: /className=(?:"[^"]*|'[^']*|\{`[^`]*)\brounded(?:-(?:full|sm|md|lg|xl|2xl))?\b[^"'`]*\b(?:border|bg-)/,
    message:
      "Hand-rolled surface (rounded + border/bg) — use Card, Badge, Avatar, ListRow, Descriptions or EmptyState so height, padding and radius come from the tokens (docs/CONSUMER-RULES.md §4).",
  },
  {
    id: "no-space-xy",
    severity: "error",
    test: /\bspace-[xy]-\d/,
    message: "Use <Stack>/<Inline> with gap, not space-x/y-* (rules §5).",
  },
  {
    id: "no-raw-palette-color",
    severity: "error",
    test: new RegExp(
      `\\b(bg|text|border|ring|fill|stroke|from|to|via|divide|outline)-(${PALETTE})-\\d`,
    ),
    message:
      "Use semantic tokens (bg-primary, text-muted-foreground…), not raw palette colors (rules §4).",
  },
  {
    id: "status-tone-not-variant",
    severity: "error",
    // Only the tone-driven status components (Badge/Tag/StatCard) are wrong here — they expose a
    // `tone` prop and reserve `variant` for STRUCTURE (default|secondary|outline). Button, Alert,
    // DropdownMenuItem, ContextMenuItem, AlertDialog etc. legitimately use `variant` for emphasis,
    // so they must NOT be flagged.
    test: /<(?:Badge|Tag|StatCard)\b[^>]*\bvariant=["'](?:success|warning|destructive|info|neutral)["']/,
    message:
      "Badge/Tag/StatCard status uses tone, not variant (variant is structural: default|secondary|outline). Use tone='success|warning|destructive|info|neutral'.",
  },
  {
    id: "no-domain-tracking-token",
    severity: "error",
    test: /--(?:color-)?tracking-|--(?:tracking|color-tracking)-(?:internal|seller|yamato)/,
    message:
      "Package tracking/domain tokens are forbidden. Use semantic tokens or app-local theme overrides.",
  },
  {
    id: "value-callback-on-value-change",
    severity: "error",
    test: /<(?:Checkbox\.Group|Upload|Cascader|TreeSelect|Transfer|SearchSelect|DatePicker|DateRangePicker|TimePicker|ColorPicker|LocalePicker|TimezonePicker|DateFormatPicker|TimeFormatPicker)\b[^>]*\bonChange=/,
    message:
      "Abstract value components use onValueChange, not onChange. Reserve onChange for DOM events.",
  },
  {
    id: "no-arbitrary-hex",
    severity: "error",
    test: /(bg|text|border|ring|fill|stroke|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/,
    message: "No hardcoded hex colors in className; use design-system tokens (rules §4).",
  },
  // Arbitrary RAW-NUMERIC Tailwind values — the #1 source of "every agent does it
  // differently". Match `<util>-[<digit/.>...]` only; `var(--token)` / `calc()` escape
  // (they start with a letter), so token-driven values stay legal (rules §4–§5).
  {
    id: "no-arbitrary-spacing",
    severity: "error",
    test: /\b(p|px|py|pt|pb|pl|pr|pe|ps|m|mx|my|mt|mb|ml|mr|me|ms|gap|gap-x|gap-y|inset|inset-x|inset-y|top|right|bottom|left)-\[-?\.?\d/,
    message:
      "No arbitrary spacing (p-[13px], gap-[7px]…). Use the token scale / <Stack gap> / <Inline gap> / <PageContainer> (rules §5).",
  },
  {
    id: "no-arbitrary-size",
    severity: "error",
    // `min-w-[…]` / `min-h-[…]` are allowed: a MINIMUM dimension is the legit responsive
    // pattern (horizontal-scroll tables `<Table className="min-w-[720px]">`, collapse
    // guards), not a hardcoded design size. The (?<!min-) lookbehind exempts the `min-`
    // prefix; bare `w`/`h` still catch `max-w-[…]`, `w-[37px]`, `h-[260px]`, etc.
    test: /\b(?<!min-)(?:w|h|size|basis)-\[-?\.?\d/,
    message:
      "No arbitrary width/height (w-[37px], max-w-[65ch], h-[260px]…). Use token sizes or a sizing prop. min-w-[…]/min-h-[…] are allowed (responsive scroll containers / collapse guards).",
  },
  {
    id: "no-arbitrary-typography",
    severity: "error",
    test: /\b(text|leading|tracking|font)-\[-?\.?\d/,
    message:
      "No arbitrary type (text-[20px], leading-[1.7], font-[600]…). Use the type-scale tokens (text-xs…text-3xl) (rules §4).",
  },
  {
    id: "no-arbitrary-radius",
    severity: "error",
    test: /\brounded(?:-[a-z]+)?-\[-?\.?\d/,
    message: "No arbitrary radius (rounded-[6px]…). Use rounded-sm/md/lg radius tokens (rules §4).",
  },
  // The token-override half of the arbitrary-value rules above. Those catch a raw number in a
  // Tailwind class; this catches one in a design-system KNOB the app sets itself
  // (`style={{ "--card-space-inset": "13px" }}`), which is the sanctioned per-instance override
  // route and therefore the one place an app can silently leave the scale. Framework-side the same
  //
  // Only axes that HAVE named steps are flagged — space, font-size, radius, icon-size. width /
  // height / size / offset have no scale yet, so a number there is the only thing to write and is
  // NOT a finding; the name pattern's two lookaheads exist to let `--x-space-offset` and
  // `--x-font-size-width` fall out on their trailing axis, matching the framework guard's
  // "furthest-right axis wins" resolution (verified name-for-name against all 982 published
  // component tokens). `var(--space-4)` and `calc(var(--radius) - 1px)` derive from a scale, `0`
  // and `1px` (the device hairline) are steps of nothing, and `100%` / `1.5` are not lengths.
  {
    id: "no-off-scale-token-value",
    severity: "warn",
    test: new RegExp(
      // --<component>-<…>-<axis-with-a-scale>… , unless a trailing axis WITHOUT one wins
      String.raw`--(?![a-z0-9-]*-(?:offset|width|height)(?=["'\s]*:))` +
        String.raw`(?![a-z0-9-]*(?<!font)(?<!icon)-size(?=["'\s]*:))` +
        String.raw`[a-z0-9-]*-(?:font-size|icon-size|padding|gap|margin|radius|space)(?:-[a-z0-9]+)*` +
        // : "<value>" — no `var(--<that axis's scale>)` anywhere in it …
        String.raw`\s*["']?\s*:\s*["'\`]?(?![^"'\`;,}\n]*var\(\s*--(?:font-size|space|radius|icon-size)[-)])` +
        // … and it bakes a length that is neither 0 nor the 1px hairline.
        String.raw`[^"'\`;,}\n]*(?<![\w.])(?!0(?![\d.]))(?!1px\b)\d*\.?\d+(?:rem|px|em|ch|ex|pt|pc|cm|mm|in|q)\b`,
    ),
    /** The one sanctioned off-grid escape, mirroring the framework guard: a block comment reading
     *  `scale-exempt: <why>` (12+ chars of real prose) on this line or the one above. Read from the
     *  ORIGINAL line, since the scanner blanks comments before the `test` runs. */
    exempt: /\/\*+\s*scale-exempt:\s*\S[^*]{11,}?\*\//,
    message:
      "This token override leaves a scale that exists. Write a step (var(--space-4), var(--font-size-sm), var(--radius-md), var(--icon-size-md)), or derive from one (calc(var(--space-4) + 2px)). A value that is genuinely off-grid stays a literal and says so in place: /* scale-exempt: 6px status dot, below --space-1 */.",
  },
  {
    id: "no-raw-select",
    severity: "error",
    test: /<select[\s>]/,
    message: "Use <Select> from @godxjp/ui, not a raw <select> (rules §3).",
  },
  {
    id: "no-raw-table",
    severity: "error",
    test: /<table[\s>]/,
    message: "Use the <Table> family from @godxjp/ui, not a raw <table> (rules §3).",
  },
  {
    id: "no-raw-textarea",
    severity: "warn",
    test: /<textarea[\s>]/,
    message: "Use <Textarea> from @godxjp/ui, not a raw <textarea> (rules §3).",
  },
  {
    id: "no-raw-input",
    severity: "error",
    test: /<input[\s>]/,
    message: "Use <Input> from @godxjp/ui, not a raw <input> (rules §3).",
  },
  {
    id: "no-raw-button",
    severity: "error",
    test: /<button[\s>]/,
    message: "Use <Button> from @godxjp/ui, not a raw <button> (rules §3).",
  },
  {
    id: "card-manual-padding",
    severity: "error",
    test: /<Card\b[^>]*\bp-[1-9]/,
    message:
      "Don't hand-roll padding on <Card> (className='p-4'…) — wrap the body in <CardContent>. (p-0 for a full-bleed table is fine.)",
  },
  {
    id: "no-dark-color-override",
    severity: "warn",
    test: /\bdark:(bg|text|border|ring|fill|stroke)-/,
    message: "Don't add dark: color overrides — semantic tokens already adapt (rules §4).",
  },
  {
    id: "manual-field-error",
    severity: "warn",
    test: /<p[^>]*className="[^"]*text-(xs|sm)[^"]*text-destructive/,
    message:
      "Field errors should use <FormField error=…>, not a hand-rolled <p> (rules §1). OK only for checkbox/radio groups.",
  },
  {
    id: "manual-field-helper",
    severity: "warn",
    test: /<p[^>]*className="text-xs text-muted-foreground"/,
    message:
      "Field helper text should use <FormField helper=…>, not a hand-rolled <p> (rules §1). OK only for checkbox/radio groups.",
  },
  {
    id: "raw-white-black",
    severity: "warn",
    test: /\b(bg|text|border)-(white|black)\b/,
    message:
      "Prefer semantic tokens (text-primary-foreground, bg-background…) over raw white/black (rules §4).",
  },

  // ─── International-standard a11y / i18n / RTL rules (WARN — guide the agent, never block) ───
  {
    id: "no-emoji-in-ui",
    severity: "warn",
    test: EMOJI,
    standard: "Unicode UTS #51 (emoji) · WCAG 2.2 SC 1.1.1",
    message:
      "No emoji in product UI (✅🎉🔥…). State the fact quietly in i18n-keyed copy; use a Lucide icon for affordance and a Badge `tone` for status. Emoji break on Win/Linux and pollute the accessible name.",
  },
  {
    id: "no-emoji-flag",
    severity: "warn",
    test: EMOJI_FLAG,
    standard: "ISO 3166-1 · ECMA-402 Intl.DisplayNames · Unicode UTS #51",
    message:
      "No emoji flags (🇯🇵) — they render inconsistently across OSes. Derive country names from Intl.DisplayNames(locale, { type: 'region' }) keyed by ISO 3166-1 alpha-2.",
  },
  {
    id: "no-physical-direction",
    severity: "warn",
    // Physical-edge utilities break RTL. Logical equivalents: ms-/me-/ps-/pe-, start-/end-,
    // text-start/end, border-s/e, rounded-s/e. `-mx-`/`-px-` (both edges) are RTL-safe → not matched.
    test: /\b-?(ml|mr|pl|pr|left|right)-(?:\d|\[|auto|px|full)|\b(?:rounded-[tb]?[lr]|border-[lr]|text-(?:left|right))\b/,
    standard: "W3C CSS Logical Properties & Values L1 · WCAG 2.2 (1.3.2 / reflow)",
    message:
      "Use LOGICAL direction utilities for RTL safety: ms-/me-/ps-/pe-, start-/end-, text-start/end, border-s/e, rounded-s/e — not physical ml-/mr-/pl-/pr-/left-/right-/text-left|right.",
  },
  {
    id: "icon-button-needs-name",
    severity: "warn",
    // An icon-only Button (size="icon") with no author-supplied accessible name. A combobox/icon
    // button's name is computed from author (aria-label / aria-labelledby / title), not glyph content.
    test: /<Button\b(?=[^>]*\bsize=["']icon["'])(?![^>]*\b(?:aria-label|aria-labelledby|title)=)[^>]*>/,
    standard: "WCAG 2.2 SC 4.1.2 · 1.1.1 · WAI-ARIA 1.2",
    message:
      "Icon-only <Button size=\"icon\"> needs an accessible name — add aria-label={t('…')}. The icon is decorative (aria-hidden); the name comes from the author, not the glyph.",
  },
  {
    id: "img-needs-alt",
    severity: "warn",
    test: /<img\b(?![^>]*\balt=)[^>]*>/,
    standard: "WCAG 2.2 SC 1.1.1 · HTML Living Standard (WHATWG)",
    message:
      'Every <img> needs an alt attribute (alt="" for purely decorative images). Prefer the <Avatar>/<AspectRatio> primitives for product imagery.',
  },
  {
    id: "no-positive-tabindex",
    severity: "warn",
    test: /tab[Ii]ndex=(?:["']?[1-9]|\{[1-9])/,
    standard: "WCAG 2.2 SC 2.4.3 · WAI-ARIA APG",
    message:
      "No positive tabIndex — it breaks the natural focus order. Use tabIndex={0} (focusable) or {-1} (programmatic) only; manage roving focus via the primitive.",
  },
  {
    id: "hardcoded-currency",
    severity: "warn",
    // A currency glyph glued to an interpolation in JSX text: `>¥{amount}` / `>{x}円`.
    test: /(?:>[\s]*[¥$€£₫]\s*\{)|(?:\}\s*円)/,
    standard: "ISO 4217 · ECMA-402 Intl.NumberFormat",
    message:
      "Don't hand-format currency (¥{amount}). Use Intl.NumberFormat(locale, { style: 'currency', currency }) — ISO 4217 code drives the symbol and minor units per locale.",
  },
  {
    id: "raw-intl-date",
    severity: "warn",
    // Only the unambiguously-Date methods: `.toLocaleDateString()` / `.toLocaleTimeString()`.
    // Bare `.toLocaleString()` is excluded on purpose — it is overwhelmingly
    // `Number.prototype.toLocaleString()` (legit locale number formatting), and matching it
    // false-flagged every formatted count/amount. A date+time `Date.toLocaleString()` is rare and
    // still partly covered by the hand-built `new Date(...).getMonth()+` alternative below.
    test: /\.toLocale(?:Date|Time)String\(\s*\)|new Date\([^)]*\)\.(?:getMonth|getDate|getFullYear)\(\)\s*\+/,
    standard: "ISO 8601 · IANA tz database · ECMA-402 Intl.DateTimeFormat",
    message:
      "Don't hand-build or locale-default dates. Use formatDate from @godxjp/ui/datetime (Intl.DateTimeFormat + IANA timezone + ISO-8601), which respects the AppProvider locale/timezone.",
  },
  {
    id: "hand-rolled-close-glyph",
    severity: "warn",
    // A literal close glyph as JSX text — almost always a hand-rolled dismiss that should be a slot.
    test: />\s*[✕✖×╳]\s*</,
    standard: "WAI-ARIA 1.2 (dialog) · WCAG 2.2 SC 4.1.2 · @godxjp/ui Alert/Dialog anatomy",
    message:
      "Don't hand-roll a ✕ close. Pass onDismiss to <Alert> (renders the × top-right with an aria-label), or use <Dialog>/<Sheet> which ship their own labelled close. A bare glyph has no accessible name.",
  },
  {
    id: "no-em-dash-in-copy",
    severity: "warn",
    // Em-dash (U+2014) in JSX text — the reference design uses the middot `·` for JP/EN pairs and calm copy.
    test: /[A-Za-z0-9぀-ヿ一-鿿]\s*—\s*[A-Za-z0-9぀-ヿ一-鿿]/,
    standard: "@godxjp/ui reference-design typography (best-ux) · Unicode punctuation",
    message:
      "No em-dash (—) in product copy. Use a middot `·` for JP/EN label pairs, or restructure into two calm sentences. Keep copy factual and quiet.",
  },
];

/**
 * `--rules` — print the full rule catalog (id · severity · standard · message) as JSON and exit.
 * The single source of truth other tooling (the MCP `list_audit_rules`, the sync guard) reads,
 * so the executable rules and the agent-facing docs never drift.
 */
if (args.includes("--rules")) {
  process.stdout.write(
    JSON.stringify(
      RULES.map((r) => ({
        id: r.id,
        severity: r.severity,
        standard: r.standard ?? null,
        message: r.message,
      })),
      null,
      2,
    ) + "\n",
  );
  // Not process.exit(): stdout to a pipe is asynchronous, and exiting on
  // the next line cut the report at 64 KB for a consumer with many findings
  // (measured: 65536 of 367635 bytes reached Laravel's Process, and its
  // JSON parse failed). Setting the code lets the stream drain.
  process.exitCode = 0;
}

/**
 * Blank out `//` line comments and block comments (incl. JSDoc) — replacing them with spaces and
 * preserving newlines so line numbers stay accurate — while KEEPING string/template literals (the
 * className values we actually want to scan).
 */
function stripComments(src) {
  let out = "";
  let state = "code"; // code | line | block | string
  let quote = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (state === "code") {
      if (c === "/" && n === "/") {
        state = "line";
        out += "  ";
        i++;
      } else if (c === "/" && n === "*") {
        state = "block";
        out += "  ";
        i++;
      } else if (c === '"' || c === "'" || c === "`") {
        state = "string";
        quote = c;
        out += c;
      } else {
        out += c;
      }
    } else if (state === "line") {
      if (c === "\n") {
        state = "code";
        out += c;
      } else out += " ";
    } else if (state === "block") {
      if (c === "*" && n === "/") {
        state = "code";
        out += "  ";
        i++;
      } else out += c === "\n" ? "\n" : " ";
    } else {
      // string
      out += c;
      if (c === "\\") {
        out += src[i + 1] ?? "";
        i++;
      } else if (c === quote) state = "code";
    }
  }
  return out;
}

/** A finding is suppressed by `ui-audit-disable-line <rule>` on the same line, or
 *  `ui-audit-disable-next-line <rule>` on the line above (explicit rule id required). */
function isSuppressed(ruleId, sameLine, prevLine) {
  const onSame = new RegExp(`ui-audit-disable-line\\b[^\\n]*\\b${ruleId}\\b`).test(sameLine ?? "");
  const onPrev = new RegExp(`ui-audit-disable-next-line\\b[^\\n]*\\b${ruleId}\\b`).test(
    prevLine ?? "",
  );
  return onSame || onPrev;
}

/** A rule's own in-place escape (see the `exempt` note on RULES), on the same line or the one above.
 *  Read from the ORIGINAL lines, because the scanner blanks comments before `rule.test` runs. */
function isExempt(rule, sameLine, prevLine) {
  if (!rule.exempt) return false;
  return rule.exempt.test(sameLine ?? "") || rule.exempt.test(prevLine ?? "");
}

function walk(dir, acc = []) {
  // Accept a FILE path directly (the per-file editor hook passes one), not just a directory.
  try {
    if (statSync(dir).isFile()) {
      if (dir.endsWith(".tsx") || dir.endsWith(".ts")) acc.push(dir);
      return acc;
    }
  } catch {
    return acc;
  }
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Test/story dirs are not product UI — never hold them to the UI-standardization rules.
      if (name === "__tests__" || name === "node_modules") continue;
      walk(full, acc);
    } else if (
      (name.endsWith(".tsx") || name.endsWith(".ts")) &&
      !/\.(test|spec|stories)\.tsx?$/.test(name)
    ) {
      acc.push(full);
    }
  }
  return acc;
}

// Structural: a <Card> (without p-0) whose first child is body content rather than a Card
// sub-component sits FLUSH (no padding). Per-line regexes can't see across lines, so this is a
// whole-file pass. The body must be wrapped in <CardContent> (titles in <CardHeader>).
const CARD_FLUSH =
  /<Card(?![^>]*\bp-0\b)(?:\s[^>]*)?>\s*<(?!CardContent|CardHeader|CardCover|CardFooter|CardBar|\/Card)/g;

// Structural: a bare <label>/<Label> paired with a TEXT control (its sibling) instead of a
// <FormField>. FormField OWNS the label↔control association (htmlFor/id), aria-describedby/
// error wiring, AND the field rhythm (label gap + field spacing) — a hand-rolled Label+Input
// loses all of it (the cramped login-form failure mode). Checkbox/Radio/Switch use Field/Label
// legitimately, so they are NOT matched. Whole-file pass (the pair spans lines).
const BARE_FIELD =
  /<(?:label|Label)\b[^>]*>[\s\S]{0,240}?<\/(?:label|Label)>\s*<(?:Input|Select|Textarea|NumberInput|SearchInput|SearchSelect|DatePicker|DateRangePicker|TimePicker|MonthPicker|MonthRangePicker|Cascader|TreeSelect|input)\b/g;

// Two <Card> siblings written back to back at the same indentation with nothing between them.
// Direct children of PageContainer are spaced by the page; anywhere else they touch.
const SIBLING_CARDS = /^([ \t]*)<\/Card>\s*\n\1<Card\b/gm;

/**
 * `scope: "consumer"` rules ban utilities on a CONSUMER's own markup. Inside the library repo the
 * utilities are the design system itself (that is where `flex`/`gap-*` are supposed to live), so
 * those rules are skipped when the CWD package is @godxjp/ui — unless `--consumer` forces them.
 */
const SELF = (() => {
  try {
    return JSON.parse(readFileSync(join(CWD, "package.json"), "utf8")).name === "@godxjp/ui";
  } catch {
    return false;
  }
})();
const ACTIVE_RULES =
  SELF && !args.includes("--consumer") ? RULES.filter((r) => r.scope !== "consumer") : RULES;

const findings = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(isAbsolute(dir) ? dir : join(CWD, dir))) {
    const rel = relative(CWD, file);
    const content = readFileSync(file, "utf8");
    const origLines = content.split("\n");
    const scanContent = stripComments(content); // comments blanked; strings + line numbers kept
    const scanLines = scanContent.split("\n");
    scanLines.forEach((line, i) => {
      for (const rule of ACTIVE_RULES) {
        if (
          rule.test.test(line) &&
          !isSuppressed(rule.id, origLines[i], origLines[i - 1]) &&
          !isExempt(rule, origLines[i], origLines[i - 1])
        ) {
          findings.push({
            file: rel,
            line: i + 1,
            rule: rule.id,
            severity: rule.severity,
            standard: rule.standard,
            message: rule.message,
            snippet: (origLines[i] ?? line).trim().slice(0, 120),
          });
        }
      }
    });
    for (const match of scanContent.matchAll(CARD_FLUSH)) {
      const lineNo = scanContent.slice(0, match.index).split("\n").length;
      if (isSuppressed("card-needs-content", origLines[lineNo - 1], origLines[lineNo - 2]))
        continue;
      findings.push({
        file: rel,
        line: lineNo,
        rule: "card-needs-content",
        severity: "error",
        message:
          "<Card> body content must be wrapped in <CardContent> (it has NO padding otherwise) — use <CardContent flush> only for a full-bleed table.",
        snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
      });
    }
    if (
      !(SELF && !args.includes("--consumer")) &&
      !/<(?:Flex|ResponsiveGrid|PageContainer)\b/.test(scanContent)
    ) {
      for (const match of scanContent.matchAll(SIBLING_CARDS)) {
        const lineNo = scanContent.slice(0, match.index).split("\n").length + 1;
        if (isSuppressed("sibling-cards-need-flex", origLines[lineNo - 1], origLines[lineNo - 2]))
          continue;
        findings.push({
          file: rel,
          line: lineNo,
          rule: "sibling-cards-need-flex",
          severity: "warn",
          message:
            'Adjacent <Card> siblings with no layout owner — wrap them in <Flex direction="col" gap="lg"> or <ResponsiveGrid> (inside PageContainer the page spaces them for you).',
          snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
        });
      }
    }
    for (const match of scanContent.matchAll(BARE_FIELD)) {
      const lineNo = scanContent.slice(0, match.index).split("\n").length;
      if (
        isSuppressed("bare-control-needs-formfield", origLines[lineNo - 1], origLines[lineNo - 2])
      )
        continue;
      findings.push({
        file: rel,
        line: lineNo,
        rule: "bare-control-needs-formfield",
        severity: "warn",
        standard: "WCAG 2.2 SC 1.3.1 · 3.3.2 · @godxjp/ui FormField (cardinal rule 227)",
        message:
          "A bare <Label>/<label> paired with a control — wrap the field in <FormField label=…>. FormField owns the label↔control id wiring, aria-describedby/error, AND the field rhythm (label gap + field spacing); a hand-rolled Label+Input loses all of it (the cramped/mis-spaced form).",
        snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
      });
    }
  }
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");

if (asJson) {
  process.stdout.write(
    JSON.stringify(
      { summary: { errors: errors.length, warnings: warnings.length }, findings },
      null,
      2,
    ) + "\n",
  );
} else {
  const C = {
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };
  const shown = quiet ? errors : findings;
  for (const f of shown) {
    const tag = f.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`;
    console.log(`${tag} ${C.bold}${f.file}:${f.line}${C.reset}  ${C.dim}[${f.rule}]${C.reset}`);
    console.log(`      ${f.message}`);
    if (f.standard) console.log(`      ${C.dim}standard: ${f.standard}${C.reset}`);
    console.log(`      ${C.dim}${f.snippet}${C.reset}`);
  }
  console.log(
    `\ngodxjp-ui audit: ${C.red}${errors.length} error(s)${C.reset}, ${C.yellow}${warnings.length} warning(s)${C.reset} across ${SCAN_DIRS.join(", ")}.`,
  );
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✓ No UI-standardization violations found.");
  }
}

// See the note above --rules: exitCode, so a large JSON report drains fully.
process.exitCode = errors.length > 0 ? 1 : 0;
