/**
 * Anti-AI-tells catalog — specific patterns that signal "this UI was
 * synthesised by an LLM without taste". Adapted from the taste-skill
 * SKILL.md (mobile + web) and the @godxjp/ui review log. The MCP
 * exposes this so consumer agents can self-audit BEFORE shipping.
 */

export interface AiTell {
  /** The pattern, by category. */
  category: "visual" | "layout" | "copy" | "interaction" | "imagery" | "structure";
  /** Short name. */
  name: string;
  /** What it looks like + why it's a tell. */
  body: string;
  /** What to do instead — concrete fix. */
  fix: string;
}

export const ANTI_AI_TELLS: AiTell[] = [
  // ── visual ─────────────────────────────────────────────────────
  {
    category: "visual",
    name: "Purple-blue gradient hero",
    body: `The default LLM color palette — purple → blue → cyan radial /
linear gradient as hero background. Looks like every AI-generated
SaaS landing page from 2023.`,
    fix: `Use the framework's accent palette (\`data-accent="blue"\` /
"violet" / "cyan" / "green" / "orange" / "rose"). Solid surface
colors with semantic meaning. If you want depth, use a SINGLE
subtle gradient that supports brand (not decoration).`,
  },
  {
    category: "visual",
    name: "Glassmorphism without purpose",
    body: `Frosted-glass cards stacked on a colorful blurry background.
Looked novel in 2020 — now a tell that the designer reached for
trend instead of solving a problem.`,
    fix: `Solid surface tiers (Card on background, Popover on Card,
Dialog on backdrop). The framework's elevation system already
encodes 3 surface tiers — use them.`,
  },
  {
    category: "visual",
    name: "Ambient blobs / floating shapes",
    body: `Random gradient blobs floating behind content with no narrative
purpose. The "creative space-filler" AI pattern. Reads as
distracting noise.`,
    fix: `If the page needs visual interest, use a REAL image (product
photo, founder photo, branded illustration). If you need
"breathing room", use whitespace. Never use shapes as filler.`,
  },
  {
    category: "visual",
    name: "Oversized border-radius on everything",
    body: `Every Card / Button / Input with \`border-radius: 24px\`. Reads
as "I picked one radius and applied it globally". Premium design
uses ROLES — small radius on inputs (4-6px), medium on cards
(8-12px), pill on chips (full).`,
    fix: `Use the framework's radius scale (\`--radius-sm | -md | -lg | -full\`).
Each primitive defaults to the right role; only override when the
design canon specifically calls for it.`,
  },
  {
    category: "visual",
    name: "Rainbow chip wall",
    body: `Row of Tags / Badges each in a different color (red, orange,
yellow, green, blue, purple) — usually navigation or filter
categories. Reads as chaos; eye can't anchor.`,
    fix: `Pick ONE accent for the tag row. Use \`appearance\` ("soft" vs
"solid" vs "outline") for variety within the same hue. Reserve
non-neutral colors (success / warning / destructive) for tags
that genuinely carry that meaning.`,
  },
  {
    category: "visual",
    name: "Oversaturated brand accent",
    body: `Full-bleed, fully-saturated brand color on buttons, banners and
notification bars (the classic loud Slack/Linear/Notion blue) — the
accent SCREAMS instead of signalling. A bright primary CTA bar across
the whole width, vivid send buttons, neon success. It reads as a
verbatim copy of a SaaS chrome, not a restrained product surface.`,
    fix: `渋み (restraint): keep --primary chroma ≤ 0.18 — desaturate so the
accent BLENDS with the warm-neutral spine and is used sparingly for
the ONE primary action. Don't paint a full-width bar in raw blue;
prefer a quiet Alert (icon + text + a normal-width action). Never
hard-code a vivid hex — read \`bg-primary\`/\`text-primary\` tokens, and
let a service retheme via --primary only.`,
  },

  // ── layout ─────────────────────────────────────────────────────
  {
    category: "layout",
    name: "8-card stat dashboard",
    body: `Homepage with a 4x2 grid of "stat cards" — each with an icon, a
number, a sparkline, a delta. None of them relate to a real
business question; they were chosen because "more cards = more
data". Classic AI dashboard slop.`,
    fix: `Show 1-2 hero metrics (the ones executives ASK about), then the
top action list (orders waiting, tasks due, alerts). If the user
needs more analytics, link to a dedicated Reports page.`,
  },
  {
    category: "layout",
    name: "Phone-shaped website",
    body: `Mobile screen rendered as a vertical strip with the same density
+ same layout as desktop — just narrower. Cramped tap targets,
horizontal scrolling for overflow, no system bar awareness.`,
    fix: `Mobile is its OWN design. Use full-width inputs (\`block\` Button),
stacked layout, larger tap targets, Sheet/Drawer for secondary
content, system-bar safe area. The framework's \`useBreakpoint\`
+ Tailwind \`sm:\` variants give you the canvas.`,
  },
  {
    category: "layout",
    name: "Wall-of-tabs navigation",
    body: `10+ tabs at the top of a screen, no priority. User has to read all
of them to find the right one. AI default: "more tabs = more
features = better".`,
    fix: `2-4 tabs max. If you have more categories, use a sidebar (Sidebar),
or a Cascader / Tree picker. Tabs are for switching between PEERS
(2-4 mutually exclusive views of the same data).`,
  },
  {
    category: "layout",
    name: "Identical clone screens",
    body: `5 onboarding steps where every screen has the same headline +
illustration + 2 buttons layout. Reads as "I copy-pasted the
template" — and devalues the user's time at each step.`,
    fix: `Each step has a distinct visual + interactive feel. Step 1 might
be a centered question, step 2 a side-by-side comparison, step 3
a multi-field form, step 4 a single yes/no card. Same palette +
type system for coherence; different composition for engagement.`,
  },
  {
    category: "layout",
    name: "Stacked notification banner (misplaced alert controls)",
    body: `A notification / "enable X" bar where the pieces are stacked
VERTICALLY and mis-placed: the icon floats centered ABOVE the text
(often a SECOND redundant icon on the far left too), the primary
action is a FULL-WIDTH colored bar UNDER the text, and the dismiss ×
sits centered at the BOTTOM on its own line. It's a hand-rolled
banner that ignores the framework's Alert anatomy.`,
    fix: `Use <Alert> and respect its fixed anatomy — ONE leading tone icon
at the inline-start (top-aligned, auto by \`tone\`, never two), the
text body, an <Alert.Actions> with a NORMAL-WIDTH Button in the
trailing-right column, and \`onDismiss\` to render the × in the
TOP-RIGHT corner. It is ONE horizontal row, never a vertical stack;
never hand-roll the ✕ or a full-bleed action bar.`,
  },

  // ── copy ───────────────────────────────────────────────────────
  {
    category: "copy",
    name: "Emoji in product UI",
    body: `Emoji sprinkled through the product surface — ✅ / 🎉 / 🔥 in chat
messages, status lines, toasts, buttons, empty states or success
banners ("All tests green 🎉", "done ✅"). It reads as casual
consumer-app slop, breaks on Windows/Linux, and pollutes the
accessible name. Celebrating with confetti/🎉 is the same tell.`,
    fix: `No emoji anywhere in product UI. State the fact quietly in
i18n-keyed copy ("承認しました" / "All checks passed"). Use a Lucide
icon (1.5px) for an affordance and a semantic Badge \`tone\`
(success/warning/destructive) for status — color + label carry the
meaning, not a glyph. Country names come from \`Intl.DisplayNames\`,
never emoji flags.`,
  },
  {
    category: "copy",
    name: "Filler corporate phrases",
    body: `"Elevate your potential", "unlock seamless productivity",
"transform your workflow", "next-generation experience". Reads as
nothing because it MEANS nothing.`,
    fix: `Write what the feature DOES, specifically. "Sync 1,000 rows in 2
seconds" beats "Lightning-fast performance". "Replaces 3 manual
steps" beats "Streamline your workflow".`,
  },
  {
    category: "copy",
    name: "Generic brand placeholders",
    body: `Acme, NovaCore, Flowbit, Quantix, VeloPay, Lumen, Apex — the
go-to AI brand names that scream "I couldn't think of one".`,
    fix: `Use believable real-sounding names: 株式会社ABC商事, Tanaka
Trading, Yokohama Coffee Roasters, Mountain View Bakery. Or use
your actual project's brand if known.`,
  },
  {
    category: "copy",
    name: "Vague empty-state copy",
    body: `"Get started", "Begin your journey", "No items yet" — without
saying WHAT to do or WHY there's nothing.`,
    fix: `Be specific + actionable: "まだ注文がありません。商品を追加して
最初の注文を作成しましょう。" + a clear next-action Button.
Empty states are TEACHING MOMENTS — use them to onboard.`,
  },
  {
    category: "copy",
    name: "Apologetic / passive-voice error messages",
    body: `"Sorry, something went wrong" / "An error has occurred" — no
information about WHAT, no recovery action.`,
    fix: `Specific + actionable: "メールアドレスの形式が正しくありません
(例: name@example.com)". For server errors: "通信エラー
(再試行 ボタン)". Never apologise if you can't say what failed
or what to do.`,
  },

  // ── interaction ────────────────────────────────────────────────
  {
    category: "interaction",
    name: "Hover-only affordances",
    body: `Action buttons that only appear on hover (table row actions
hidden until mouseover). Breaks on mobile (no hover), inaccessible
(keyboard users can't discover).`,
    fix: `Show actions inline or in a kebab menu (DropdownMenu) that's
ALWAYS visible. If you must hide on desktop for density, ensure
the same actions are reachable via keyboard (Tab to row, Enter to
expand a row-actions DropdownMenu).`,
  },
  {
    category: "interaction",
    name: "Auto-advancing carousel",
    body: `Hero carousel that rotates every 3 seconds. Users haven't
finished reading slide 1; now slide 2 is gone. Accessibility
nightmare (cognitive load, motion-sensitive).`,
    fix: `Carousel ONLY rotates on explicit user action (arrow click,
dot click, swipe). \`<Carousel autoplay={false}>\` is the default
in the framework for this reason.`,
  },
  {
    category: "interaction",
    name: "Drag-without-handle",
    body: `Cards / list items reorderable by long-press anywhere — no
visual indicator that they ARE draggable. Users discover it by
accident or never.`,
    fix: `Show a drag handle icon (\`<GripVertical>\`) on the left of the
row. Users see it, understand "this row is draggable", reach for
it deliberately.`,
  },
  {
    category: "interaction",
    name: "Disappearing focus ring",
    body: `\`outline: none\` on focus to "look cleaner". Keyboard users
can't see where they are; total navigation failure.`,
    fix: `Use \`:focus-visible\` (Radix primitives do automatically) so the
ring shows on keyboard focus, hides on mouse-click. Don't strip.`,
  },

  // ── imagery ────────────────────────────────────────────────────
  {
    category: "imagery",
    name: "Stock photo of generic smiling team",
    body: `Empty state / About page with a photo of a "diverse team in an
open office laughing at a laptop". Reads as 2010 corporate stock.
No relationship to your product.`,
    fix: `Real photos of YOUR team / users (with consent), product
screenshots, branded illustrations. Avatar's INITIALS fallback is
better than a generic stock person.`,
  },
  {
    category: "imagery",
    name: "Floating 3D crypto icon",
    body: `Empty state with a chrome / pastel 3D icon (coin, key, shield)
floating in the center. Looks like every NFT marketplace from
2021.`,
    fix: `Simple lucide-react line icon (\`<Inbox size={48} />\`) +
descriptive title. Or a flat illustration matching the brand
palette. Skip the 3D entirely unless your brand IS 3D.`,
  },
  {
    category: "imagery",
    name: "Decorative gradient mesh background",
    body: `Page sections with a colorful gradient mesh ("Stripe-style")
behind text. Looks "premium" until you realize every AI design
uses it. Often hurts text contrast.`,
    fix: `Solid background (\`--background\`). If you need depth, use a
subtle 1px border + \`--card\` background tint. Reserve high-effort
backgrounds for pages where they matter (marketing hero, product
showcase) — not every internal screen.`,
  },

  // ── structure ──────────────────────────────────────────────────
  {
    category: "structure",
    name: "Settings as one long form",
    body: `Settings page with 40 form fields in a single scroll. User
loses their place, can't find the field they came for.`,
    fix: `Section the form with \`<Typography.Title size={5}>\` subheaders
+ \`<Separator />\`. Group by concern (基本情報 / 公開範囲 / 通知 /
セキュリティ). If 40 fields is still too many, split into Tabs
or a Sidebar-driven multi-page settings flow.`,
  },
  {
    category: "structure",
    name: "Modal-in-modal-in-modal",
    body: `Click a Button → Dialog opens → click "Edit" → another Dialog
opens → click "Confirm" → AlertDialog opens. Triple stack;
user loses context.`,
    fix: `Use Sheet for the FIRST level (side panel), Dialog for the
confirm. Or, redesign the flow so the edit is INLINE in the
first Dialog (no second Dialog needed). AlertDialog for confirm
is correct — but ONE deep, not three.`,
  },
  {
    category: "structure",
    name: "Spinner-only loading state",
    body: `Page-level spinner while data loads. User stares at an empty
shell with a centered spinner. Layout shifts when content
arrives.`,
    fix: `Use Skeleton placeholders matching the eventual content shape.
The framework's \`<Form loading={{ kind: "skeleton" }}>\` cascades
to every field; \`<Skeleton className="h-9 w-full rounded-md" />\`
for individual blocks. Layout stays stable, perceived speed
improves.`,
  },
];

export function aiTellsByCategory(cat: AiTell["category"]): AiTell[] {
  return ANTI_AI_TELLS.filter((t) => t.category === cat);
}
