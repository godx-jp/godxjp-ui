/**
 * Accessibility guide — WCAG 2.1 AA baseline + per-group conventions.
 * Cardinal rule 6 makes this binding: every interactive primitive
 * must pass keyboard nav + ARIA + focus-visible + 4.5:1 contrast +
 * prefers-reduced-motion.
 */

export interface AccessibilityNote {
  topic: string;
  /** One-sentence rule. */
  rule: string;
  /** Detailed explanation + how to comply. */
  body: string;
  /** Affected primitives. */
  appliesTo: string[];
}

export const ACCESSIBILITY: AccessibilityNote[] = [
  {
    topic: "keyboard-navigation",
    rule:
      "Every interactive primitive is reachable + operable via keyboard alone — no mouse-only paths.",
    body: `Tab order follows DOM order; never override with positive
\`tabindex\`. Use \`tabindex={0}\` only to make a non-button focusable;
use \`tabindex={-1}\` to remove from tab order (focus
programmatically). Radix primitives handle this correctly out of the
box — never override their internal tabindex. Custom controls MUST
implement arrow-key navigation if they group related controls (Radio,
Tabs, Menu) — Radix does this for you. \`Escape\` closes Dialog /
Popover / DropdownMenu / Sheet. \`Enter\` / \`Space\` activate
buttons / checkboxes. Test by unplugging the mouse for a full
session.`,
    appliesTo: ["all interactive primitives"],
  },
  {
    topic: "focus-visible",
    rule: "Visible focus ring on every keyboard-focused element.",
    body: `Use the canonical \`:focus-visible { outline: 2px solid var(--ring); }\`
class chain. NEVER \`outline: none\` without replacement. Radix /
react-aria primitives handle focus-visible correctly — don't strip.
The ring color comes from \`--ring\` which rebinds with
\`data-accent\`. On dark mode (data-theme="dark"), the ring stays
visible via increased opacity. Mouse-click focus suppresses the
ring (via \`:focus-visible\`), keyboard-tab focus shows it — this is
the correct UX, do not override.`,
    appliesTo: ["Button", "Input", "Select", "Checkbox", "Switch", "all interactive primitives"],
  },
  {
    topic: "aria-labels",
    rule: "Icon-only buttons MUST have aria-label. Decorative icons MUST have aria-hidden.",
    body: `\`<IconButton aria-label="削除">\` — screen reader announces the
action. Without aria-label, the SR reads "button" with no clue.
Icons that DECORATE existing text (Save icon inside "Save" button)
must have \`aria-hidden\` so the SR doesn't double-read. lucide-react
icons accept \`aria-hidden\` as a prop. Same rule for
\`<Tooltip>\` — the trigger needs an accessible name (not just
the tooltip content).`,
    appliesTo: ["IconButton", "Tooltip", "buttons with icon-only content"],
  },
  {
    topic: "form-labels",
    rule: "Every form input has a programmatic label — via Field, FormField, or `<label htmlFor>`.",
    body: `\`<FormField label="氏名">\` wires the label via Radix Label
primitive — clicks on the label focus the input, SR reads
"氏名 edit text required". If you wrap an Input directly without
Field, pair it with \`<Label htmlFor="myInput">\` + matching
\`<Input id="myInput">\`. Don't rely on \`placeholder\` as a label
— placeholder disappears on focus + low contrast often fails AA.`,
    appliesTo: ["Form", "FormField", "Field", "Input", "Textarea", "Select", "DatePicker"],
  },
  {
    topic: "error-messages",
    rule: "Errors are programmatically associated via aria-describedby + announced via aria-live.",
    body: `\`<FormField>\` handles this automatically: when validation fails,
it sets \`aria-invalid="true"\` on the cloned child + renders the
error in the Field's \`help\` slot with \`aria-describedby\` pointing
at it. The error message uses \`role="alert"\` (implicit aria-live)
so SR announces it on appearance. Don't show errors as toasts —
toast dismisses before SR can finish reading + isn't tied to the
input. Field-adjacent error is the canonical pattern.`,
    appliesTo: ["FormField", "Field", "Input.status='error'"],
  },
  {
    topic: "color-contrast",
    rule: "4.5:1 minimum for body text. 3:1 for large text (≥18px) + UI components.",
    body: `Every \`--foreground\` × \`--background\` pair in
\`src/styles/theme.css\` is auditable. CI runs axe-core via Storybook
play tests (rule 6). Custom inline colors (e.g.
\`color: oklch(56% ...)\`) BYPASS the audit — don't do it.
\`data-accent\` palettes are pre-validated against AA contrast on
both light + dark themes. If you need a new accent palette, add it
to \`theme.css\` + run \`pnpm lint:tokens\` (rule R2 reserved for
WCAG contrast).`,
    appliesTo: ["all primitives — design tokens, not inline styles"],
  },
  {
    topic: "prefers-reduced-motion",
    rule: "Every animation / transition wraps in @media (prefers-reduced-motion).",
    body: `CSS pattern: \`.thing { transition: opacity 200ms; } @media
(prefers-reduced-motion: reduce) { .thing { transition: none; } }\`.
Radix primitives respect this automatically via CSS variables.
Skeleton's shimmer animation, Collapse's height transition,
Carousel's auto-advance, Dialog's fade-in — all honor the user's
preference. If you add a new animation, test by enabling "Reduce
motion" in macOS System Settings → Accessibility → Display.`,
    appliesTo: ["Skeleton", "Collapse", "Dialog", "Sheet", "Carousel", "Tour"],
  },
  {
    topic: "screen-reader-landmarks",
    rule: "Use HTML landmarks (header / nav / main / aside / footer) for page structure.",
    body: `\`<AppShell>\` renders the canonical structure: \`<header>\`
(Topbar), \`<nav>\` (Sidebar), \`<main>\` (PageContent body),
\`<footer>\`. SR users navigate by landmark — skipping the chrome
to reach the main content in one keystroke. Don't wrap landmarks
in extra divs that hide them. If you author a custom shell,
preserve the landmark roles.`,
    appliesTo: ["AppShell", "Sidebar", "Topbar", "PageContent"],
  },
  {
    topic: "live-regions",
    rule: "Async state changes (toast, loading, save) use aria-live regions.",
    body: `\`Toaster\` (Sonner) uses \`aria-live="polite"\` by default so
\`toast.success("保存しました")\` is announced without interrupting.
Use \`aria-live="assertive"\` only for critical errors (form-level
failures, session expired). \`<Spinner aria-label="読み込み中">\`
announces the loading state when first appears. \`<Alert>\` doesn't
need live-region unless it appears dynamically — Radix banner
mode handles it.`,
    appliesTo: ["Toaster", "Spinner", "Alert", "Dialog"],
  },
  {
    topic: "skip-links",
    rule: "Every shell layout exposes a 'skip to main content' link as the first focusable element.",
    body: `\`<AppShell>\` renders one automatically. The link visually hides
until focused (Tab-first), then appears at top-left, jumps to
\`#page-content\` on Enter. SR users + keyboard-only users skip the
sidebar nav (potentially 20+ items) in one keystroke. Don't
override the AppShell's skip link — extend by adding more if your
page has multiple landmarks.`,
    appliesTo: ["AppShell"],
  },
  {
    topic: "tap-target-size",
    rule: "Touch targets ≥ 44 × 44 px on mobile (WCAG 2.1 Success Criterion 2.5.5).",
    body: `\`--touch-target-min: 44px\` is the floor — does NOT scale with
density. Every Button / IconButton / Checkbox / Switch / link
inside a card hits this on mobile. If you build a custom hit
area (e.g. clickable Card), wrap with padding so the hit area
reaches 44px even if the visual is smaller. Density-axis CAN go
below 44px on desktop (mouse-precise) but mobile preserves the
minimum via \`@media (pointer: coarse)\`.`,
    appliesTo: ["Button", "IconButton", "Checkbox", "Switch", "all clickable surfaces"],
  },
  {
    topic: "focus-trap",
    rule: "Modal primitives (Dialog, Sheet, Drawer) trap focus until dismissed.",
    body: `Radix handles focus trap + restore on close: when Dialog opens,
focus moves into the first focusable element inside (or the
content itself if none), Tab stays within the dialog (wraps from
last to first + reverse), Escape closes + restores focus to the
trigger. Don't override Radix's trap — autoFocus + restoreFocus
are the canonical knobs.`,
    appliesTo: ["Dialog", "Sheet", "Drawer", "AlertDialog", "Modal"],
  },
];
