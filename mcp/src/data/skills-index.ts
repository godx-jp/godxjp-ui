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

export interface Skill {
  id: string;
  name: string;
  /** When to reach for this skill — written so the router can match a task to it. */
  whenToUse: string;
  /** Source attribution. */
  source: string;
  sections: SkillSection[];
}

export const SKILLS: Skill[] = [
  // ── taste (foundational) ───────────────────────────────────────
  {
    id: "taste",
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

  // ── soft (Awwwards / premium agency) ───────────────────────────
  {
    id: "soft",
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

export function routeTask(task: string): RouteResult[] {
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

  if (matches.length === 0) {
    return [
      {
        skill: "taste",
        section: "<see whenToUse>",
        why: `No keyword match for "${task}". Default to the "taste" baseline — see whenToUse for sections.`,
      },
    ];
  }

  return matches;
}
