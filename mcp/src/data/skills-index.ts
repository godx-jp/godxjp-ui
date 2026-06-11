/**
 * Skills index — TOKEN-EFFICIENT registry of every taste / design
 * skill the MCP exposes. The agent uses `list_skills` to discover
 * (returns just id + name + tagline + section list) then
 * `get_skill_section` to drill into one section.
 *
 * Sources synthesised from Leonxlnx/taste-skill + framework-native
 * design knowledge. Body strings are stored separately in their
 * existing data files (design-thinking.ts, anti-ai-tells.ts, etc.)
 * to avoid duplication.
 */

export interface SkillSection {
  /** URL-safe section id. */
  id: string;
  /** Display title. */
  title: string;
  /** One-line tagline of what this section covers. */
  tagline: string;
  /** Body — Markdown. */
  body: string;
}

/**
 * Who a skill is for:
 *   - "core"     — building/maintaining @godxjp/ui ITSELF (the library, its docs,
 *                  its MCP catalog). Hidden from the consumer-facing tools.
 *   - "consumer" — building an APP that imports @godxjp/ui. Surfaced by
 *                  list_consumer_skills / route_consumer_task / get_consumer_skill.
 *   - "both"     — applies to either audience (e.g. universal taste/output rules).
 * Consumer tools surface audience ∈ {consumer, both}; core-only skills stay hidden
 * from them so an app-dev is never confronted with library-maintenance material.
 */
export type SkillAudience = "core" | "consumer" | "both";

export interface Skill {
  id: string;
  name: string;
  /** Intended audience — drives the consumer-namespace tool filtering. */
  audience: SkillAudience;
  /** When to reach for this skill — written so the router can match a task to it. */
  whenToUse: string;
  /** Source attribution. */
  source: string;
  sections: SkillSection[];
}

/** True if a skill should be visible to the consumer-facing tools. */
export function isConsumerSkill(s: Skill): boolean {
  return s.audience !== "core";
}

export const SKILLS: Skill[] = [
  // ── taste (foundational) ───────────────────────────────────────
  {
    id: "taste",
    audience: "both",
    name: "Taste baseline — Senior UI/UX engineering",
    whenToUse:
      "Default for any production app screen. Metric-based rules, strict component architecture, CSS hardware acceleration, balanced design engineering.",
    source: "Leonxlnx/taste-skill (root) + @godxjp/ui design-thinking.ts",
    sections: [
      {
        id: "mobile-first",
        title: "Mobile-first non-negotiable",
        tagline: "Defaults target xs (≥0px); enhance via sm: / md: / lg: / xl: / 2xl:",
        body: `Cardinal rule 24. Touch targets ≥ 44×44 px. NEVER read
window.innerWidth — use useBreakpoint(). Stories render at narrow
viewport first. Multi-column layouts: grid grid-cols-1 sm:grid-cols-N.
EXCEPTION: name pairs (姓+名) use grid-cols-2 always.`,
      },
      {
        id: "one-intent-per-screen",
        title: "One intent per screen",
        tagline: "Pick the ONE primary question this page answers. 60-80% visual weight to it.",
        body: `Wall-of-cards dashboards are AI slop. Show 1-2 hero metrics
+ ONE primary list + contextual actions. Tertiary content lives in
Sheet / DropdownMenu / next page. The 8-stat-card grid pattern is a
RED FLAG — it means "I couldn't decide what mattered".`,
      },
      {
        id: "type-hierarchy",
        title: "Type does the hierarchy work",
        tagline: "Weight + size + color, NOT colored background blocks.",
        body: `Typography.Title size={1..5} is the canonical scale. h2 → h3 → h4
each ~75% of previous. Don't skip levels. Body = Typography.Paragraph.
Metadata = Typography.Text color="secondary". Type contrast alone IS
the hierarchy — colored background blocks for every section is AI
slop. Reserve colored bg for genuinely different surfaces (Card vs
page, Alert vs body).`,
      },
      {
        id: "whitespace-is-content",
        title: "Whitespace IS content",
        tagline: "Use the smallest spacing step that visually separates concepts.",
        body: `Spacing ladder: --spacing-1 (4px) for tight groups, -2 (8) for
control pairs, -3 (12) for related controls in form, -4 (16) for
sections, -6 (24) for cards in grid, -8 (32) for page rhythm.
"Premium via excess padding" (everything spacing-6 to feel premium)
is wrong — undersized content lost in oceans of grey. Premium = VARIED
spacing — tight where related, generous where not.`,
      },
      {
        id: "two-accents",
        title: "Two accents do real work — not eight",
        tagline: "ONE brand color for action + ONE semantic color contextually. Not a rainbow.",
        body: `Use --primary for actions (Button, link, focus ring) + ONE
semantic (destructive for delete confirm, warning for deadline alert,
success for completed state). NEVER a rainbow tag wall. Tag variety
via appearance (soft/solid/outline) of the SAME hue, not different
hues.`,
      },
      {
        id: "form-discipline",
        title: "Form discipline — label, help, error always",
        tagline: "Every input has explicit label + help + error wired via FormField.",
        body: `Never placeholder-as-label (disappears on focus). Use
<FormField label description /> — it wires the Radix Label, the
description text, and the error via aria-describedby + role="alert"
automatically. Server errors as inline near the field, NOT as toasts
(SR can't announce a disappearing toast).`,
      },
      {
        id: "loading-states",
        title: "Skeleton for INIT, Spinner for ACTIVE work",
        tagline: "Different states for different moments — never mix.",
        body: `<Form loading={{ kind: "skeleton" }}> while fetching existing
values (no data yet — maintain layout, prevent flash). <Form loading>
(boolean true) while saving (data is there, you're transforming).
Skeleton during save is wrong (user sees structure they already saw —
broken). Spinner during init is wrong (nothing to spin over).`,
      },
    ],
  },

  // ── crud-list (search/list pages) ─────────────────────────────
  {
    id: "crud-list",
    audience: "consumer",
    name: "CRUD list / search page — DataTable + search recipe",
    whenToUse:
      "Building any list/index/search screen over a paginated API: an admin table with a search panel, pagination, and row actions. The invariant contract for 'processing' feedback, disabled controls, sticky actions, and the search form.",
    source: "@godxjp/ui DataTable + TanStack Query keepPreviousData contract",
    sections: [
      {
        id: "fetch-contract",
        title: "Fetch contract — keepPreviousData → isPlaceholderData",
        tagline: "Pagination/search keeps the old page on screen; isPlaceholderData IS the processing flag.",
        body: `Use React Query with placeholderData: keepPreviousData and the
search params IN the queryKey (["orders", params]). On a new page/search
the previous rows stay mounted, so isLoading is FALSE — do NOT key
loading UI off isLoading. The processing signal is isPlaceholderData
(params changed, new data in flight). First-ever load (no prior data) is
isLoading. So: loading = isLoading || isPlaceholderData. Idle the query
(enabled: params !== null) until the user searches.`,
      },
      {
        id: "loading-skeleton",
        title: "Skeleton via DataTable loading — never hand-roll",
        tagline: "Pass loading to <DataTable>; it renders a shaped skeleton INSIDE its own grid.",
        body: `<DataTable data={rows} columns={columns} loading={loading} />.
DataTable swaps its body for shaped skeleton rows that reuse its own
grid — one border, aligned columns. NEVER render a separate
<SkeletonTable> inside a <Card> next to/around the table: the skeleton's
frame + the Card's border = an ugly DOUBLE BORDER. Keep summary lines as
Skeleton bars while loading too, so stale counts don't flash.`,
      },
      {
        id: "disable-controls",
        title: "Disable search + pager while fetching",
        tagline: "A request is in flight → block re-submits. loading on Button, disabled on Pagination.",
        body: `The 照会/Search button: <Button loading={isFetching}> (loading
implies disabled). The pager: <Pagination disabled={loading} /> — it
blocks prev/next/page clicks AND onValueChange while a fetch is running,
so the user can't queue a second request mid-flight. Drive both off the
SAME processing flag as the skeleton so the screen is coherent.`,
      },
      {
        id: "sticky-actions",
        title: "Row-actions column is pinned to the end",
        tagline: "Action buttons must stay visible on horizontal scroll — column pin: 'end'.",
        body: `Give the actions column { key: "actions", header: "操作",
pin: "end", align: "right" }. DataTable makes it position:sticky at the
inline-end edge with an opaque, hover/selection-aware background and a
separating shadow (—table-pin-shadow), and suppresses the scroll fade so
it isn't dimmed. Pin at most ONE column per table. RTL-correct out of the
box (logical inset-inline-end).`,
      },
      {
        id: "search-form",
        title: "Search panel is Form + FormField + real pickers",
        tagline: "No ad-hoc labels/inputs; date ranges use the range pickers; no hard-coded text sizes.",
        body: `Build the search conditions with <Form>/<FormField> (label +
a11y wiring), real DatePicker/DateRangePicker/MonthPicker/NumberInput/
Select for each field — never bare <input> or hand-rolled labels. Group
advanced conditions behind a 詳細条件 toggle. Submit copies the live
condition state into the query params (a new object → new queryKey →
fetch). Clear resets to the idle (null) state.`,
      },
    ],
  },

  // ── soft (Awwwards / premium agency) ───────────────────────────
  {
    id: "soft",
    audience: "consumer",
    name: "Awwwards-tier — $150k agency build",
    whenToUse:
      "Premium agency brief — marketing site, hero pages, product showcase. NOT every internal SaaS screen. Apply when the brief asks for 'Linear-tier', 'Apple-esque', 'Awwwards-style'.",
    source: "Leonxlnx/taste-skill/soft-skill",
    sections: [
      {
        id: "absolute-zero",
        title: "Absolute Zero — banned defaults",
        tagline: "Inter / Roboto / Lucide / shadow-md / 3-col Bootstrap / linear easing — banned.",
        body: `BANNED FONTS: Inter, Roboto, Arial, Open Sans, Helvetica → use Geist
/ Clash Display / PP Editorial New / Plus Jakarta Sans.
BANNED ICONS: standard thick Lucide / Material → use Phosphor Light /
Remix Line.
BANNED BORDERS: generic 1px solid gray → hairline rings (ring-1
ring-black/5), tinted borders, OR whitespace as separator.
BANNED SHADOWS: shadow-md, rgba(0,0,0,0.3) → ultra-diffuse low-opacity
(<0.05), TINTED to background.
BANNED LAYOUTS: edge-to-edge sticky navbars, symmetric 3-col → floating
glass nav pills, asymmetric bento grids.
BANNED MOTION: linear / ease-in-out / instant → custom cubic-bezier
(0.32, 0.72, 0, 1), spring physics, scroll interpolation.`,
      },
      {
        id: "vibe-archetypes",
        title: "3 Vibe Archetypes (pick 1)",
        tagline:
          "Ethereal Glass (SaaS/AI) | Editorial Luxury (Lifestyle/Agency) | Soft Structuralism (Consumer/Health)",
        body: `1. ETHEREAL GLASS (SaaS / AI / Tech): OLED black #050505, radial
   mesh gradients (purple/emerald orbs), Vantablack cards with heavy
   backdrop-blur-2xl, white/10 hairlines. Wide geometric Grotesk.
2. EDITORIAL LUXURY (Lifestyle / Real Estate / Agency): Warm creams
   #FDFBF7, muted sage, deep espresso. High-contrast Variable Serif
   for massive headings. CSS noise overlay opacity-0.03 for paper.
3. SOFT STRUCTURALISM (Consumer / Health / Portfolio): Silver-grey
   or pure white. Massive bold Grotesk typography. Airy floating
   components, unbelievably soft diffused ambient shadows
   (shadow-[0_30px_60px_-30px_rgba(0,0,0,0.06)]).`,
      },
      {
        id: "layout-archetypes",
        title: "3 Layout Archetypes (pick 1)",
        tagline:
          "Asymmetric Bento | Z-Axis Cascade | Editorial Split — ALL collapse to single-col on mobile.",
        body: `1. ASYMMETRIC BENTO: Masonry CSS Grid varying card sizes
   (col-span-8 row-span-2 next to stacked col-span-4). Mobile:
   grid-cols-1, gap-6, all col-span reset to 1.
2. Z-AXIS CASCADE: Elements stacked like physical cards, slightly
   overlapping with varying depth + -2deg/3deg rotations. Mobile:
   REMOVE rotations + negative-margin overlaps below 768px (touch
   conflicts), stack vertically.
3. EDITORIAL SPLIT: Massive typography w-1/2 left, interactive
   scrollable content right. Mobile: full-width vertical stack,
   typography on top, content below with horizontal scroll preserved.

UNIVERSAL MOBILE OVERRIDE: w-full, px-4, py-8 below 768px. NEVER
h-screen — always min-h-[100dvh] (iOS Safari viewport jump fix).`,
      },
      {
        id: "double-bezel",
        title: "Double-Bezel / Doppelrand architecture",
        tagline: "Cards nested like physical hardware — glass plate in aluminum tray.",
        body: `Never flat. Wrap every premium card in two nested enclosures:

OUTER SHELL: subtle bg (bg-black/5 or bg-white/5), hairline outer
border (ring-1 ring-black/5 or border border-white/10), padding
p-1.5 / p-2, large outer radius (rounded-[2rem]).

INNER CORE: distinct background, inner highlight
(shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]), mathematically
smaller radius (rounded-[calc(2rem-0.375rem)]) for concentric curves.

The math gives "machined hardware" look. Concentric curves = human
eye reads "precision".`,
      },
      {
        id: "button-in-button",
        title: "Button-in-Button trailing icon",
        tagline: "Trailing arrow lives in its OWN nested pill — not naked next to text.",
        body: `Primary buttons: rounded-full, px-6 py-3 generous padding. Trailing
arrow/icon NEVER sits naked next to text. Nests in its own circular
wrapper: w-8 h-8 rounded-full bg-black/5 flex items-center justify-
center, flush with main button's right inner padding. On hover, inner
icon translates diagonally + scales up — internal kinetic tension.`,
      },
      {
        id: "magnetic-hover",
        title: "Magnetic button hover physics",
        tagline:
          "Custom cubic-bezier, scale on press, internal translate on hover. NO linear easing.",
        body: `Use group utility. Hover ≠ background color change. On hover:
nested inner icon circle translates diagonally (group-hover:translate-
x-1 group-hover:-translate-y-[1px]) AND scales up (scale-105). On
press: scale entire button down slightly (active:scale-[0.98]) —
simulates physical click. Custom cubic-bezier on ALL transitions
(NEVER linear / ease-in-out).`,
      },
      {
        id: "scroll-entry",
        title: "Scroll-interpolation entry animations",
        tagline: "Elements never appear statically — gentle fade-up from below with blur.",
        body: `As elements enter viewport: translate-y-16 blur-md opacity-0 →
translate-y-0 blur-0 opacity-100 over 800ms+. Use IntersectionObserver
or Framer Motion's whileInView. NEVER window.addEventListener("scroll")
— continuous reflows kill mobile perf.`,
      },
      {
        id: "performance-guardrails",
        title: "Performance guardrails",
        tagline: "GPU-safe transforms, blur only on fixed/sticky, noise on pointer-events-none.",
        body: `- Animate transform + opacity ONLY. NEVER top/left/width/height
  (layout reflow). will-change: transform sparingly.
- backdrop-blur only on FIXED/STICKY elements. NEVER on scrolling
  containers — continuous GPU repaints, severe mobile frame drops.
- grain/noise: FIXED pointer-events-none pseudo-element (position:
  fixed; inset: 0; z-index: 50). Never on scrolling containers.
- Z-index discipline: no arbitrary z-50 or z-[9999]. Reserve for
  systemic layers (sticky nav, modals, overlays, tooltips).`,
      },
    ],
  },

  // ── minimalist (editorial workspace) ───────────────────────────
  {
    id: "minimalist",
    audience: "consumer",
    name: "Minimalist — editorial workspace",
    whenToUse:
      "Document-style apps (Notion-clone, knowledge base, blog admin). Warm monochrome + spot pastels. Bento grids. Editorial serif headings + sans body + monospace for data.",
    source: "Leonxlnx/taste-skill/minimalist-skill",
    sections: [
      {
        id: "negative-constraints",
        title: "Banned defaults",
        tagline: "Inter / Roboto / Lucide / shadow-md / pill containers / emojis / Acme — banned.",
        body: `BANNED: Inter / Roboto / Open Sans fonts. Lucide / Feather / Heroicons
default icons. Tailwind heavy shadows (md/lg/xl). Primary-colored hero
backgrounds. Gradients, neon, full glassmorphism. rounded-full on
large containers. Emojis anywhere in markup. Generic names (John Doe,
Acme, Lorem Ipsum). AI clichés (Elevate, Seamless, Unleash, Next-Gen).`,
      },
      {
        id: "typography",
        title: "Editorial typography",
        tagline: "Serif heading + character sans body + mono data. Off-black for body, never pure.",
        body: `Pair: editorial serif (Lyon Text / Newsreader / Playfair / Instrument
Serif) for headings WITH character sans (SF Pro Display / Geist Sans /
Switzer) body WITH monospace (Geist Mono / JetBrains Mono / SF Mono)
for data + keystrokes.

Tight tracking on serif headings (-0.02em to -0.04em). Tight
line-height (1.1). Body line-height 1.6. Body color: off-black
#111111 or #2F3437 — NEVER pure #000. Secondary text: muted gray
#787774.`,
      },
      {
        id: "palette",
        title: "Warm monochrome + spot pastels",
        tagline: "Canvas warm bone #F7F6F3. Accents from 4 desaturated pastels only.",
        body: `Canvas: #FFFFFF or warm bone #F7F6F3 / #FBFBFA.
Cards: #FFFFFF or #F9F9F8.
Borders: ultra-light #EAEAEA or rgba(0,0,0,0.06).

Accents EXCLUSIVELY from 4 muted pastels:
- Pale Red:    bg #FDEBEC | text #9F2F2D
- Pale Blue:   bg #E1F3FE | text #1F6C9F
- Pale Green:  bg #EDF3EC | text #346538
- Pale Yellow: bg #FBF3DB | text #956400`,
      },
      {
        id: "bento-grids",
        title: "Asymmetric bento grids",
        tagline: "Cards: 1px solid #EAEAEA, 8-12px radius MAX, 24-40px padding, NO shadow.",
        body: `Asymmetric CSS Grid layouts (1x1, 1x2, 2x1, 2x2). Cards:
border: 1px solid #EAEAEA, border-radius 8px or 12px MAX (never larger),
generous internal padding (24-40px), no box-shadow. Use raw CSS Grid
with gridColumn/gridRow span for the bento layout.`,
      },
      {
        id: "components",
        title: "Component refinements",
        tagline:
          "Primary CTA: solid black bg, 4-6px radius. Tags: pill + uppercase + 0.05em tracking + pastel.",
        body: `PRIMARY CTA: solid #111 bg, white text, 4-6px radius (NOT full pill),
no shadow. Hover: shift to #333 or active:scale(0.98).
TAGS/BADGES: pill (border-radius 9999px), text-xs UPPERCASE,
letter-spacing 0.05em. Background = muted pastel. Deep text color.
ACCORDIONS (FAQ): strip ALL container chrome. Items separated by
border-bottom: 1px solid #EAEAEA only. Toggle: sharp + / − icons.
KBD: <kbd> as physical key — 1px solid #EAEAEA, 4px radius, #F7F6F3
bg, monospace.
FAUX-OS chrome (for product previews): white top bar + 3 small light-
gray circles (macOS replica).`,
      },
      {
        id: "motion",
        title: "Subtle invisible motion",
        tagline:
          "Scroll-entry fade-up 600ms cubic-bezier(.16,1,.3,1). Card hover lift via shadow shift only.",
        body: `Scroll entry: translateY(12px) + opacity(0) → 0/1 over 600ms with
cubic-bezier(0.16, 1, 0.3, 1). IntersectionObserver, never raw scroll.
Hover lift: box-shadow 0 → 0 2px 8px rgba(0,0,0,0.04) over 200ms.
Buttons: scale(0.98) on :active. Staggered list reveals: animation-
delay calc(var(--index) * 80ms). Background ambient: optional slow
radial gradient blob, 20s+ duration, opacity 0.02-0.04, on
position:fixed pointer-events-none layer.`,
      },
    ],
  },

  // ── brutalist ──────────────────────────────────────────────────
  {
    id: "brutalist",
    audience: "consumer",
    name: "Brutalist — Swiss print + military terminal",
    whenToUse:
      "Data-heavy dashboards, declassified-blueprint feel, portfolios needing raw mechanical aesthetic. Rigid grids, extreme type scale contrast, utilitarian color, analog degradation effects.",
    source: "Leonxlnx/taste-skill/brutalist-skill",
    sections: [
      {
        id: "principles",
        title: "Brutalist principles",
        tagline:
          "Raw mechanical interfaces — rigid grids, extreme type contrast, utilitarian color, analog degradation.",
        body: `Rejects ornament. Embraces structure as aesthetic. Grids are visible
(via borders or rules). Type scale is dramatically contrasted (massive
display heading next to small tabular body). Color is utilitarian —
black, off-white, single signal color (red, amber, terminal green).
Analog effects (printer-bleed, halftone, screenprint registration
errors) add character without becoming kitsch. Best for: dev tools,
declassified-data presentations, raw-fact dashboards, technical
portfolios.`,
      },
    ],
  },

  // ── gpt-tasteskill ─────────────────────────────────────────────
  {
    id: "gpt-tasteskill",
    audience: "consumer",
    name: "GPT taste — editorial + advanced GSAP motion",
    whenToUse:
      "Long-scroll marketing pages with cinematic scroll choreography. Pins, stacks, scrubbed timelines. AIDA structure. Wide editorial typography. Bans 6-line wraps. Gapless bento grids.",
    source: "Leonxlnx/taste-skill/gpt-tasteskill",
    sections: [
      {
        id: "principles",
        title: "GSAP motion + AIDA structure",
        tagline:
          "Python-driven layout randomization, strict ScrollTrigger choreography, wide editorial typography.",
        body: `AIDA (Attention/Interest/Desire/Action) page spine. Wide editorial
typography — bans 6-line wraps (line lengths cap at ~5). Gapless bento
grids (cards flush against each other, no gutter — outline borders
do the separation). Inline micro-images (small contextual photos
within a section, not just hero). Massive section spacing (180-240px
between sections, not 80). GSAP ScrollTriggers: pinning (section
locks while sub-content scrolls), stacking (next section slides
over current), scrubbing (animation tied to scroll progress).`,
      },
    ],
  },

  // ── redesign ───────────────────────────────────────────────────
  {
    id: "redesign",
    audience: "both",
    name: "Redesign — audit + upgrade existing UI",
    whenToUse:
      "Working on an existing project (not greenfield). Find generic patterns, weak points, missing states. Apply fixes in priority order — font swap first, palette cleanup second, etc.",
    source: "Leonxlnx/taste-skill/redesign-skill + redesign-audit.ts",
    sections: [
      {
        id: "fix-priority",
        title: "Fix priority order",
        tagline:
          "Font → palette → states → layout → components → loading/empty/error → typography polish.",
        body: `Apply in THIS order for max visual impact at min risk:

1. FONT SWAP — biggest instant improvement, lowest risk.
2. COLOR PALETTE CLEANUP — remove clashing / oversaturated colors.
3. HOVER + ACTIVE STATES — makes interface feel alive.
4. LAYOUT + SPACING — proper grid, max-width, consistent padding.
5. REPLACE GENERIC COMPONENTS — cliche → modern alternatives.
6. LOADING / EMPTY / ERROR STATES — makes it feel finished.
7. TYPOGRAPHY SCALE + SPACING POLISH — premium final touch.

Rules: work with existing stack, don't migrate frameworks, don't break
functionality, test after every change. Small targeted improvements
over big rewrites.`,
      },
      {
        id: "audit-checklist",
        title: "Audit checklist (8 categories)",
        tagline:
          "Typography / color / layout / interactivity / content / components / iconography / code / omissions.",
        body: `See redesign-audit.ts (50+ checks). Common findings:

TYPOGRAPHY: Inter everywhere, weak headlines, full-width paragraphs,
only 400/700 weights, proportional numbers in data, Title Case On
Every Header.
COLOR: pure #000, oversaturated accents, multiple competing accents,
purple/blue AI gradient, generic black shadows, empty flat sections.
LAYOUT: 3-equal-card columns (most generic AI pattern), height:100vh
iOS jump, no max-width container, dashboard always left sidebar.
INTERACTIVITY: no hover, no active feedback, no focus ring, generic
spinners, no empty states, alert() for errors, dead links.
CONTENT: John Doe / Acme / Lorem Ipsum, AI clichés, exclamation marks
in success, passive voice errors.
OMISSIONS: no legal links, no back nav, no 404, no form validation,
no skip-to-content.`,
      },
    ],
  },

  // ── output (full-output enforcement) ───────────────────────────
  {
    id: "output",
    audience: "both",
    name: "Full-output enforcement",
    whenToUse:
      "Always. Bans the // ... / // TODO / 'I'll leave this as an exercise' patterns. Treat every task as production-critical.",
    source: "Leonxlnx/taste-skill/output-skill + output-quality.ts",
    sections: [
      {
        id: "banned",
        title: "Banned patterns",
        tagline: "// ... / // TODO / 'for brevity' / 'rest follows pattern' — HARD FAILURES.",
        body: `In code: // ..., // rest of code, // implement here, // TODO,
/* ... */, // similar to above, // continue pattern, // add more
as needed, bare ... standing for omitted code.

In prose: "Let me know if you want me to continue", "for brevity",
"the rest follows the same pattern", "similarly for the remaining",
"and so on" (replacing actual content), "I'll leave that as an
exercise".

Structural: skeleton when full implementation was requested, first +
last section skipping middle, describing what code should do instead
of writing it.`,
      },
      {
        id: "long-output-protocol",
        title: "Long-output protocol",
        tagline: "Write at full quality to clean breakpoint, then [PAUSED] marker, never compress.",
        body: `When response approaches token limit:
- Do NOT compress remaining sections.
- Write at FULL QUALITY up to clean breakpoint (end of function /
  file / section).
- End with: [PAUSED — X of Y complete. Send "continue" to resume
  from: <section name>]
- On "continue": pick up EXACTLY where stopped. No recap, no
  repetition.`,
      },
    ],
  },

  // ── brandkit ───────────────────────────────────────────────────
  {
    id: "brandkit",
    audience: "consumer",
    name: "Brandkit — identity guidelines boards",
    whenToUse:
      "Designing a brand identity board first (before screens). Logo system, color palette, typography lockup, icon system, photography direction, brand voice.",
    source: "Leonxlnx/taste-skill/brandkit",
    sections: [
      {
        id: "principles",
        title: "Brandkit principles",
        tagline:
          "Premium brand-guidelines boards — minimalist / cinematic / editorial / dark-tech / luxury / cultural variants.",
        body: `Compositions for brand identity decks. Minimalist (workspace),
cinematic (entertainment), editorial (publishing), dark-tech (SaaS),
luxury (lifestyle), cultural (heritage), security (defense / fintech),
gaming, developer-tool, consumer-app. Logo concepts with intentional
symbolic meaning. Refined composition (asymmetric grid, generous
breathing). Sparse typography. Premium mockups. Art-directed
imagery. Flexible grid layouts.`,
      },
    ],
  },

  // ── stitch ─────────────────────────────────────────────────────
  {
    id: "stitch",
    audience: "consumer",
    name: "Stitch — semantic DESIGN.md for Google Stitch",
    whenToUse:
      "Pairing with Google Stitch (or similar AI UI generator). Generate DESIGN.md files that enforce premium standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion.",
    source: "Leonxlnx/taste-skill/stitch-skill",
    sections: [
      {
        id: "principles",
        title: "Stitch DESIGN.md principles",
        tagline:
          "Agent-friendly design specs — strict type, calibrated color, asymmetric layout, micro-motion, hardware acceleration.",
        body: `DESIGN.md = instruction set for downstream AI UI generators.
Enforces: strict typography (no Inter, specific fonts named),
calibrated color (specific hex, not "blue"), asymmetric layouts
(specific grid template strings), perpetual micro-motion (specific
timing functions), hardware-accelerated performance (transform/
opacity only). Output is consumable by AI agents — explicit beats
expressive.`,
      },
    ],
  },

  // ── imagegen-mobile ────────────────────────────────────────────
  {
    id: "imagegen-mobile",
    audience: "consumer",
    name: "Imagegen mobile — app screen reference images",
    whenToUse:
      "Pre-code phase. Generate mobile screen mockups before implementing. Onboarding flows, auth, home dashboards, profile, settings, chat, ecommerce, fintech, health, productivity.",
    source: "Leonxlnx/taste-skill/imagegen-frontend-mobile",
    sections: [
      {
        id: "principles",
        title: "Mobile image direction principles",
        tagline:
          "App-native, premium, readable, flow-aware, platform-aware. Wrap in subtle premium phone mockup. Multi-screen consistency.",
        body: `Generate premium app-native mobile screen images + flow images
(NOT generic AI mockups, NOT phone-shaped websites). Default mockup
presence: subtle premium iPhone frame with visible chrome, focus
stays on app content. Generate 3-5 screens per flow (onboarding,
auth, home, detail, settings). Logical flow (each screen continues
the user's task). First-screen cleanliness (don't dump every feature
on the entry screen). Safe-area awareness (status bar + home
indicator preserved). Mobile anti-tells: no purple-blue fintech
gradients, no random glass cards, no ambient blobs, no fake neon, no
dribbble floating widgets, no oversized corner radii on everything,
no rainbow chip walls, no fake chart dashboard spam, no cloned
screens in flows.`,
      },
    ],
  },

  // ── imagegen-web ───────────────────────────────────────────────
  {
    id: "imagegen-web",
    audience: "consumer",
    name: "Imagegen web — landing page section images",
    whenToUse:
      "Pre-code phase for landing / marketing sites. Generate ONE image per section (8 sections → 8 images). Hero composition variety (NOT always left-text/right-image).",
    source: "Leonxlnx/taste-skill/imagegen-frontend-web",
    sections: [
      {
        id: "hard-output-rule",
        title: "Hard output rule — one image per section",
        tagline: "8 sections requested → 8 separate images. NEVER combine sections.",
        body: `Each image = one section, own image call. NEVER combine multiple
sections into one frame. NEVER return a single tall image with the
whole page. Default to 6 sections if "landing page" with no count.
8 sections for "full website template". Announce each ("Section 1
of 8: Hero", "Section 2 of 8: Trust bar").`,
      },
      {
        id: "hero-composition-bias",
        title: "Hero composition variety",
        tagline:
          "Left-text / right-image hero is the most overused AI pattern. Pick from 10 alternatives first.",
        body: `Before reaching for left-text/right-image hero, consider:
- centered over background image
- bottom-left over image
- bottom-right over image
- top-left lead
- stacked center
- image-as-canvas
- off-grid editorial
- mini minimalist
- right-text / left-image (inverted classic)
Use left-text/right-image ONLY when genuinely the strongest choice
for the brand.`,
      },
    ],
  },

  // ── image-to-code ──────────────────────────────────────────────
  {
    id: "image-to-code",
    audience: "consumer",
    name: "Image-to-code — generate design first, then implement",
    whenToUse:
      "Visual-first brief in Codex. First generate the design image yourself, deeply analyze, THEN implement code matching it.",
    source: "Leonxlnx/taste-skill/image-to-code-skill",
    sections: [
      {
        id: "workflow",
        title: "Image-to-code workflow",
        tagline:
          "Generate design image → analyze → implement. Prefer large readable section-specific images.",
        body: `Workflow:
1. Generate the design image FIRST (one per section, large + readable).
2. Deeply analyze: composition, hierarchy, palette, typography, motion.
3. Implement React/HTML/CSS matching as closely as possible.

Prefer LARGE, readable, section-specific images over tiny compressed
boards. Generate fresh standalone images for sections / detail views
instead of cropping old. Avoid lazy under-generation. Avoid cards-
inside-cards-inside-cards UI. Keep the hero clean, spacious, readable,
visible on a small laptop.`,
      },
    ],
  },

  // ── component discipline (hard contract) ───────────────────────
  {
    id: "component-discipline",
    audience: "core",
    name: "Component discipline — international standards (hard contract)",
    whenToUse:
      "MANDATORY before creating or changing ANY @godxjp/ui component, recipe, doc, or example. Enforces real primitives only, no duplication, i18n (Intl/CLDR/ISO/IANA/BCP-47), WAI-ARIA APG + WCAG 2.2 AA, RTL, and the controlled-vocabulary API.",
    source: "@godxjp/ui .claude/skills/godxjp-ui-component + international-standardization audit",
    sections: [
      {
        id: "real-primitives",
        title: "Real primitives only — never invent / fake / raw HTML",
        tagline: "Compose installable @godxjp/ui only; no hand-rolled wrappers, no raw controls.",
        body: `NEVER invent/hand-roll a component, fake the design with styled <div>s, or use raw
<input>/<select>/<button>/<textarea>/<table>. Use Select, Input, Button, Textarea, DataTable,
Checkbox, RadioGroup, Switch. Compose fully: CardContent for padding; a table = Card +
CardContent flush + DataTable in a default padded PageContainer (NOT variant="flush").
MCP-first: get_component before writing; never guess a prop. No duplication — Select
(showSearch/loadOptions) is the only searchable/async select; there is no Combobox/SearchSelect/
CountrySelect/Autocomplete; the 4 i18n pickers are one AppSettingPicker kind=…`,
      },
      {
        id: "i18n-intl",
        title: "i18n via t() + Intl/CLDR",
        tagline: "Every string + aria-label through t(); format via Intl with the active locale.",
        body: `Zero hardcoded English/Japanese. Numbers/currency (ISO 4217, minor units from
resolvedOptions) + bytes via Intl.NumberFormat; dates via the date subsystem (Intl.DateTimeFormat,
IANA tz, ISO-8601); names via Intl.DisplayNames (countries ISO 3166-1 alpha-2, languages BCP-47);
plurals via Intl.PluralRules category maps. No emoji flags. No hand-maintained currency/country
lists.`,
      },
      {
        id: "a11y-apg",
        title: "WAI-ARIA APG + WCAG 2.2 AA",
        tagline: "Correct roles/aria/keyboard/focus + a vitest-axe test (0 violations).",
        body: `Implement the APG pattern: role/landmark, aria-current/expanded/selected/sort/busy +
aria-live/activedescendant, aria-errormessage+aria-invalid. Keyboard: roving tabindex, arrows,
Home/End, Enter/Space, Esc, visible focus, no positive tabindex. ≥24px targets (2.5.8); never
colour-only state (1.4.1 — add sr-only text); icon-only buttons need a name. Add a *.a11y.test.tsx
with expectNoA11yViolations. Prefer Radix/cmdk/vaul for ARIA.`,
      },
      {
        id: "rtl-vocab",
        title: "RTL + controlled-vocabulary API",
        tagline: "Logical CSS only; value/defaultValue/onValueChange; size md not default.",
        body: `RTL: logical CSS only (ms/me/ps/pe, start/end, border-s/e, rounded-s/e, text-start/end)
— never physical ml/mr/pl/pr/left/right. API: controlled triad value/defaultValue/onValueChange
(open/onOpenChange; checked/onCheckedChange; pressed/onPressedChange); size ∈ xs|sm|md|lg (never
"default"); positive booleans; tone for status; forward ref + ...props + className + id; export
XProp + XProp as XProps and register in props/registry. Then: add an MCP catalog entry + a
real-screen docs page; verify typecheck/lint/audit/check:*/preview:build/test all green.`,
      },
      {
        id: "report-bug",
        title: "Found a library-level defect → file a gh issue (never paper over it)",
        tagline:
          "A missing token / wrong vocab / broken a11y in the system is a bug to report, not to work around.",
        body: `If satisfying this contract is blocked by @godxjp/ui itself — a token tier that
doesn't exist, a primitive missing the controlled-vocabulary prop, a Radix wiring with a
real a11y bug, a catalog example that's wrong — the contract says STOP and fix the SYSTEM,
not the call site. Don't bake a one-off around it. If you can fix the library in this repo,
do. If you can't (or you're a consumer agent without write access), open a detailed GitHub
issue: use the draft_bug_report MCP tool to produce the issue body + a 'gh issue create
--repo godx-jp/godxjp-ui …' command, linking the component (get_component) and the cardinal
rule (get_rule) involved, with a minimal repro, expected vs actual, version, and env.`,
      },
    ],
  },

  // ── design-to-page (consumer: handoff → real page) ─────────────
  {
    id: "design-to-page",
    audience: "consumer",
    name: "Design handoff → real page (consumer build guide)",
    whenToUse:
      "You (a consumer agent) received a Claude Design handoff — a bundle/mock/screenshot/HTML prototype or a written brief — and must build it as a REAL page with @godxjp/ui. Read this BEFORE writing any JSX. It teaches: read intent, map every block to a real primitive via this MCP, consume existing tokens, apply the dxs-kintai DNA, treat tables as the centerpiece, resolve gaps by extend-or-ask, and verify.",
    source:
      "@godxjp/ui .design/research (chats-intent, tables, atomic-components) + dxs-kintai SKILL/colors_and_type.css",
    sections: [
      {
        id: "read-intent",
        title: "Read the intent — chats before pixels",
        tagline: "A handoff is a prototype, not production code. Build the intent, not the markup.",
        body: `A Claude Design bundle is HTML/CSS/JS to LOOK AT — never transcribe its DOM.
If the bundle has chats/*.md, read them FIRST: they hold what the user actually
wanted after iterating, the directions rejected, and the explicit rules. The final
HTML is just the last output; the chat is the intent. Then read the README/SKILL +
colors_and_type.css for the DNA. Distil each screen to ONE primary question it
answers (one-intent-per-screen) before choosing components. Honesty rules that
recur in this DNA: render only VALID actions (no disabled-button noise — a punch
card off-state shows Check-In only, never a greyed Check-Out); label = identity
(never changes), helper row = state (error/help goes BELOW, never recolours the
label); entry-point affordances live in chrome, not floating in content.`,
      },
      {
        id: "map-to-primitives",
        title: "Map every block to a real primitive — MCP-first, never hand-roll",
        tagline:
          "For each visual block ask 'which @godxjp/ui component is this?' — list_primitives, then get_component.",
        body: `NEVER hand-roll a styled <div> that looks like a Card, or use raw
<input>/<select>/<button>/<table>. Decompose each screen into a shopping list and
resolve each item through THIS MCP: list_primitives to discover, get_component to
confirm the exact prop/union before you write (never guess a prop). Typical map:
page chrome → AppShell/Sidebar/Topbar/PageContainer; stat row → ResponsiveGrid +
StatCard; data grid → DataTable; status pill → Badge tone=…; filter row → Form
inline + Select/Input; org→branch → Cascader/TreeSelect; date/time → DatePicker/
TimePicker; ⌘K → Command; bulk drawer/detail → Drawer/Sheet/Dialog; split list+
detail → SplitPane/Resizable; empty → EmptyState; confirm → AlertDialog; toast →
Sonner. No duplication: Select (showSearch/loadOptions) is the ONLY searchable/
async select (no Combobox/Autocomplete); the 4 i18n pickers are one AppSettingPicker
kind=…. A table = Card + CardContent-flush + DataTable (not PageContainer flush).`,
      },
      {
        id: "tokens-exist",
        title: "Tokens already exist — consume var(--…), never redeclare",
        tagline: "The design's colors_and_type.css is already implemented as foundation.css.",
        body: `The handoff's colors_and_type.css (SmartHR blue, wa-iro, M PLUS 2, the
density scale) is ALREADY shipped as @godxjp/ui's foundation tokens. Never paste a
hex, never redeclare a token, never invent a neutral. Consume var(--…) and the
semantic utilities. Use get_tokens (MCP) to find the right name — if a token seems
missing it almost certainly exists under a different name. Soft tints come from
color-mix(in oklch, var(--primary) 15%, transparent), NOT a new pale hex. Control
heights come from the density scale (xs 24 / sm 28 / default 32 / lg 36 / xl 44),
never a literal px. Radii: card 6px, control 4px, inner pill 2px.`,
      },
      {
        id: "dna",
        title: "Apply the dxs-kintai DNA",
        tagline:
          "渋み / 間 / 簡素 — fixed color signaling, dense, small headings, 14/1.7, no emoji.",
        body: `These rules survive when you drop the prototype's divs:
• 渋み (restraint): primary chroma ≤ 0.18 — --primary is the single most-important
  action + brand surfaces ONLY, never status. No gradients, no pill cards, no
  saturated brand.
• 間 (breathing): body 14px / 1.7 (NEVER 16/1.5); tabular-nums on every numeric
  column/stat so digits align under 1.7 leading.
• 簡素 (simplicity): three weights only — 400/500/700 (no 300, no 600). Headings
  stay SMALL: h1 = 20px, h2 = 18 (not 32) — JP enterprise is dense, big headings
  waste 間.
• Color signaling is FIXED-mapping: success 若竹 · warning 山吹(yellow) · info 群青
  · attention 朱(orange — PREFER over red for non-destructive: 遅刻/lateness) ·
  danger 茜(destructive only). Wa-iro is decorative (charts/tags/tenant) — NEVER
  remap a wa-iro hue to a semantic role.
• Density up front: compact 28 (heavy tables) · default 32 · comfortable 44 (login/
  mobile, 44px touch floor). Set on the container; don't mix mid-page.
• Cards: 1px border, NO shadow at rest (shadows only on popover md / dialog xl).
• Copy quiet & factual — 「承認しました」 not 「承認に成功しました🎉」. Empty state =
  one calm sentence, no illustration. NO emoji in product UI; Lucide 1.5px icons,
  currentColor, sized by context (14 table / 16 nav / 18 button / 20 header).
• Multi-tenant: tenants override only --primary/--ring/--foreground; semantic
  colors stay shared (a "rejected" badge means the same everywhere).`,
      },
      {
        id: "tables-central",
        title: "Tables are the centerpiece — DataTable + the variant catalogue",
        tagline: "Enterprise 勤怠/admin lives in tables; showcase the family broadly.",
        body: `Most of this DNA's real value is in tables — make DataTable the
centerpiece. One shell: Card + CardContent-flush wrapping DataTable (1px border,
6px radius, no shadow). Region order: view tabs · toolbar (search + ⌘K + density +
columns + import/export + primary CTA) · active-filter chip bar · table · footer
totals · pagination — every region optional. Build each pattern as its own block:
assembled CRUD list · bulk-action toolbar (selection REPLACES toolbar; cross-page
"select all 1,284"; destructive isolated last) · column manager · advanced filter
AND/OR · sort/resize · expandable detail row · inline editable row (row-level
commit, dirty dot, "未保存" footer) · grouped rows w/ subtotals · tree rows · sticky
columns + horizontal scroll · pagination ×3 (numbered/load-more/cursor) · import/
export stepper · empty/loading(Skeleton)/error/no-perm states · footer totals ·
compact kintone grid · conditional row/cell formatting. Cells: status → Badge tone;
identity → Avatar + two-line; numerics right-aligned tabular-nums with — for null;
IDs mono. Confirmed (確定済) rows are frozen — no edit, no destructive bulk. Row
states change only background via color-mix, never height/padding. get_component
DataTable + get_vocab ColumnDef/TableDensity/SortState before you build.`,
      },
      {
        id: "gaps-extend-or-ask",
        title: "Gaps → extend or ask — never invent",
        tagline: "A block no primitive expresses is a decision, not a hand-roll.",
        body: `When a block has no clean primitive/prop/variant, do NOT bake a bespoke
one-off into the page. First try to EXTEND: can an existing component take one more
tone/size/variant/slot, or be composed from existing primitives (e.g. a punch-card
FSM, a mobile selection-bar, an i18n locale-field are compositions over Button/Card/
Badge/Tabs/Input, not new primitives)? If it's a genuine gap or you're unsure, STOP
and ASK the user (or surface it as an ADR/decision) — name the gap, propose
"new variant on <X> vs. app-level composition vs. new component", and converge
before building. Known gaps to expect in this DNA (ask rather than invent): three-
level table density (current is binary), multi-sort priority badges, column resize/
manager, numbered/load-more pagination, expandable/editable/grouped/tree/sticky-col
table modes, filter chip bar + AND/OR panel, saved-view tabs, week-timeline/staff×
time calendar, multilingual-field, no-code builders. Never silently fill a gap.`,
      },
      {
        id: "verify",
        title: "Verify — states complete, a11y, build green",
        tagline:
          "Every state shown, WCAG 2.2 AA, typecheck/lint/audit clean, eyeballed at 3 widths.",
        body: `Before calling it done: every prop × union value × state is exercised
(default/hover/focus/active/disabled/loading/empty/error) — Skeleton for INIT fetch,
spinner/loading for active save, EmptyState for no-data, inline error near the field
(not a disappearing toast). A11y: correct roles/landmarks, keyboard (arrows/Home/End/
Enter/Esc, visible focus, no positive tabindex), ≥24px targets, never colour-only
state (add sr-only text), icon-only buttons have a name; aim for 0 vitest-axe
violations. i18n: zero hardcoded strings — every label + aria-label through t(),
format numbers/dates via Intl. Then run the build: pnpm typecheck + pnpm lint +
pnpm audit must be green, console clean, and eyeball the page at 390 / 768 / 1280
(atoms never wrap, containers wrap with row-gap, tabs horizontal-scroll, grids
minmax(0,1fr), heights never break).`,
      },
      {
        id: "report-bug",
        title: "godx-ui bug / can't-follow-a-rule → file a gh issue (never fake it)",
        tagline:
          "If the LIBRARY is wrong, report it — don't hand-roll a workaround that hides the bug.",
        body: `When you CANNOT satisfy a rule because @godxjp/ui itself is at fault — a
primitive doesn't expose the controlled-vocabulary prop you need, a token is
missing, a component has a real a11y/behaviour bug, an example in the catalog is
wrong — the rule is: DO NOT silently hand-roll/fake a replacement to dodge it (that
just buries a library bug inside every app). Instead:
• DON'T: copy a primitive's internals into your app, swap in a raw <input>/<div>, or
  redeclare a token to route around the defect.
• DO: open a detailed GitHub issue against the library, then apply the SMALLEST
  possible local workaround marked // TODO(godxui#<n>: <summary>) so it's grep-able
  and removed once fixed.
• Use the MCP tool draft_bug_report to generate the issue body + a copy-paste
  'gh issue create --repo godx-jp/godxjp-ui …' command. Include: the component/rule
  (link via get_component/get_rule), a minimal repro, expected vs actual, the
  installed @godxjp/ui version, and your env. A vague "X is broken" issue is not
  enough — the report must let a maintainer reproduce in one paste.`,
      },
    ],
  },

  // ── compose-a-screen (consumer: primitives → a finished screen) ──
  {
    id: "compose-a-screen",
    audience: "consumer",
    name: "Compose a screen — primitives → a finished app view (consumer)",
    whenToUse:
      "You (a consumer agent) are building a NEW screen/page in an app that imports @godxjp/ui — from a written brief or product requirement, not a design handoff. Read this to assemble it from real primitives via this MCP: pick the right components, lay out one-intent-per-screen, wire every state + a11y + i18n, and verify. For a Claude Design handoff bundle/mock specifically, use design-to-page instead.",
    source:
      "@godxjp/ui MCP (consumer surface) — taste/one-intent + component-discipline + dxs-kintai DNA",
    sections: [
      {
        id: "pick-primitives",
        title: "Pick primitives via the MCP — never hand-roll, never guess a prop",
        tagline:
          "Decompose the screen into a shopping list; resolve each item with list_primitives → get_component.",
        body: `Start from the requirement, not the markup. Write a shopping list of every
block the screen needs, then resolve each through THIS MCP before writing JSX:
list_primitives (discover the group), get_component <Name> (confirm the exact
prop/union/default — never guess), suggest_primitive / search_components when unsure
which fits. Hard rules: compose ONLY real @godxjp/ui primitives — no styled <div>
faking a Card, no raw <input>/<select>/<button>/<textarea>/<table>. No duplication:
Select (showSearch/loadOptions) is the ONLY searchable/async select (there is no
Combobox/Autocomplete/CountrySelect); the 4 i18n pickers are one AppSettingPicker
kind=…. A table = Card + CardContent-flush + DataTable. If a block has no clean
primitive, see gaps handling in design-to-page/gaps-extend-or-ask + report-bug.`,
      },
      {
        id: "assemble-screen",
        title: "Assemble it — one intent per screen, real chrome, fixed signaling",
        tagline:
          "One primary question per page; AppShell/PageContainer chrome; --primary once; semantic color is fixed.",
        body: `Distil the screen to ONE primary question it answers (one-intent-per-screen):
1–2 hero facts + ONE primary list/form + contextual actions; push tertiary content to
a Sheet/Dialog/next page. An 8-stat-card wall is a red flag. Use real page chrome
(AppShell/Sidebar/Topbar/PageContainer) — content never touches the viewport edge,
two bordered surfaces never touch (間/breathing via Stack gap). PageContainer is
top-packed by default: a short page on a tall viewport leaves NO stretched void
(the page background just spans the shell) — never add min-h-screen / flex-1 / a
spacer div to fight it. Reach for PageContainer fill ONLY when the body must own
the full height: a full-height DataTable, a SplitPane, or a chat surface whose
composer is pinned to the bottom via footer + stickyFooter. Exactly ONE --primary
action per view; status uses the FIXED semantic mapping (success/warning/info/
attention/danger) — never recolor a wa-iro hue into a role, never use --primary for
status. Pick density up front (compact 28 heavy-table / default 32 / comfortable 44
login-mobile) and don't mix it mid-page. Hierarchy from type weight+size+color
(20/18/14/13 × 400/500/700), not colored background blocks. Mobile-first: default one
column, add columns only at md:/lg: when each keeps ≥14px body at ≥~280px width.`,
      },
      {
        id: "state-and-a11y",
        title: "Wire every state + a11y + i18n (the part that gets skipped)",
        tagline:
          "default/hover/focus/active/disabled/loading/empty/error all handled; APG keyboard; t() everything.",
        body: `A screen isn't done at the happy path. Handle every state: Skeleton for INIT
fetch (no data yet), Form loading / Spinner for active save (data present), EmptyState
for no-data (one calm sentence, no illustration), inline error near the field via
FormField (NOT a disappearing toast). Forms: explicit label + help + error always —
never placeholder-as-label. A11y (WAI-ARIA APG + WCAG 2.2 AA): correct roles/landmarks,
keyboard (arrows/Home/End/Enter/Esc, visible focus, no positive tabindex, return focus
on close), ≥24px targets, never colour-only state (add sr-only text), icon-only buttons
need a name. i18n: zero hardcoded strings — every label + aria-label through t();
numbers/currency/dates via Intl with the active locale (ISO 4217/8601, IANA tz),
plurals via Intl.PluralRules. State-truthful affordances: a parent checkbox aggregates
its children (checked/indeterminate/empty); a held value is visible when a control
opens; controlled inputs mirror type↔click both ways (a controlled value with no
synchronous onValueChange FREEZES the input).`,
      },
      {
        id: "verify",
        title: "Verify — states shown, console clean, build green, 3 widths",
        tagline:
          "Drive every interactive control; 0 console errors/warnings; typecheck/lint green; eyeball 390/768/1280.",
        body: `Before calling the screen done: drive EVERY interactive control to its
terminal state in a real browser (don't infer behaviour from source) and read the
DevTools console — a <button>-in-<button>/hydration/act()/404 warning is a FINDING,
not noise. Confirm: every prop × union × state is exercised; held values visible on
open; multi-step selections (date range, capped multi-select) can be restarted from a
complete state, not trapped; controlled mirrors update both directions. Run the app's
build: typecheck + lint clean, console clean, and eyeball at 390 / 768 / 1280 (atoms
never wrap, containers wrap with row-gap, natural-width components stay w-fit, no
decorative edge fades, no dead grey panes). If a failure traces to @godxjp/ui itself,
do not fake around it — see report-bug.`,
      },
      {
        id: "report-bug",
        title: "godx-ui bug / can't-follow-a-rule → file a gh issue (never fake it)",
        tagline:
          "If the LIBRARY is wrong, report it — don't hand-roll a workaround that hides the bug.",
        body: `Same contract as design-to-page/report-bug: when a rule is impossible because
@godxjp/ui is at fault (missing token, a primitive without the controlled-vocabulary
prop, a real a11y/behaviour bug, a wrong catalog example) — DO NOT silently fake a
replacement. DON'T copy primitive internals, drop to raw HTML, or redeclare a token to
dodge it. DO open a detailed GitHub issue (use the draft_bug_report MCP tool to build
the body + the 'gh issue create --repo godx-jp/godxjp-ui …' command), then apply the
smallest local workaround tagged // TODO(godxui#<n>: <summary>). The issue must carry a
minimal repro, expected vs actual, the installed version, and env — enough to
reproduce in one paste.`,
      },
    ],
  },

  // ── app-performance (consumer) ─────────────────────────────────
  {
    id: "app-performance",
    audience: "consumer",
    name: "App performance — measure-first React perf with @godxjp/ui",
    whenToUse:
      "A screen built on @godxjp/ui feels slow, Chrome logs [Violation] handler warnings, typing lags in a filter pane, a panel toggle blocks, or the bundle is questioned. Distilled from a real audit (orders screen: keystroke 165ms → 5ms, panel open 270ms → 18ms, app bundle −27%). Measure FIRST — the library's per-control cost is small (~3ms/field dev); page architecture is almost always the culprit.",
    source: "@godxjp/ui MCP (consumer surface) — 2026-06 exseli audit, verified numbers",
    sections: [
      {
        id: "measure-first",
        title: "Measure before touching anything",
        tagline: "Long tasks + a temporary React Profiler tell you WHO is slow — never guess.",
        body: `Three probes, run in the page (devtools console / playwright evaluate):
1) Long tasks — anything >50ms in a handler triggers Chrome's [Violation]:
   const t=[]; new PerformanceObserver(l=>l.getEntries().forEach(e=>t.push(Math.round(e.duration))))
     .observe({type:"longtask",buffered:true});
2) Attribution — wrap suspect sections temporarily:
   <Profiler id="sec" onRender={(id,phase,d)=>(window.__perf??=[]).push([id,phase,Math.round(d)])}>
   Compare each section's actualDuration against the total long task. In the reference audit
   25 @godxjp/ui composite fields mounted in 79ms — the other ~150ms was the PAGE re-rendering
   everything else. Indict with numbers, then fix only what they indict.
3) Dev-mode caveat: development React is 3–5× slower; a one-off 60ms task at popup-open is
   normal. Re-measure AFTER the fix with the same probes and paste before/after numbers.`,
      },
      {
        id: "filter-pane-memo",
        title: "Filter panes: per-field memo + stable setters",
        tagline: "Page-root state with no memo boundaries = the whole pane re-renders per keystroke.",
        body: `The classic failure: all search state lives at the page root, every field reads it
inline → one keystroke re-renders ~30 fields + the results table (165ms/key measured).
The proven fix shape:
- module-level memo field units: const FText = memo(function FText({ id, label, k, value, onSet }) {
    return <FormField id={id} label={label}><Input id={id} value={value}
      onChange={(e) => onSet(k, e.target.value)} /></FormField>; });
- ONE stable setter per state map: const setField = useCallback((key, value) =>
    setCond(c => ({ ...c, [key]: value })), []);
- the results table in its OWN memo component; pagination pages WITHIN the submitted query
  (setSubmitted(prev => ({ ...prev, page }))) so its handler stays identity-stable.
After: a keystroke re-renders exactly one field (5ms). Don't memo cheap leaves that re-render
rarely — over-memoization is real overhead. react-compiler lint traps: no ref writes during
render, no sync setState in effect bodies; the sanctioned latch is the guarded render-time set
(if (cond && !state) setState(true)).`,
      },
      {
        id: "heavy-panels",
        title: "Heavy hidden panels: defer, keep mounted, pre-mount at idle",
        tagline: "Never mount a 25-field subtree synchronously inside a click handler.",
        body: `A 詳細条件-style toggle that conditionally renders a large subtree blocks the click
(~230ms measured). Three-layer fix, in order:
1) urgent state drives only the button chrome (chevron/aria-expanded);
2) const deferredOpen = useDeferredValue(open) gates the FIRST mount into a deferred lane;
3) keep it mounted afterwards and toggle visibility: <div className={open ? "contents" : "hidden"}>
   ("contents" keeps children in the parent flex/grid rhythm; field state lives in the page so
   hiding loses nothing);
4) optionally pre-mount during idle after first paint so even the FIRST open is instant:
   useEffect(() => { const idle = window.requestIdleCallback ?? (cb => setTimeout(cb, 300));
     const h = idle(() => setMounted(true)); return () => (window.cancelIdleCallback ?? clearTimeout)(h); }, []);
Measured after: open 270ms → 18ms, zero post-load long tasks.`,
      },
      {
        id: "bundle-budget",
        title: "Code splitting + what an import costs",
        tagline: "lazy() every page; know the per-import budget before blaming the library.",
        body: `Route-level splitting is the default app shape: const Page = lazy(() => import("@/pages/Page"))
behind ONE <Suspense fallback={<PageContainer title={<Skeleton …/>}><Skeleton …/></PageContainer>}>.
Reference app: initial 929KB → 675KB; the orders screen (day-picker + table stack, 122KB) and
login (react-hook-form + zod, 93KB) load only when visited.
Per-import minified budget of @godxjp/ui ≥13.10.0 (preserved-module dist — imports tree-shake
for real): StatCard 30KB · Input 52 · Button 56 · DataTable 79 · Select 165 · DateRangePicker 207
(genuinely needs react-day-picker + date-fns). A shared ~50KB floor is intrinsic (tailwind-merge
+ bundled 3-locale i18n) and amortizes across one vendor chunk. Virtualize lists only >100 rows —
DataTable at 50/page does not need it. The dist is bundler-oriented ESM (extensionless + JSON
imports): fine for vite/webpack consumers; when testing against a local checkout run tests on an
npm-pack TARBALL install, not a file: symlink (the symlink's nested node_modules creates a
dual-React artifact under vitest).`,
      },
    ],
  },
];

export function findSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function findSection(skillId: string, sectionId: string): SkillSection | undefined {
  return findSkill(skillId)?.sections.find((s) => s.id === sectionId);
}

/**
 * Naïve task router — keyword match. Replace with embedding-based
 * matcher in v2 if it proves useful.
 */
export interface RouteResult {
  skill: string;
  section: string | "<see whenToUse>";
  why: string;
  alsoSee?: string[];
}

export function routeTask(task: string, opts?: { consumerOnly?: boolean }): RouteResult[] {
  const q = task.toLowerCase();
  const matches: RouteResult[] = [];

  const route = (
    kw: string[],
    skill: string,
    section: string | "<see whenToUse>",
    why: string,
    alsoSee?: string[],
  ) => {
    if (kw.some((k) => q.includes(k))) matches.push({ skill, section, why, alsoSee });
  };

  // Premium / agency / Awwwards
  route(
    ["premium", "awwwards", "agency", "linear", "apple", "high-end", "luxury"],
    "soft",
    "vibe-archetypes",
    "Premium tier — pick a Vibe + Layout archetype + apply Double-Bezel.",
    ["soft/double-bezel", "soft/magnetic-hover"],
  );

  // Marketing / landing
  route(
    ["landing page", "marketing", "hero", "long scroll"],
    "imagegen-web",
    "hero-composition-bias",
    "Landing pages benefit from hero composition variety + per-section image generation.",
    ["gpt-tasteskill/principles", "soft/layout-archetypes"],
  );

  // Mobile app screens
  route(
    ["mobile app", "ios", "android", "phone screen", "onboarding flow"],
    "imagegen-mobile",
    "principles",
    "Mobile app design — generate screens first, avoid phone-shaped-website.",
    ["taste/mobile-first"],
  );

  // Workspace / Notion-like
  route(
    ["workspace", "notion", "document", "editorial", "knowledge base"],
    "minimalist",
    "palette",
    "Editorial workspace = warm monochrome + spot pastels + serif headings.",
    ["minimalist/typography", "minimalist/bento-grids"],
  );

  // Data dashboard
  route(
    ["dashboard", "data heavy", "tabular", "ops table"],
    "brutalist",
    "principles",
    "Data-heavy dashboards work with Brutalist (rigid grids, utilitarian color).",
    ["taste/one-intent-per-screen"],
  );

  // Brand work
  route(
    ["brand", "identity", "logo", "guidelines"],
    "brandkit",
    "principles",
    "Brand identity work — boards before screens.",
  );

  // Existing project upgrade
  route(
    ["refactor", "redesign", "upgrade existing", "audit"],
    "redesign",
    "fix-priority",
    "Existing project = run audit first, fix in priority order (font → palette → states → ...).",
    ["redesign/audit-checklist"],
  );

  // Form work
  route(
    ["form", "validation", "submit", "sign up", "registration"],
    "taste",
    "form-discipline",
    "Form must have explicit label + help + error wired via FormField (rule 34).",
  );

  // Loading / saving
  route(
    ["loading", "saving", "skeleton", "spinner"],
    "taste",
    "loading-states",
    "Skeleton for INIT fetch, Spinner for active work. Never mix.",
  );

  // Mobile-first concerns
  route(
    ["mobile first", "responsive", "breakpoint"],
    "taste",
    "mobile-first",
    "Default styles target xs. Touch targets ≥ 44px. Use useBreakpoint().",
  );

  // Output quality
  route(
    ["complete code", "full implementation", "no placeholder"],
    "output",
    "banned",
    "Banned: // ..., // TODO, 'for brevity'. Ship complete runnable code.",
  );

  // GSAP motion
  route(
    ["gsap", "scrolltrigger", "scroll choreography", "pinning"],
    "gpt-tasteskill",
    "principles",
    "GSAP ScrollTrigger — pinning, stacking, scrubbing.",
  );

  // Image-first / design-first
  route(
    ["from image", "image to code", "design first"],
    "image-to-code",
    "workflow",
    "Generate design image first → analyze → implement.",
  );

  // Design handoff → real page (consumer build)
  route(
    [
      "handoff",
      "design bundle",
      "claude design",
      "prototype",
      "build the page",
      "implement the design",
      "build this screen",
      "mockup",
    ],
    "design-to-page",
    "map-to-primitives",
    "Map every block to a real @godxjp/ui primitive (MCP-first), consume existing tokens, apply the dxs-kintai DNA, tables central, gaps → extend-or-ask, verify.",
    ["design-to-page/read-intent", "design-to-page/dna", "design-to-page/tables-central"],
  );

  // Compose a brand-new screen from a written brief (no design handoff)
  route(
    [
      "compose a screen",
      "new screen",
      "new page",
      "create a page",
      "create a screen",
      "build a view",
      "build a screen",
      "from scratch",
      "screen from a brief",
    ],
    "compose-a-screen",
    "pick-primitives",
    "Build a new app screen from real @godxjp/ui primitives (MCP-first): one-intent-per-screen, real chrome, every state + a11y + i18n, verify.",
    [
      "compose-a-screen/assemble-screen",
      "compose-a-screen/state-and-a11y",
      "taste/one-intent-per-screen",
    ],
  );

  // Reporting a library bug / un-followable rule
  route(
    [
      "bug in godx",
      "godx-ui bug",
      "report a bug",
      "file an issue",
      "gh issue",
      "can't follow the rule",
      "library is broken",
      "primitive is broken",
    ],
    "compose-a-screen",
    "report-bug",
    "If @godxjp/ui itself is at fault, don't fake a workaround — file a detailed gh issue (use draft_bug_report).",
    ["design-to-page/report-bug"],
  );

  // Performance — slow screens, violations, lag, bundle size
  route(
    [
      "slow",
      "performance",
      "perf",
      "violation",
      "long task",
      "lag",
      "janky",
      "re-render",
      "rerender",
      "bundle size",
      "code splitting",
      "tree-shak",
      "chậm",
      "lỗi hiệu năng",
      "重い",
    ],
    "app-performance",
    "measure-first",
    "Measure FIRST (longtask + temporary Profiler), then apply the matching proven fix — page architecture, not the library, is almost always the culprit.",
    ["app-performance/filter-pane-memo", "app-performance/heavy-panels", "app-performance/bundle-budget"],
  );

  // Consumer routing hides core-only skills (e.g. component-discipline) so an
  // app-dev is never pointed at library-maintenance material.
  const filtered = opts?.consumerOnly
    ? matches.filter((m) => {
        const sk = findSkill(m.skill);
        return !sk || sk.audience !== "core";
      })
    : matches;

  if (filtered.length === 0) {
    if (opts?.consumerOnly) {
      return [
        {
          skill: "compose-a-screen",
          section: "pick-primitives",
          why: `No keyword match for "${task}". Default consumer path: compose the screen from real primitives via the MCP.`,
          alsoSee: ["design-to-page/map-to-primitives", "taste/one-intent-per-screen"],
        },
      ];
    }
    return [
      {
        skill: "taste",
        section: "<see whenToUse>",
        why: `No keyword match for "${task}". Default to the "taste" baseline — see whenToUse for sections.`,
      },
    ];
  }

  return filtered;
}
