/**
 * Design-thinking module — TASTE principles for consumer agents.
 *
 * Adapted from Leonxlnx/taste-skill (imagegen-frontend-mobile +
 * imagegen-frontend-web SKILL.md) and grounded in @godxjp/ui's
 * mobile-first, token-pinned, semantic-color philosophy.
 *
 * The MCP's job — make sure agents using @godxjp/ui produce UI
 * that feels deliberate, art-directed, premium — NOT generic AI
 * dribbble clones.
 */

export interface TastePrinciple {
  /** Headline — the one rule to remember. */
  rule: string;
  /** The detailed body — what + why + how to spot violation. */
  body: string;
  /** Concrete do / dont pair (dont optional). */
  examples: { do: string; dont?: string };
}

export const TASTE_PRINCIPLES: TastePrinciple[] = [
  {
    rule: "MOBILE-FIRST IS NOT NEGOTIABLE — design from xs (≥0px) up, not desktop down.",
    body: `Cardinal rule 24. Default styles target xs. Touch targets stay ≥
44×44px (\`--touch-target-min\` doesn't shrink with density). Multi-
column layouts use \`grid grid-cols-1 sm:grid-cols-N\`. NEVER read
\`window.innerWidth\` — use \`useBreakpoint()\`. Stories render at
narrow viewport first. The framework's primitives are designed
mobile-first; a desktop-first design WILL break the rhythm.

Why this is taste, not just engineering: a UI that "works" on mobile
but was designed desktop-first FEELS like a desktop UI shoehorned
into a phone — tap targets cramped, content overflowing, scroll
bars where there should be swipes. A UI designed mobile-first feels
like it BELONGS on the device at every size.`,
    examples: {
      do: `<Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-3">
  {orders.map(o => <OrderCard key={o.id} {...o} />)}
</Grid>`,
      dont: `// Desktop-first — collapses to broken state on mobile:
<Grid cols={3}>...</Grid>  {/* no responsive fallback */}`,
    },
  },
  {
    rule: "ONE INTENT PER SCREEN — every page answers ONE primary question.",
    body: `If a user lands on /dashboard, the page's job is "show me my work
status at a glance". Not "show me 12 widgets fighting for
attention". Pick the primary metric / list / next-action and give
it 60-80% of the visual weight. Secondary content gets the
remaining space. Tertiary lives in a Sheet / DropdownMenu / next
page.

The "wall of cards" dashboard is the most over-applied AI pattern.
A premium dashboard has 1-2 hero metrics + a single primary list +
contextual actions. NOT 8 chart cards in a grid.`,
    examples: {
      do: `<PageContent title="今日の業務">
  {/* PRIMARY — the one number that matters */}
  <Statistic title="本日の売上" value={fmt.formatCurrency(stats.today)} delta={+12.4} />
  {/* SECONDARY — the list of incoming actions */}
  <Card title="未対応の注文 (3件)">
    <List items={pendingOrders} />
  </Card>
</PageContent>`,
      dont: `// 8 stat cards in a 4-col grid — classic AI slop:
<Grid cols={4}>
  <StatCard title="売上" /> <StatCard title="利益" />
  <StatCard title="返品" /> <StatCard title="新規" />
  <StatCard title="解約" /> <StatCard title="リピート" />
  <StatCard title="平均単価" /> <StatCard title="LTV" />
</Grid>`,
    },
  },
  {
    rule: "TWO ACCENTS DO REAL WORK — not eight saturated colors fighting.",
    body: `@godxjp/ui's semantic palette gives you 6 brand-side slots
(\`primary, success, warning, destructive, info, attention\`) + the
neutral chain. A good design uses ONE brand color for action
(\`primary\` on Buttons, links, focus rings) + ONE semantic color
contextually (\`destructive\` for confirm-delete, \`warning\` for
deadline alerts, \`success\` for completed-state Badges). NOT all
of them on the same screen.

The "rainbow tag wall" is an AI tell — every Tag a different color
because "more variety = more interesting". It actually reads as
chaos. A real design uses one accent + tonal variation (Tag.color
"primary" with appearance "soft" vs "solid" — same hue, different
weight).`,
    examples: {
      do: `// One primary action + one contextual semantic:
<Button variant="primary">保存</Button>
<Alert color="warning" title="期限まで残り 3 日" />
<Badge variant="success" dot>承認済</Badge>  {/* ← used sparingly, marks completed items */}`,
      dont: `// Rainbow tags = AI slop:
<Flex>
  <Tag color="primary">Tech</Tag>     <Tag color="success">Active</Tag>
  <Tag color="warning">Beta</Tag>     <Tag color="destructive">Hot</Tag>
  <Tag color="info">New</Tag>         <Tag color="attention">Pro</Tag>
</Flex>`,
    },
  },
  {
    rule: "TYPE IS THE HIERARCHY — weight + size + color do the work, not background blocks.",
    body: `\`Typography.Title size={1..5}\` is the canonical hierarchy. h2 →
h3 → h4 — each step ~75% of the previous. Don't skip levels
(h2 → h4 reads as broken). Body uses \`Typography.Paragraph\`,
metadata uses \`Typography.Text color="secondary"\`. The eye reads
title → body → meta in that order WITHOUT extra background blocks
or borders — type contrast alone IS the hierarchy.

The "every section has a colored background block to separate
itself" is an AI tell — visually heavy, hard to scan. A premium
design uses Separator (1px hairline) + whitespace + type-weight
shift to signal section boundaries. Reserve colored backgrounds for
genuinely different surfaces (Card vs page, Alert vs body).`,
    examples: {
      do: `<Typography.Title size={2}>注文履歴</Typography.Title>
<Typography.Paragraph>過去 6 か月分を表示しています。</Typography.Paragraph>
<Typography.Text color="secondary">最終更新: {fmt.formatRelative(updatedAt)}</Typography.Text>
<Separator />
<OrderList items={orders} />`,
      dont: `// Colored panel for every section — visual noise:
<div style={{ background: "var(--muted)", padding: 16, marginBottom: 16 }}>
  <h2>Section A</h2>
</div>
<div style={{ background: "var(--accent)", padding: 16, marginBottom: 16 }}>
  <h2>Section B</h2>
</div>`,
    },
  },
  {
    rule: "WHITESPACE IS CONTENT — don't pad everything to the brim.",
    body: `The spacing ladder (\`--spacing-1..8\`) is built so a tight group
gets \`spacing-1\` or \`2\`, related controls get \`3\`, sections get
\`4-6\`, page-level rhythm gets \`6-8\`. Use the SMALLEST step that
visually separates the concepts. A common AI mistake: pad every
card with \`spacing-6\` because "more breathing room = premium".
Wrong — it reads as undersized content lost in oceans of grey. A
premium design has VARIED spacing — tight where things relate,
generous where they don't.

Density axis (\`data-density="compact|default|comfortable"\`) lets the
USER pick how dense they want it. The designer picks the rhythm
RELATIONSHIPS; density scales them globally.`,
    examples: {
      do: `<Card padding="default">  {/* default = 16px, fine for general */}
  <Flex vertical gap="small">  {/* spacing-2 between label + control */}
    <Typography.Text strong>氏名</Typography.Text>
    <Input />
  </Flex>
</Card>`,
      dont: `// "Premium" via excess padding:
<Card padding="cozy" style={{ padding: 48 }}>
  <Flex vertical gap="large" style={{ gap: 32 }}>
    <Input style={{ marginBottom: 24 }} />
  </Flex>
</Card>`,
    },
  },
  {
    rule: 'COPY IS UX — write the smallest sentence that does the job. Drop filler.',
    body: `Banned filler that screams AI ("seamless", "powerful", "robust",
"unlock your potential", "elevate your X", "next-generation",
"best-in-class", "AI-powered" applied generically). Cardinal rule 9
makes this binding for framework docs; the same discipline applies
to consumer copy. Real product copy is SPECIFIC: "Save changes" not
"Apply your seamless edits". "3 件の打刻漏れ" not "Notable
attendance opportunity". Numbers, nouns, verbs — in that order.

Brand name patterns to avoid in placeholders / examples: Acme,
NovaCore, Flowbit, Quantix, VeloPay, Lumen, Apex — they read as
"AI couldn't think of one". Use believable Japanese / English
company names (株式会社 ABC商事, Tanaka Trading, Yokohama Coffee
Roasters) or your real brand.`,
    examples: {
      do: `<Button>保存</Button>
<Alert title="3 件の打刻漏れ" description="本日中に確認してください" />
<Empty title="まだ注文がありません" description="商品を追加して最初の注文を作成しましょう" />`,
      dont: `<Button>Seamlessly Save Your Premium Changes</Button>
<Alert title="Unlock Your Productivity Potential" description="Elevate your attendance experience" />
<Empty title="Begin Your Next-Generation Journey" description="..." />`,
    },
  },
  {
    rule: 'IMAGES ARE FIRST-CLASS — don\'t treat them as decorative afterthoughts.',
    body: `When a section needs an image (Empty state hero, onboarding flow,
marketing card), pick or specify a REAL image — product photo,
documentary photo, branded illustration. Don't fall back on AI
clichés: abstract gradient mesh, random crypto-bro icons, floating
3D shapes with no relationship to the product. \`<Image>\` primitive
supports proper aspect ratios + lazy loading; use it instead of
raw \`<img>\`.

For Avatars: Avatar's initials fallback is BETTER than a generic
stock photo of a smiling person — initials feel honest. Use real
faces only when you have consent + the photo is part of the data
(member profile, author byline). Don't decorate with stock people.`,
    examples: {
      do: `<Empty
  title="チームメンバーがいません"
  description="チームを作って始めましょう。"
  image={<Image src="/images/empty-team.svg" alt="" width={120} height={120} />}
  extra={<Button variant="primary">チームを作成</Button>}
/>`,
      dont: `// Random AI imagery — no product connection:
<Empty
  image={<RandomGradientMesh />}
  title="Get Started"  {/* generic */}
  extra={<Button>Begin</Button>}  {/* vague */}
/>`,
    },
  },
  {
    rule: "MOTION SUPPORTS, NEVER DECORATES — 200ms ease-out, prefers-reduced-motion respected.",
    body: `The "interesting hover micro-interactions" trap. Most micro-anim
should be IMPERCEPTIBLE — 100-200ms ease-out, opacity / transform
shift. They communicate state change ("button is now hovered",
"dialog is opening"). They should NEVER call attention to
themselves. The "card flips with a 600ms spring on hover" is an
AI tell — slow, distracting, breaks scanning rhythm.

Always wrap motion in \`@media (prefers-reduced-motion: no-preference)\`
or use Tailwind's \`motion-safe:\` prefix. WCAG 2.1 AA requires it.`,
    examples: {
      do: `// Subtle hover lift, instant — Tailwind handles motion-safe automatically:
<Card hoverable />  {/* hoverable enables motion-safe transition */}`,
      dont: `// Distracting 3D flip:
<Card className="hover:rotate-y-180 hover:scale-105 transition-all duration-700" />`,
    },
  },
  {
    rule: "VARIATION OVER CLONE — every screen / section has unique compositional intent.",
    body: `Adapted from the web SKILL composition rule. Don't reach for the
default "left-text / right-image hero" every time. Vary:
- centered over background image
- bottom-left text over image
- image-as-canvas (image fills, text overlays bottom)
- off-grid editorial (asymmetric)
- mini-minimalist (just a sentence + button)
- stacked center (icon → headline → sub → CTA)
- inverted classic (right-text / left-image)

A multi-page app where every page uses the same hero shape feels
like a template; an app with VARIED hero compositions (still on
the same palette + type system for consistency) feels art-directed.

@godxjp/ui doesn't dictate hero composition — but its Card / Flex /
Grid primitives + spacing + typography tokens give you the canvas
to express variety while staying coherent.`,
    examples: {
      do: `// Different pages, different compositional intent — same palette:
// Page A — image-as-canvas:
<div className="relative h-[60vh]">
  <Image src="/hero.jpg" fill className="object-cover" />
  <div className="absolute bottom-12 left-12 max-w-md">
    <Typography.Title size={1} style={{ color: "white" }}>...</Typography.Title>
  </div>
</div>
// Page B — stacked center:
<Flex vertical align="center" gap="default" style={{ textAlign: "center" }}>
  <Icon size={48} />
  <Typography.Title size={1}>...</Typography.Title>
  <Button>Get started</Button>
</Flex>`,
    },
  },
  {
    rule: "READABILITY OVER CLEVER — if the user squints, the design failed.",
    body: `WCAG 2.1 AA: 4.5:1 contrast for body text, 3:1 for large/UI.
@godxjp/ui's tokens are all pre-audited. The AI mistakes:
- white text on a soft gradient ("looks dreamy", reads as nothing)
- gray-on-gray for "subtle" labels ("Typography.Text color=secondary"
  uses a pre-validated muted-foreground that still hits AA)
- 10px helper text "for density"
- Excessive letter-spacing for "premium" headlines

Use \`--text-sm\` (14px) as the SMALLEST body. \`--text-xs\` (12px)
only for metadata that doesn't need to be read attentively
(timestamps, counts). Below that, you're designing for screenshots
not humans.`,
    examples: {
      do: `<Typography.Text color="secondary">  {/* token-pinned, AA-verified */}
  更新日: 2026-05-19
</Typography.Text>`,
      dont: `<span style={{ color: "#aaa", fontSize: 10 }}>更新日: 2026-05-19</span>`,
    },
  },
  {
    rule: "PROVE THE FORM — every input has clear label, help, and error state.",
    body: `Three states every form field has visible at the relevant moment:
LABEL (always — never placeholder-as-label), HELP (description
text — visible if the field needs context), ERROR (after blur if
invalid). \`<FormField label="..." description="..." />\` gives you
all three with token-pinned colors + WCAG-compliant
\`aria-describedby\` wiring.

The AI mistake: floating placeholder pattern as label (looks slick,
fails when filled — user forgets what the field was). Also: error
messages as toasts ("Something went wrong") that disappear before
SR can announce + don't tie to the input. Field-adjacent error
(\`<FormField>\` does this automatically) is the canonical UX.`,
    examples: {
      do: `<FormField name="email" label="メールアドレス" required
  description="ログイン ID として使用します">
  <Input type="email" placeholder="taro@example.com" />
</FormField>
{/* On submit, validation error appears below the input with role="alert" */}`,
      dont: `<Input placeholder="メールアドレス" />
{/* No label, no required indicator, no error wiring */}`,
    },
  },
];

export const DESIGN_THINKING_INTRO = `
# Designing with @godxjp/ui — the TASTE bar

This framework gives you primitives, tokens, layouts. It does NOT
guarantee good design — that's on the consumer. A premium product UI
needs MORE than primitives; it needs decisions about:

  - hierarchy (what's the ONE thing on this screen?)
  - palette (which 1-2 accents carry the brand?)
  - rhythm (which spacing relationships mean "related"?)
  - typography (which level signals "primary" vs "metadata"?)
  - motion (what reinforces state changes vs decorates?)
  - copy (what's the smallest sentence that does the job?)

The 11 principles below are battle-tested across mobile + web design
critique. Apply them at design-decision time — before reaching for a
primitive. The primitive only renders what you decide.

CARDINAL: mobile-first is not negotiable. Design from 320px up.
`;
