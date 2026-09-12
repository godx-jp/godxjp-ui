#!/usr/bin/env node
/**
 * godxjp-ui audit — the design system's own linter for consumer UI code. Enforces the
 * UI-standardization rules that ship with @godxjp/ui (see the app's
 * .claude/skills/frontend-design/rules/ui-standardization.md): use the design system, never
 * hand-roll.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const CWD = process.cwd();
const SELF = (() => {
  try {
    return JSON.parse(readFileSync(join(CWD, "package.json"), "utf8")).name === "@godxjp/ui";
  } catch {
    return false;
  }
})();
const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const quiet = args.includes("--quiet");
const dirArgs = args.filter((a) => !a.startsWith("--") && a !== "json");

/**
 * `--changed` — audit what this branch touched, whatever tool touched it.
 *
 * The PostToolUse hook fires on `Write|Edit|MultiEdit`, so an agent editing through a shell
 * (`sed -i`, a heredoc, `cat >`) never triggers it. A consumer measured exactly that: across a
 * long session EVERY `.tsx` edit went through Bash and the audit fired not once (godx-jp/id#497).
 * The hook cannot close it — a Bash call carries no `file_path`. A diff can, and one line in a
 * local gate or in CI then covers every edit path, including the ones nobody thought of.
 */
function changedFiles() {
  const base =
    spawnSync("git", ["merge-base", "HEAD", "origin/main"], { encoding: "utf8" }).stdout.trim() ||
    "HEAD";
  const run = (a) => spawnSync("git", a, { encoding: "utf8" }).stdout ?? "";

  return [
    ...new Set(
      [
        run(["diff", "--name-only", "--diff-filter=ACMR", base, "--"]),
        run(["diff", "--name-only", "--diff-filter=ACMR", "--cached"]),
        run(["ls-files", "--others", "--exclude-standard"]),
      ]
        .join("\n")
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => /\.(tsx|jsx)$/.test(f) && existsSync(join(CWD, f))),
    ),
  ];
}

const CHANGED = args.includes("--changed");
const SCAN_DIRS = CHANGED
  ? changedFiles()
  : dirArgs.length
    ? dirArgs
    : SELF
      ? ["src", "docs"]
      : ["resources/js/components", "resources/js/pages", "resources/js/layouts"];

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone";

/**
 * Emoji in product text — Unicode "Extended_Pictographic" set (UTS #51). Catches
 * ✅🎉🔥🚀 etc. but NOT typographic punctuation (· — × ✓), which have their own rules.
 */
/*
 * EMOJI — pictographs, but NOT the three typographic marks that happen to carry the property.
 *
 * `\p{Extended_Pictographic}` includes U+00A9 ©, U+00AE ® and U+2122 ™. All three are
 * `Emoji_Presentation=No`: they default to TEXT presentation, they have been in typography since
 * long before emoji existed, and none of the reasons in this rule's message applies to them — a
 * copyright line does not "break on Win/Linux" and does not pollute an accessible name. The
 * catalog's own CenteredShell recipe was flagged for the `©` in its footer, which is unavoidable
 * product copy, and every consumer with a footer would be flagged for the same thing.
 *
 * Followed by U+FE0F they are asking for emoji presentation on purpose, and then they ARE emoji —
 * so that spelling is still caught.
 */
const EMOJI = /[\u00A9\u00AE\u2122]\uFE0F|(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/u;
/** Regional-indicator pairs = emoji flags (🇯🇵) — broken on Win/Linux; use Intl.DisplayNames. */
const EMOJI_FLAG = /\p{Regional_Indicator}/u;

/**
 * The attribute run of a JSX OPEN TAG, for rules that must see the whole element rather than one
 * class name. Two things a plain `[^>]*` gets wrong, both of them the "green because it measured
 * nothing" shape:
 *
 *  1. `[^>]` stops at the `>` of an arrow function, so `<Button onClick={() => go()} size="icon">`
 *     was invisible while the identical `<Button size="icon" onClick={() => go()}>` was flagged.
 *     A rule that depends on ATTRIBUTE ORDER is a rule an author flips by moving a prop — the same
 *     defect `no-hand-rolled-surface` had with CLASS order. `(?:=>[^>]*)*` lets the run step over
 *     an arrow and keep going; the tag's own `>` still ends it.
 *  2. The scanner below feeds rules ONE LINE at a time, and prettier wraps any element wider than
 *     printWidth onto several lines. Every rule anchored on `<Tag …>` therefore only ever saw
 *     single-line elements. Rules carrying `spansElement: true` are matched against the whole file
 *     instead (line number derived from the match offset), so wrapping no longer hides a violation.
 */
const ATTRS = String.raw`(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|=>|[^>"'])*`;

/**
 * @type {{id:string, severity:'error'|'warn', test:RegExp, message:string, standard?:string,
 *         exempt?:RegExp, classOnly?:boolean}[]}
 *
 * `classOnly` marks a rule whose pattern is a CLASS NAME (`gap-3`, `bg-red-500`, `pr-4`). Those are
 * matched against the class-expression mask (see `classExpressionsOnly`), never the raw line, so
 * product copy, an i18n value or a JSX text node that merely spells a utility is not a finding.
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
    replacement: "Flex gap / ResponsiveGrid / PageContainer",
    classOnly: true,
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
    replacement: "Flex (row), Flex direction col (stack), ResponsiveGrid",
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
    replacement: "Card / Badge / Avatar / ListRow / Descriptions / EmptyState / Progress",
    scope: "consumer",
    severity: "warn",
    // rounded + border/bg on the consumer's own element = a fake Card / Badge / Avatar / ListRow
    // that drifts from the real ones (a 38px account pill beside 32px controls).
    //
    // ORDER-INDEPENDENT, and it has to be: the old single regex required `rounded` to appear
    // BEFORE `border`/`bg-`, so the identical element passed or failed depending on how the
    // classes happened to be sorted — and prettier's Tailwind plugin sorts them. A `bg-current …
    // rounded-full` dot was clean, `prettier --write` reordered it to `rounded-full bg-current`,
    // and the warning appeared with no source change. A rule a formatter can flip is a rule
    // nobody can trust.
    test: (line) => {
      const m = line.match(/className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`)/);
      if (!m) return false;
      const cls = m[1] ?? m[2] ?? m[3] ?? "";
      // A MARKER is not a surface. `size-1` is 4px — a dot, a pip, a status bead. The primitives
      // this rule points at (Card, Badge, Avatar, ListRow, Descriptions, EmptyState) all start at
      // control height, so none of them can express one, and flagging it sends the reader looking
      // for a component that does not exist. The cut-off is `size-2` / 8px: below that there is no
      // room for the padding and type that make something a surface.
      if (/\b(?:size|[wh])-(?:0\.5|1|1\.5|2)\b/.test(cls)) return false;
      return /\brounded(?:-(?:full|sm|md|lg|xl|2xl))?\b/.test(cls) && /\b(?:border|bg-)/.test(cls);
    },
    message:
      "Hand-rolled surface (rounded + border/bg) — use Card, Badge, Avatar, ListRow, Descriptions or EmptyState so height, padding and radius come from the tokens (docs/CONSUMER-RULES.md §4). A read-only sample of a colour a USER chose is Swatch, which takes that value as a prop.",
  },
  {
    id: "no-space-xy",
    replacement: "Flex gap",
    classOnly: true,
    severity: "error",
    test: /\bspace-[xy]-\d/,
    message: "Use <Stack>/<Inline> with gap, not space-x/y-* (rules §5).",
  },
  {
    id: "no-raw-palette-color",
    replacement: "a semantic token (--primary, --muted-foreground, --border)",
    classOnly: true,
    severity: "error",
    test: new RegExp(
      `\\b(bg|text|border|ring|fill|stroke|from|to|via|divide|outline)-(${PALETTE})-\\d`,
    ),
    message:
      "Use semantic tokens (bg-primary, text-muted-foreground…), not raw palette colors (rules §4).",
  },
  {
    id: "status-tone-not-variant",
    replacement: "tone=",
    severity: "error",
    spansElement: true,
    // Only the tone-driven status components (Badge/Tag/StatCard) are wrong here — they expose a
    // `tone` prop and reserve `variant` for STRUCTURE (default|secondary|outline). Button, Alert,
    // DropdownMenuItem, AlertDialog etc. legitimately use `variant` for emphasis,
    // so they must NOT be flagged.
    test: new RegExp(
      `<(?:Badge|Tag|StatCard)\\b${ATTRS}\\bvariant=["'](?:success|warning|destructive|info|neutral)["']`,
      "g",
    ),
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
    replacement: "onValueChange",
    severity: "error",
    spansElement: true,
    test: new RegExp(
      "<(?:Checkbox\\.Group|Upload|Cascader|TreeSelect|Transfer|Select|SearchSelect|DatePicker|" +
        `TimePicker|ColorPicker|LocalePicker|TimezonePicker|DateFormatPicker|TimeFormatPicker)\\b${ATTRS}\\bonChange=`,
      "g",
    ),
    message:
      "Abstract value components use onValueChange, not onChange. Reserve onChange for DOM events.",
  },
  {
    id: "no-arbitrary-hex",
    replacement: "a semantic token",
    classOnly: true,
    severity: "error",
    test: /(bg|text|border|ring|fill|stroke|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/,
    message: "No hardcoded hex colors in className; use design-system tokens (rules §4).",
  },
  // Arbitrary RAW-NUMERIC Tailwind values — the #1 source of "every agent does it
  // differently". Match `<util>-[<digit/.>...]` only; `var(--token)` / `calc()` escape
  // (they start with a letter), so token-driven values stay legal (rules §4–§5).
  {
    id: "no-arbitrary-spacing",
    replacement: "Flex gap / the spacing scale",
    classOnly: true,
    severity: "error",
    test: /\b(p|px|py|pt|pb|pl|pr|pe|ps|m|mx|my|mt|mb|ml|mr|me|ms|gap|gap-x|gap-y|inset|inset-x|inset-y|top|right|bottom|left)-\[-?\.?\d/,
    message:
      "No arbitrary spacing (p-[13px], gap-[7px]…). Use the token scale / <Stack gap> / <Inline gap> / <PageContainer> (rules §5).",
  },
  {
    id: "no-arbitrary-size",
    replacement: "a size token or the component's size prop",
    classOnly: true,
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
    replacement: "Text size / weight / tone",
    classOnly: true,
    severity: "error",
    test: /\b(text|leading|tracking|font)-\[-?\.?\d/,
    message:
      "No arbitrary type (text-[20px], leading-[1.7], font-[600]…). Use the type-scale tokens (text-xs…text-3xl) (rules §4).",
  },
  {
    id: "no-arbitrary-radius",
    replacement: "a radius token",
    classOnly: true,
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
    replacement: "Select",
    scope: "consumer-control",
    severity: "error",
    test: /<select[\s>]/,
    message: "Use <Select> from @godxjp/ui, not a raw <select> (rules §3).",
  },
  {
    id: "no-raw-table",
    replacement: "DataTable / Table",
    severity: "error",
    test: /<table[\s>]/,
    message: "Use the <Table> family from @godxjp/ui, not a raw <table> (rules §3).",
  },
  {
    id: "no-raw-textarea",
    replacement: "Textarea",
    scope: "consumer-control",
    severity: "warn",
    test: /<textarea[\s>]/,
    message: "Use <Textarea> from @godxjp/ui, not a raw <textarea> (rules §3).",
  },
  {
    id: "no-raw-input",
    replacement: "Input (Upload for a file picker)",
    scope: "consumer-control",
    severity: "error",
    spansElement: true,
    test: new RegExp(`<input\\b(?!${ATTRS}\\btype=["']hidden["'])${ATTRS}>`, "g"),
    message: "Use <Input> from @godxjp/ui, not a raw <input> (rules §3).",
  },
  {
    id: "no-raw-button",
    replacement: "Button",
    scope: "consumer-control",
    severity: "error",
    test: /<button[\s>]/,
    message: "Use <Button> from @godxjp/ui, not a raw <button> (rules §3).",
  },
  {
    id: "card-manual-padding",
    replacement: "CardContent (or CardContent flush)",
    severity: "error",
    spansElement: true,
    test: new RegExp(`<Card\\b${ATTRS}\\bp-[1-9]`, "g"),
    message:
      "Don't hand-roll padding on <Card> (className='p-4'…) — wrap the body in <CardContent>. (p-0 for a full-bleed table is fine.)",
  },
  {
    id: "no-dark-color-override",
    replacement: "a semantic token, which already answers to the theme",
    classOnly: true,
    severity: "warn",
    test: /\bdark:(bg|text|border|ring|fill|stroke)-/,
    message: "Don't add dark: color overrides — semantic tokens already adapt (rules §4).",
  },
  {
    id: "manual-field-error",
    severity: "warn",
    spansElement: true,
    test: new RegExp(`<p${ATTRS}className="[^"]*text-(?:xs|sm)[^"]*text-destructive`, "g"),
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
    classOnly: true,
    severity: "warn",
    test: /\b(bg|text|border)-(white|black)\b/,
    message:
      "Prefer semantic tokens (text-primary-foreground, bg-background…) over raw white/black (rules §4).",
  },

  // ─── International-standard a11y / i18n / RTL rules (WARN — guide the agent, never block) ───
  {
    id: "no-emoji-in-ui",
    replacement: "a lucide icon",
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
    replacement: "the logical property (ms-/me-, inline-start/inline-end)",
    classOnly: true,
    severity: "warn",
    // Physical-edge utilities break RTL. Logical equivalents: ms-/me-/ps-/pe-, start-/end-,
    // text-start/end, border-s/e, rounded-s/e. `-mx-`/`-px-` (both edges) are RTL-safe → not matched.
    exempt: /rtl-ignore:\s*\S.{10,}/,
    test: /(?<![\w-])-?(ml|mr|pl|pr|left|right)-(?:\d|\[|auto|px|full)|(?<![\w-])(?:rounded-[tb]?[lr]|border-[lr]|text-(?:left|right))\b/,
    standard: "W3C CSS Logical Properties & Values L1 · WCAG 2.2 (1.3.2 / reflow)",
    message:
      "Use LOGICAL direction utilities for RTL safety: ms-/me-/ps-/pe-, start-/end-, text-start/end, border-s/e, rounded-s/e — not physical ml-/mr-/pl-/pr-/left-/right-/text-left|right.",
  },
  {
    id: "icon-button-needs-name",
    severity: "warn",
    spansElement: true,
    // An icon-only Button (size="icon") with no author-supplied accessible name. A combobox/icon
    // button's name is computed from author (aria-label / aria-labelledby / title), not glyph content.
    test: new RegExp(
      `<Button\\b(?=${ATTRS}\\bsize=["']icon["'])(?!${ATTRS}\\b(?:aria-label|aria-labelledby|title)=)${ATTRS}>`,
      "g",
    ),
    standard: "WCAG 2.2 SC 4.1.2 · 1.1.1 · WAI-ARIA 1.2",
    message:
      "Icon-only <Button size=\"icon\"> needs an accessible name — add aria-label={t('…')}. The icon is decorative (aria-hidden); the name comes from the author, not the glyph.",
  },
  {
    id: "img-needs-alt",
    severity: "warn",
    spansElement: true,
    test: new RegExp(`<img\\b(?!${ATTRS}\\balt=)${ATTRS}>`, "g"),
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
    matches: currencyMatches,
    severity: "warn",
    // A currency glyph glued to an interpolation in JSX text: `>¥{amount}` / `>{x}円`.
    spansElement: true,
    test: new RegExp(
      `<(?:[A-Za-z][\\w.:]*(?:\\s${ATTRS})?)?(?<!=)>[^<>{}]*[¥$€£₫]\\s*\\{|\\}\\s*円\\s*</`,
      "g",
    ),
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
    spansElement: true,
    test: new RegExp(
      `<(?:[A-Za-z][\\w.:]*(?:\\s${ATTRS})?)?>[^<>]*[A-Za-z0-9぀-ヿ一-鿿]\\s*—\\s*[A-Za-z0-9぀-ヿ一-鿿]|` +
        String.raw`\b(?:label|title|placeholder|description|aria-label)=["'][^"']*[A-Za-z0-9぀-ヿ一-鿿]\s*—\s*[A-Za-z0-9぀-ヿ一-鿿][^"']*["']`,
      "g",
    ),
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
  await new Promise((resolve) =>
    process.stdout.write(
      JSON.stringify(
        RULES.map((r) => ({
          id: r.id,
          severity: r.severity,
          standard: r.standard ?? null,
          message: r.message,
          replacement: r.replacement,
        })),
        null,
        2,
      ) + "\n",
      resolve,
    ),
  );
  // Exit only once the pipe has drained (a bare process.exit() cut a 367 KB report at 64 KB),
  // and never fall through to the scan, whose summary line would corrupt the JSON.
  process.exit(0);
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

/** End index (inclusive) of the string / template literal opening at `i`. `${…}` is stepped over as
 *  a brace group, so a quote nested inside an interpolation never closes the template early. */
function endOfString(src, i) {
  const quote = src[i];
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (c === "\\") j++;
    else if (quote === "`" && c === "$" && src[j + 1] === "{") {
      const close = matchBracket(src, j + 1);
      if (close < 0) return src.length - 1;
      j = close;
    } else if (c === quote) return j;
  }
  return src.length - 1;
}

/** End index (inclusive) of the bracket group opening at `i`, or -1 when it never closes. */
function matchBracket(src, i) {
  const CLOSER = { "{": "}", "[": "]", "(": ")" };
  const stack = [CLOSER[src[i]]];
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (c === '"' || c === "'" || c === "`") j = endOfString(src, j);
    else if (CLOSER[c]) stack.push(CLOSER[c]);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return j;
    }
  }
  return -1;
}

/** The value that starts at `i`: a literal or bracket group in full, otherwise the rest of the line
 *  (`= base + " p-2"`, a ternary) — enough to see the classes, never the next statement. */
function valueEnd(src, i) {
  const c = src[i];
  if (c === '"' || c === "'" || c === "`") return endOfString(src, i);
  if (c === "{" || c === "[" || c === "(") {
    const close = matchBracket(src, i);
    return close < 0 ? src.length - 1 : close;
  }
  const nl = src.indexOf("\n", i);
  return nl < 0 ? src.length - 1 : nl - 1;
}

/** A call that BUILDS a class list — its arguments are classes wherever they are written. */
const CLASS_HELPER = /(?<![\w$.])(?:cn|clsx|classnames|classNames|cx|cva|tv|twMerge|twJoin)\s*\(/g;
/** `className={…}` / `wrapperClass = "…"` / `const flexGapClass: Record<…> = {…}` — an assignment
 *  (JSX attribute, variable, default) whose NAME says class. The optional `: …` is a type annotation. */
const CLASS_ASSIGN = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*(?::[^=;\n]*?)?=(?!=)\s*/g;
/** `className: "…"` — the same, written as an object key (a DataTable column, a slots map). */
const CLASS_KEY = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*:\s*/g;
/**
 * The names a class list is actually bound to, as a SUFFIX so every prefix works: `className`,
 * `rowClassName`, `baseClass`, `cellClasses` — plus the three conventional aliases for a class MAP,
 * `statusStyles` / `badgeVariants` / `toneVariant`, which are how a palette of class strings is
 * written when it is not inside `cva()`. A class list bound to a name outside this set (`const map =
 * { … }`) is NOT scanned — that is the cost of the mask, and the reason the set errs wide.
 */
const CLASS_NAMED = /(?:class(?:es|name|names)?|styles?|variants?)$/i;

/**
 * Blank everything that is NOT a class expression, keeping newlines so line numbers stay true.
 *
 * The `classOnly` rules are plain regexes over source text, so before this pass any line that merely
 * CONTAINED a utility-shaped word was reported: product copy, an i18n value, a test fixture, a JSX
 * text node (`<Text>văn bản JSX nhắc gap-3</Text>`). The bar is zero errors, so a false positive is
 * not a nuisance — it blocks the review. What survives the mask is the three places a class can
 * actually be written: a class-named binding's value, a class-named object key's value, and the
 * arguments of a class-building helper. The NAME stays inside the region, so rules that anchor on
 * `className="` keep matching.
 */
function classExpressionsOnly(src) {
  const keep = new Uint8Array(src.length);
  const mark = (from, to) => {
    for (let i = Math.max(from, 0); i <= Math.min(to, src.length - 1); i++) keep[i] = 1;
  };
  for (const m of src.matchAll(CLASS_HELPER)) {
    const close = matchBracket(src, m.index + m[0].length - 1);
    mark(m.index, close < 0 ? src.length - 1 : close);
  }
  for (const pattern of [CLASS_ASSIGN, CLASS_KEY]) {
    for (const m of src.matchAll(pattern)) {
      if (!CLASS_NAMED.test(m[1])) continue;
      mark(m.index, valueEnd(src, m.index + m[0].length));
    }
  }
  const out = Array.from(src, (c, i) => (keep[i] || c === "\n" ? c : " "));
  return out.join("");
}

/** `ui-audit-disable-begin <rule> — <why>` … `ui-audit-disable-end <rule>`: ONE marker for a whole
 *  region instead of one per line (prettier wrapping a 24-item literal used to cost 24 identical
 *  comments, so the formatter was being bent to satisfy the linter). The reason is MANDATORY — a
 *  marker without `— <12+ chars>` is ignored and the finding stands, so an opt-out always says why.
 *  A block that is never closed runs to the end of the file. */
const DISABLE_BEGIN = /ui-audit-disable-begin\s+([a-z][a-z0-9-]*)\s*[—:]\s*(\S[^\n]{11,})/;
const DISABLE_END = /ui-audit-disable-end\s+([a-z][a-z0-9-]*)/;

/** @returns {(ruleId: string, lineIndex: number) => boolean} */
function blockSuppressions(lines) {
  /** @type {Map<string, {from:number, to:number}[]>} */
  const ranges = new Map();
  /** @type {Map<string, number>} */
  const open = new Map();
  const close = (ruleId, to) => {
    const from = open.get(ruleId);
    open.delete(ruleId);
    if (!ranges.has(ruleId)) ranges.set(ruleId, []);
    ranges.get(ruleId).push({ from, to });
  };
  lines.forEach((line, i) => {
    const begin = DISABLE_BEGIN.exec(line);
    if (begin && !open.has(begin[1])) open.set(begin[1], i);
    const end = DISABLE_END.exec(line);
    if (end && open.has(end[1])) close(end[1], i);
  });
  for (const ruleId of [...open.keys()]) close(ruleId, lines.length - 1);
  return (ruleId, lineIndex) =>
    (ranges.get(ruleId) ?? []).some((r) => lineIndex >= r.from && lineIndex <= r.to);
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

/** Match real JSX text after a balanced opening tag, including props with comparisons. */
function* currencyMatches(source) {
  for (const opening of source.matchAll(/<(?:[A-Za-z][\w.:]*\b|(?=>))/g)) {
    const end = jsxOpeningEnd(source, opening.index);
    const text = source.slice(end + 1).match(/^[^<>{}]*[¥$€£₫]\s*\{/);
    if (text) yield { 0: source.slice(opening.index, end + 1) + text[0], index: opening.index };
  }
  yield* source.matchAll(/\}\s*円\s*</g);
}

/** Find the tag boundary without confusing a comparison, callback or string for markup. */
function jsxOpeningEnd(source, start) {
  let braces = 0;
  let quote = "";
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") braces++;
    else if (char === "}") braces--;
    else if (char === ">" && braces === 0) return i;
  }
  return source.length;
}

// Structural: a <Card> (without p-0) whose first child is body content rather than a Card
// sub-component sits FLUSH (no padding). Per-line regexes can't see across lines, so this is a
// whole-file pass. The body must be wrapped in <CardContent> (titles in <CardHeader>).
/**
 * A `Card` whose entire body is a table. `CardContent` pads 16px inline while
 * `.ui-data-table-surface` draws its own 1px border, so the default composition renders a box
 * inside a box — and a wide table runs PAST the card's edge instead of stopping at it (measured in
 * a consumer at −85px and −519px, godx-jp/id#498). `<CardContent flush>` already solves it. What
 * was missing was the rule that says so.
 *
 * Deliberately narrow: the table must be the DIRECT child. A `<Flex direction="col">` holding
 * filters AND a table is a mixed body, where the padding is correct — the reporter hit that trap
 * with a `childElementCount === 1` test.
 */
const CARD_TABLE_FLUSH = new RegExp(
  `<CardContent(?![^>]*\\bflush\\b)(?:\\s${ATTRS})?>\\s*<(?:DataTable|Table)\\b`,
  "g",
);

const CARD_FLUSH = new RegExp(
  `<Card(?!${ATTRS}\\bp-0\\b)(?:\\s${ATTRS})?>\\s*<(?!CardContent|CardHeader|CardCover|CardFooter|CardBar|\\/Card)`,
  "g",
);

// Structural: a bare <label>/<Label> paired with a TEXT control (its sibling) instead of a
// <FormField>. FormField OWNS the label↔control association (htmlFor/id), aria-describedby/
// error wiring, AND the field rhythm (label gap + field spacing) — a hand-rolled Label+Input
// loses all of it (the cramped login-form failure mode). Checkbox/Radio/Switch use Field/Label
// legitimately, so they are NOT matched. Whole-file pass (the pair spans lines).
const BARE_FIELD = new RegExp(
  `<(?:label|Label)\\b${ATTRS}>[\\s\\S]{0,240}?</(?:label|Label)>\\s*` +
    "<(?:Input|Select|Textarea|NumberInput|SearchInput|SearchSelect|DatePicker|" +
    "TimePicker|Cascader|TreeSelect|input)\\b",
  "g",
);

// Two <Card> siblings written back to back at the same indentation with nothing between them.
// Direct children of PageContainer are spaced by the page; anywhere else they touch.
const SIBLING_CARDS = /^([ \t]*)<\/Card>\s*\n\1<Card\b/gm;

/**
 * `scope: "consumer"` rules ban utilities on a CONSUMER's own markup. Inside the library repo the
 * utilities are the design system itself (that is where `flex`/`gap-*` are supposed to live), so
 * those rules are skipped when the CWD package is @godxjp/ui — unless `--consumer` forces them.
 */

const ACTIVE_RULES =
  SELF && !args.includes("--consumer") ? RULES.filter((r) => r.scope !== "consumer") : RULES;

/**
 * The rule file this package OWNS, and whether the consumer's copy is the one this package writes.
 *
 * `.ai/rules/godxjp-ui.md` opens by promising it is rewritten on every upgrade. A consumer with
 * `ignore-scripts=true` — a sane, increasingly common default — never runs our postinstall, so the
 * promise silently fails: measured in a consumer at `godxjp-ui:version 19.6.0` while the installed
 * package was **23.0.0**, three majors apart (godx-jp/id#513). An agent then follows a rule file
 * describing components that were removed, props that no longer exist and a `role` attribute that
 * is gone — and nothing anywhere says the ground moved.
 *
 * postinstall cannot fix this: it is the thing that did not run. This can, because a consumer runs
 * the audit.
 */
function staleOwnedRules() {
  if (SELF) return null;
  const target = join(CWD, ".ai", "rules", "godxjp-ui.md");
  if (!existsSync(target)) return null;

  const stamped = /<!-- godxjp-ui:version ([^\s]+) -->/.exec(readFileSync(target, "utf8"))?.[1];
  let installed;
  try {
    installed = JSON.parse(
      readFileSync(join(CWD, "node_modules", "@godxjp", "ui", "package.json"), "utf8"),
    ).version;
  } catch {
    return null;
  }
  if (!stamped || !installed || stamped === installed) return null;

  return {
    file: ".ai/rules/godxjp-ui.md",
    line: 1,
    rule: "owned-rules-stale",
    severity: "error",
    message:
      `This file is written by @godxjp/ui and says version ${stamped}, but the installed package ` +
      `is ${installed}. Its rules describe a different library than the one you are building ` +
      "against — most likely because `ignore-scripts=true` kept our postinstall from running.",
    replacement: 'INIT_CWD="$PWD" node node_modules/@godxjp/ui/scripts/postinstall.mjs',
    snippet: `<!-- godxjp-ui:version ${stamped} --> vs installed ${installed}`,
  };
}

const findings = [];
const stale = staleOwnedRules();
if (stale) findings.push(stale);
let filesScanned = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(isAbsolute(dir) ? dir : join(CWD, dir))) {
    const rel = relative(CWD, file);
    // Framework test support is executable fixture markup, not a shipped product screen.
    if (SELF && !args.includes("--consumer") && rel.startsWith("src/test/")) continue;
    filesScanned += 1;
    // A primitive implements native controls; asking Input to render Input recurses.
    // Consumer applications and executable docs still receive these composition checks.
    const fileRules =
      SELF && !args.includes("--consumer") && rel.startsWith("src/components/")
        ? ACTIVE_RULES.filter((rule) => rule.scope !== "consumer-control")
        : ACTIVE_RULES;
    const content = readFileSync(file, "utf8");
    const origLines = content.split("\n");
    const scanContent = stripComments(content); // comments blanked; strings + line numbers kept
    const scanLines = scanContent.split("\n");
    // `classOnly` rules read this instead — everything but a real class expression blanked.
    const classLines = classExpressionsOnly(scanContent).split("\n");
    const inDisabledBlock = blockSuppressions(origLines);
    /** Both opt-outs, by line index: the per-line markers and the reason-carrying block. */
    const suppressed = (ruleId, i) =>
      isSuppressed(ruleId, origLines[i], origLines[i - 1]) || inDisabledBlock(ruleId, i);
    const isJsx = file.endsWith(".tsx");
    // This compiler output intentionally resolves CSS variables to email-safe literals.
    // gen-email-tokens.mjs --check verifies it against its canonical token sources.
    const compiledEmailTokens =
      SELF &&
      rel === "src/email/tokens.generated.ts" &&
      content.startsWith("// AUTO-GENERATED by scripts/gen-email-tokens.mjs");
    scanLines.forEach((line, i) => {
      for (const rule of fileRules) {
        if (!isJsx && rule.scope === "consumer-control") continue;
        if (compiledEmailTokens && rule.id === "no-off-scale-token-value") continue;
        if (rule.spansElement) continue; // matched over the whole file below, not line by line
        const target = rule.classOnly ? (classLines[i] ?? "") : line;
        if (
          (typeof rule.test === "function" ? rule.test(target) : rule.test.test(target)) &&
          !suppressed(rule.id, i) &&
          !isExempt(rule, origLines[i], origLines[i - 1])
        ) {
          findings.push({
            file: rel,
            line: i + 1,
            rule: rule.id,
            severity: rule.severity,
            standard: rule.standard,
            message: rule.message,
            replacement: rule.replacement,
            snippet: (origLines[i] ?? line).trim().slice(0, 120),
          });
        }
      }
    });
    // Element-spanning rules: matched against the WHOLE file, because a JSX element prettier wrapped
    // over five lines is invisible to a line-by-line scan. Same offset→line-number idiom as the
    // block rules below.
    for (const rule of fileRules) {
      if (!rule.spansElement || !isJsx) continue;
      for (const match of rule.matches
        ? rule.matches(scanContent)
        : scanContent.matchAll(rule.test)) {
        // A comparison `>` inside a JSX prop is not the end of its opening tag.
        if (
          (rule.id === "hardcoded-currency" || rule.id === "no-em-dash-in-copy") &&
          match[0].startsWith("<") &&
          jsxOpeningEnd(scanContent, match.index) >= match.index + match[0].length
        )
          continue;
        const lineNo = scanContent.slice(0, match.index).split("\n").length;
        if (suppressed(rule.id, lineNo - 1)) continue;
        if (isExempt(rule, origLines[lineNo - 1], origLines[lineNo - 2])) continue;
        findings.push({
          file: rel,
          line: lineNo,
          rule: rule.id,
          severity: rule.severity,
          standard: rule.standard,
          message: rule.message,
          snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
        });
      }
    }
    if (!isJsx) continue;
    /**
     * `CARD_FLUSH` wants a Card slot as the IMMEDIATE next element, so any legitimate wrapper
     * trips it. The one that matters is `<Form>`: a submit button in `<CardFooter>` only submits
     * when the `<form>` wraps BOTH the content and the footer, so `<Card><Form><CardContent>` is
     * the only correct shape for that card — and it was reported as an error three times in one
     * consumer file (godx-jp/id#496), on its newest code. A confident error against correct code
     * teaches the reader that the audit is noise.
     *
     * The rule's intent is "the body must not sit flush against the card edges", so ask that:
     * is there a `<CardContent>` before this Card's own `</Card>`? Depth is counted, because a
     * Card can hold a Card.
     */
    const hasBodyBeforeClose = (from) => {
      let depth = 0;
      const tag = /<(\/?)Card(Content|Header|Cover|Footer|Bar)?\b/g;
      tag.lastIndex = from;
      for (let m; (m = tag.exec(scanContent));) {
        const [, closing, slot] = m;
        if (!slot) {
          if (closing) {
            if (depth === 0) return false;
            depth -= 1;
          } else depth += 1;
          continue;
        }
        if (!closing && slot === "Content" && depth <= 1) return true;
      }
      return false;
    };

    for (const match of scanContent.matchAll(CARD_FLUSH)) {
      if (hasBodyBeforeClose(match.index)) continue;
      const lineNo = scanContent.slice(0, match.index).split("\n").length;
      if (suppressed("card-needs-content", lineNo - 1)) continue;
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
    for (const match of scanContent.matchAll(CARD_TABLE_FLUSH)) {
      const lineNo = scanContent.slice(0, match.index).split("\n").length + 1;

      if (suppressed("card-table-needs-flush", lineNo - 1)) continue;

      findings.push({
        file: rel,
        line: lineNo,
        rule: "card-table-needs-flush",
        severity: "error",
        message:
          "A Card whose whole body is a table must let the table touch the card's inner edge — " +
          "use <CardContent flush>. A default CardContent pads 16px while the table draws its own " +
          "border, so the table reads as a second box inside the card and a wide one overflows it.",
        replacement: "CardContent flush",
        snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
      });
    }
    if (
      !(SELF && !args.includes("--consumer")) &&
      !/<(?:Flex|ResponsiveGrid|PageContainer)\b/.test(scanContent)
    ) {
      for (const match of scanContent.matchAll(SIBLING_CARDS)) {
        const lineNo = scanContent.slice(0, match.index).split("\n").length + 1;
        if (suppressed("sibling-cards-need-flex", lineNo - 1)) continue;
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
      if (suppressed("bare-control-needs-formfield", lineNo - 1)) continue;
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

// A run that opened NO file is not a clean run. The default SCAN_DIRS are a consumer's
// `resources/js/{components,pages,layouts}`; `walk()` swallows ENOENT and returns [], so in any
// tree without that layout — this repo included — `pnpm audit` printed
// "✓ No UI-standardization violations found." and exited 0 having read nothing at all.
// …except under `--changed`, where "this branch touched no .tsx" is a clean run, not a
// misconfigured path. Failing there would make the gate unusable on every backend-only commit.
if (filesScanned === 0 && CHANGED) {
  if (!quiet && !asJson) console.log("✓ ui-audit --changed: no .tsx/.jsx changed on this branch.");
  process.exit(0);
}
if (filesScanned === 0) {
  const message =
    `ui-audit scanned 0 files — none of [${SCAN_DIRS.join(", ")}] exists (or all were filtered). ` +
    `Pass the directories to scan, e.g. \`node scripts/ui-audit.mjs src docs\`. ` +
    `Reporting a clean audit without opening a file is not a result.`;
  if (asJson) {
    process.stdout.write(
      JSON.stringify({ summary: null, error: message, findings: [] }, null, 2) + "\n",
    );
  } else {
    console.error(`✗ ${message}`);
  }
  process.exitCode = 2;
}

if (filesScanned === 0) {
  // already reported above
} else if (asJson) {
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
    // Name the primitive HERE: without it every finding costs a round-trip to the catalog plus a
    // guess about what to look up (godx-jp/id#497). The audit already knows the answer.
    if (f.replacement) console.log(`      ${C.bold}use: ${f.replacement}${C.reset}`);
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
if (filesScanned > 0) process.exitCode = errors.length > 0 ? 1 : 0;
