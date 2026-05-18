/**
 * Visual + UX design guidelines. The "why" behind the primitives.
 * Consumer agents query this to make defensible design choices
 * (spacing rhythm, color usage, typography hierarchy, motion
 * principles) instead of guessing.
 */

export interface DesignGuideline {
  topic: string;
  /** One-sentence headline. */
  principle: string;
  /** The reasoning + rules. */
  body: string;
  /** Concrete do / don't examples. */
  examples?: { do?: string; dont?: string };
}

export const DESIGN_GUIDELINES: DesignGuideline[] = [
  {
    topic: "visual-hierarchy",
    principle:
      "Establish hierarchy with TYPE SCALE + WEIGHT + COLOR — never with raw font-size.",
    body: `Use \`Typography.Title size={1..5}\` for headings, \`Typography.Paragraph\`
for body, \`Typography.Text\` for inline runs. Heading scale is fixed
(2xl → xl → lg → base → sm); skipping levels (h1 → h4) breaks the
rhythm. Weight changes (strong, semibold) carry secondary emphasis.
\`color="secondary"\` dims to muted-foreground — use it for metadata
(timestamps, byline) so the eye locks on the primary content first.`,
    examples: {
      do: `<Typography.Title size={2}>ワークスペース設定</Typography.Title>
<Typography.Paragraph>変更は即座に反映されます。</Typography.Paragraph>
<Typography.Text color="secondary">更新日: 2026-05-19</Typography.Text>`,
      dont: `<h2 style={{ fontSize: 22, fontWeight: 600 }}>...</h2>  {/* hard-coded — drift risk */}`,
    },
  },
  {
    topic: "spacing-rhythm",
    principle:
      "4 / 8 / 12 / 16 / 24 / 32 px ladder — pick the smallest step that visually separates two distinct concepts.",
    body: `Use the token chain \`--spacing-1..8\` directly (or via the Tailwind
\`gap-1..gap-8\` aliases). Within a tight group (label + control,
icon + label, chip + count): \`spacing-1\` or \`spacing-2\`. Between
adjacent controls in a form: \`spacing-3\` (Flex \`gap="default"\`).
Between sections of a settings card: \`spacing-4\`. Between cards:
\`spacing-6\`. The rhythm prevents accidental "almost identical"
gaps (e.g. 11 vs 12 vs 14 px) that read as inconsistency.`,
    examples: {
      do: `<Flex vertical gap="default">{/* spacing-3 between fields */}</Flex>`,
      dont: `<div style={{ gap: 14 }}>...</div>  {/* off the ladder */}`,
    },
  },
  {
    topic: "color-usage",
    principle:
      "Color is SEMANTIC, not decorative. Each role maps to one CSS variable.",
    body: `\`primary\` = brand action (Buttons, links). \`success\` = positive
outcome (saved, completed). \`warning\` = caution / attention needed
soon. \`destructive\` = irreversible action (delete, drop). \`info\` =
neutral notice (FYI banners). \`attention\` = highlighted-but-not-
dangerous (mention, badge). \`secondary\` = text dimming
(Typography only). Never mix: don't use \`warning\` for "info" —
the reader's eye conditioned to scan warning will miss it.
Adjust the BRAND hue via \`data-accent\` axis on \`<html>\` — the slot
name stays \`--primary\`, the value rebinds.`,
    examples: {
      do: `<Alert color="warning" title="3 件の打刻漏れ"/>  {/* user must act soon */}
<Button variant="destructive">削除</Button>  {/* irreversible */}`,
      dont: `<Tag color="#ff5722">...</Tag>  {/* raw hex — breaks dark mode + accent rebind */}`,
    },
  },
  {
    topic: "iconography",
    principle: "lucide-react only. 14 / 16 / 18 px inline; 20+ for empty states.",
    body: `Locked stack via cardinal rule 14. Don't pull from heroicons /
react-icons / phosphor / etc. — visual style differs (stroke width,
corner radius) and the SVG sprite chain breaks. Inline icons inside
Buttons / Inputs use \`size={14}\` or \`16\`. Inline with prose use
\`size={16}\`. \`Empty\` state hero icons use \`size={48..64}\`.
Stroke width \`1.5\` (lucide default) — don't change unless the
canon specifies (e.g. \`Checkbox\` indicator uses \`strokeWidth={3}\`).`,
    examples: {
      do: `<Button startContent={<Save size={14} />}>保存</Button>`,
      dont: `<Button startContent={<FontAwesomeIcon icon={faSave} />}>...</Button>  {/* off-stack */}`,
    },
  },
  {
    topic: "motion",
    principle:
      "200ms / ease-out for most. NEVER more than 300ms. Always honour `prefers-reduced-motion`.",
    body: `Standard transition: \`var(--transition-base)\` (200ms) +
\`var(--ease-out)\`. Used for: hover tint, focus ring, popover
open/close, sheet slide. Slow transitions (>300ms) feel sluggish on
desktop; fast transitions (<100ms) feel snappy on hover but jarring
on mount. Every animation MUST wrap in
\`@media (prefers-reduced-motion: no-preference)\` (or use the CSS
\`@media (prefers-reduced-motion: reduce)\` to short-circuit to
\`animation-duration: 0\`). Cardinal rule 6 — WCAG 2.1 AA.`,
  },
  {
    topic: "elevation",
    principle:
      "3 elevation tiers: surface (Card), popover (DropdownMenu / Popover), modal (Dialog / Sheet).",
    body: `\`Card\` sits at surface tier — subtle 1px border, no shadow by
default. \`Popover\` / \`DropdownMenu\` / \`Tooltip\` lift to popover
tier — soft shadow + border. \`Dialog\` / \`Sheet\` are modal tier —
backdrop scrim + larger shadow. Never re-define shadow values on a
primitive's outer wrapper; the canonical tier classes
(\`.card\`, \`.popover-content\`, \`.dialog-content\`) carry them.
Mixing tiers (e.g. shadow-heavy Card with no scrim) breaks the
visual depth contract.`,
  },
  {
    topic: "density-vs-size",
    principle:
      "`size` rescales the primitive's own visual axis. `density` rescales the surrounding chrome.",
    body: `\`<Button size="large">\` makes the button taller (24 → 32 → 36 →
40 px depending on density). \`<html data-density="comfortable">\`
makes EVERY element-height token bigger (32 → 40 px baseline) so
the same \`size="default"\` button is taller everywhere. Density is
a USER preference (tweaks panel — \`useTweaks\`); size is a DESIGNER
choice per primitive. Don't try to use size to "fit more on screen"
— that's what density is for.`,
  },
  {
    topic: "mobile-first",
    principle:
      "Default styles target xs (≥0). Progressive enhancement via `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.",
    body: `Cardinal rule 24. Every layout starts single-column / stacked,
then enhances. Touch targets \`≥ 44 × 44 px\` (\`--touch-target-min\`)
— this token does NOT scale with density (a thumb is a thumb).
Use \`useBreakpoint\` hook for runtime branching; NEVER read
\`window.innerWidth\` directly (SSR hostile + thrashing).
Multi-column layouts use \`grid grid-cols-1 sm:grid-cols-N\`.
EXCEPTION: name-pair forms (姓 + 名 / first + last) use
\`grid-cols-2\` always — short labels + inputs fit at 320px.`,
    examples: {
      do: `<Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-3">...</Grid>`,
      dont: `if (window.innerWidth > 768) ...  {/* hostile to SSR + Suspense */}`,
    },
  },
  {
    topic: "form-layout",
    principle:
      "Vertical default. Horizontal for admin / settings sheets (label-left). Inline for filter bars.",
    body: `\`<Form layout="vertical">\` (default) — label on top, mobile-friendly,
familiar from web forms. \`layout="horizontal"\` — label-left at md+,
collapses to vertical at xs/sm; use for config sheets where the
key/value pairs read as a spreadsheet. \`layout="inline"\` — single
row at sm+, stacks at xs; for filter bars above tables. NEVER mix
horizontal + vertical in the same Form — the eye loses the rhythm.`,
  },
  {
    topic: "action-bar",
    principle:
      'Bottom-right, ghost cancel + primary submit. Always Separator above. `loading={submitting}` on submit.',
    body: `Standard form footer pattern: \`<Separator /> <Flex gap="small"
justify="end"> <Button variant="ghost">キャンセル</Button> <Button
type="submit" variant="primary" loading={submitting}>保存</Button>
</Flex>\`. Cancel is LEFT (less weight), Submit is RIGHT (where the
eye lands). Both are always visible — don't hide cancel until the
form is "dirty"; users want a clear escape hatch. The Separator
gives visual breathing room from the form body.`,
  },
  {
    topic: "loading-states",
    principle:
      "Skeleton for INITIAL fetch. Spinner for ACTIVE work. Never mix.",
    body: `\`<Form loading={{ kind: "skeleton" }}>\` while you fetch the
existing values from the server (no data yet — maintain layout,
prevent flash). \`<Form loading={true}>\` (or \`{ kind: "spinner" }\`)
while saving (data is there, you're transforming). Skeleton during
save is wrong (user sees structure they already saw — feels broken).
Spinner during init is wrong (no data to spin OVER).`,
  },
  {
    topic: "error-vs-destructive",
    principle:
      "`error` = form-field validation. `destructive` = irreversible action.",
    body: `\`<Input status="error">\` red border because the user typed an
invalid email. \`<Button variant="destructive">\` red button because
clicking it deletes data. Different concerns — different verbs.
Don't say "destructive validation" — there's no such thing.
StatusProp (\`default | error | warning | success\`) keeps
\`"error"\` deliberately for this reason; ColorProp uses
\`"destructive"\`. Cardinal vocabulary rule 23.`,
  },
  {
    topic: "empty-states",
    principle:
      "Empty != Error. Show the EMPTY primitive with a tagline, an icon, and the next action.",
    body: `When a list / table / search has no results: use \`<Empty>\` with
\`title\`, \`description\`, and \`extra\` (the next-step action). Never
show a blank container — users assume the app is broken. Don't show
a destructive-color Empty (red illustration); empty is neutral.
The hero icon should hint at the concept (no-results = magnifier,
no-data = box, no-team = group of people).`,
    examples: {
      do: `<Empty title="メンバーがいません" description="チームに招待しましょう。"
  extra={<Button variant="primary">招待する</Button>} />`,
    },
  },
  {
    topic: "destructive-confirmation",
    principle:
      "Type-the-name confirmation for delete / drop / destroy. Always.",
    body: `Patterns for unrecoverable actions: \`Pattern 'confirm-destructive'\`.
Show a Card with \`accent="destructive"\`, the cost in plain
language ("関連するすべてのタスク・コメントが復元できなくなります"),
require the user to TYPE the entity name (\`projectSlug\`) into
an Input, then enable the \`<Button variant="destructive">\` only
when name matches. This prevents muscle-memory deletes and gives
a 2-second pause for second thoughts.`,
  },
  {
    topic: "toast-vs-alert-vs-dialog",
    principle:
      "Toast = ephemeral confirmation. Alert = persistent banner. Dialog = requires response.",
    body: `\`toast.success("保存しました")\` — auto-dismisses in 4s, doesn't
block. \`<Alert color="warning" closable>\` — sits in the page until
the user reads + closes. \`<Dialog>\` — modal, BLOCKS the user
until they click an action (or escape if dismissable). Don't toast
errors that need action ("conflict — choose version") — use Dialog.
Don't dialog confirmations ("saved" — use toast). Never alert
ephemeral wins ("copied to clipboard" — use toast).`,
  },
];
