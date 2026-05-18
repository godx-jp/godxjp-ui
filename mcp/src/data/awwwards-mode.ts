/**
 * Awwwards-tier "high-end visual design" mode — adapted from
 * Leonxlnx/taste-skill `soft-skill` SKILL. The MCP exposes this as
 * an OPTIONAL upgrade tier on top of the @godxjp/ui primitives.
 *
 * When the consumer brief calls for "premium agency-level",
 * "$150k build", "Linear-tier", "Awwwards-style" — apply these
 * archetypes. NOT every project needs this; many SaaS apps do BETTER
 * with the minimalist mode (`minimalism.ts`) or stock framework
 * primitives. Pick the right register for the brief.
 *
 * Mobile collapse is MANDATORY for every layout archetype — see
 * each entry's mobile note.
 */

export const PERSONA = `
You engineer $150k+ agency-level digital experiences — not just
websites. The output must exude:

- haptic depth (Doppelrand / nested architecture)
- cinematic spatial rhythm (macro-whitespace, py-24 to py-40)
- obsessive micro-interactions (Magnetic Button Hover Physics)
- flawless fluid motion (custom cubic-beziers, spring physics)

NEVER generate the exact same layout or aesthetic twice. Combine
Vibe + Layout archetypes dynamically. Always Apple-esque / Linear-
tier in finish.
`;

export const ABSOLUTE_ZERO = `
The "Absolute Zero" Directive — if your code includes ANY of these,
the design INSTANTLY FAILS:

BANNED FONTS:        Inter, Roboto, Arial, Open Sans, Helvetica
                     → Use Geist, Clash Display, PP Editorial New,
                       Plus Jakarta Sans
BANNED ICONS:        Standard thick-stroked Lucide, FontAwesome,
                     Material
                     → Phosphor Light, Remix Line (ultra-light,
                       precise lines)
BANNED BORDERS:      Generic 1px solid gray
                     → Hairline rings (ring-1 ring-black/5), tinted
                       borders, no border at all (whitespace as
                       separator)
BANNED SHADOWS:      shadow-md, rgba(0,0,0,0.3) harsh drops
                     → Ultra-diffuse low-opacity (< 0.05), TINTED
                       to background hue
BANNED LAYOUTS:      Edge-to-edge sticky navbars, symmetric 3-col
                     Bootstrap grids
                     → Floating glass nav pills, asymmetric bento
                       grids with macro whitespace
BANNED MOTION:       linear / ease-in-out / instant
                     → Custom cubic-bezier (e.g. cubic-bezier(0.32,
                       0.72, 0, 1)), spring physics, scroll
                       interpolation
`;

export interface VibeArchetype {
  name: string;
  context: string;
  palette: string;
  typography: string;
  surfaces: string;
}

export const VIBE_ARCHETYPES: VibeArchetype[] = [
  {
    name: "Ethereal Glass",
    context: "SaaS / AI / Tech",
    palette: "Deepest OLED black (#050505) base. Radial mesh gradients in background (subtle glowing purple/emerald orbs). Pure white/10 hairlines on Vantablack cards.",
    typography: "Wide geometric Grotesk (Geist, Plus Jakarta Sans). Heavy hero scale, tight tracking.",
    surfaces: "Vantablack cards (`bg-black/40`) with heavy `backdrop-blur-2xl`. Hairline borders (`border border-white/10`). Inner highlights (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`).",
  },
  {
    name: "Editorial Luxury",
    context: "Lifestyle / Real Estate / Agency",
    palette: "Warm creams (#FDFBF7), muted sage, deep espresso accents.",
    typography: "High-contrast Variable Serif (PP Editorial New, Lyon Text, Newsreader) for massive headings. Tight tracking (-0.03em).",
    surfaces: "Cards float on cream canvas. Subtle CSS noise/film-grain overlay (`opacity-[0.03]`) for physical paper feel.",
  },
  {
    name: "Soft Structuralism",
    context: "Consumer / Health / Portfolio",
    palette: "Silver-grey or completely white backgrounds. Single accent (muted teal, sage, dusty rose).",
    typography: "Massive bold Grotesk (Geist Bold, Clash Display) typography. Display sizes 80-120px.",
    surfaces: "Airy floating components. Unbelievably soft, highly diffused ambient shadows (`shadow-[0_30px_60px_-30px_rgba(0,0,0,0.06)]`).",
  },
];

export interface LayoutArchetype {
  name: string;
  desktop: string;
  mobileCollapse: string;
}

export const LAYOUT_ARCHETYPES: LayoutArchetype[] = [
  {
    name: "Asymmetric Bento",
    desktop:
      "Masonry-like CSS Grid of varying card sizes (`col-span-8 row-span-2` next to stacked `col-span-4` cards). Breaks visual monotony.",
    mobileCollapse:
      "Single-column stack (`grid-cols-1`) with generous vertical gaps (`gap-6`). All `col-span` overrides reset to `col-span-1`.",
  },
  {
    name: "Z-Axis Cascade",
    desktop:
      "Elements stacked like physical cards, slightly overlapping with varying depth. Some with `-2deg` or `3deg` rotation to break the digital grid.",
    mobileCollapse:
      "Remove ALL rotations + negative-margin overlaps below `768px`. Stack vertically with standard spacing. Overlapping = touch-target conflicts on mobile.",
  },
  {
    name: "Editorial Split",
    desktop:
      "Massive typography on left half (`w-1/2`). Interactive scrollable horizontal image pills or staggered cards on right.",
    mobileCollapse:
      "Full-width vertical stack (`w-full`). Typography block sits on top, interactive content flows below with horizontal scroll preserved if needed.",
  },
];

export const MOBILE_OVERRIDE = `
UNIVERSAL MOBILE OVERRIDE — non-negotiable.

Every asymmetric layout above \`md:\` MUST collapse aggressively to
\`w-full\`, \`px-4\`, \`py-8\` on viewports below \`768px\`.

NEVER \`h-screen\` for full-height sections — always \`min-h-[100dvh]\`
to prevent iOS Safari viewport jumping.

Touch targets ≥ 44 × 44 px on mobile — non-negotiable (WCAG 2.5.5).

This applies to ALL Vibe + Layout archetypes. A premium desktop
design that breaks on phone is NOT premium. It's broken.
`;

export interface MicroAesthetic {
  technique: string;
  body: string;
  example?: string;
}

export const MICRO_AESTHETICS: MicroAesthetic[] = [
  {
    technique: "Double-Bezel (Doppelrand / Nested Architecture)",
    body: `Never place a premium card / image / container flatly on the
background. They must look like physical machined hardware — glass
plate sitting in an aluminum tray — using nested enclosures:

- OUTER SHELL: wrapper div with subtle bg (\`bg-black/5\` or
  \`bg-white/5\`), hairline outer border (\`ring-1 ring-black/5\` or
  \`border border-white/10\`), specific padding (e.g. \`p-1.5\` or
  \`p-2\`), large outer radius (\`rounded-[2rem]\`).
- INNER CORE: actual content container inside the shell. Distinct
  background color, inner highlight (\`shadow-[inset_0_1px_1px_
  rgba(255,255,255,0.15)]\`), mathematically calculated SMALLER
  radius (e.g. \`rounded-[calc(2rem-0.375rem)]\`) for concentric
  curves.

The math gives the hardware look — the human eye reads concentric
curves as "machined precision".`,
    example: `<div className="bg-black/5 ring-1 ring-black/5 rounded-[2rem] p-1.5">
  <div className="bg-white rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-8">
    {/* content */}
  </div>
</div>`,
  },
  {
    technique: "Nested CTA / Island Button (Button-in-Button)",
    body: `Primary buttons are fully rounded pills (\`rounded-full\`) with
generous padding (\`px-6 py-3\`). When a button has a trailing
arrow / icon, it NEVER sits naked next to text. It's nested in
its OWN circular wrapper (\`w-8 h-8 rounded-full bg-black/5 flex
items-center justify-center\`) placed flush with the button's
right inner padding.`,
    example: `<button className="rounded-full px-6 py-3 bg-black text-white flex items-center gap-3 group">
  <span>Continue</span>
  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
    <ArrowUpRight size={14} />
  </span>
</button>`,
  },
  {
    technique: "Spatial Rhythm + Tension",
    body: `Double your standard padding. Use \`py-24\` to \`py-40\` for
sections. The design breathes HEAVILY. Premium = whitespace.

Precede major H1/H2s with an EYEBROW TAG: microscopic pill-shaped
badge (\`rounded-full px-3 py-1 text-[10px] uppercase tracking-
[0.2em] font-medium\`). Signals "metadata category, then headline".`,
    example: `<section className="py-32">
  <span className="inline-block rounded-full bg-black/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium">
    What We Do
  </span>
  <h1 className="mt-6 text-6xl font-medium tracking-tight">
    Tools for thought.
  </h1>
</section>`,
  },
  {
    technique: "Fluid Island Nav + Hamburger Reveal",
    body: `Closed state: Navbar = floating glass pill detached from top
(\`mt-6 mx-auto w-max rounded-full\`). On click, hamburger lines
FLUIDLY rotate + translate into a perfect 'X' (\`rotate-45\` +
\`-rotate-45\` with absolute positioning) — not just disappear.

Menu opens as massive screen-filling overlay with heavy glass
(\`backdrop-blur-3xl bg-black/80\` or \`bg-white/80\`). Nav links
inside the overlay FADE IN + SLIDE UP from below
(\`translate-y-12 opacity-0\` → \`translate-y-0 opacity-100\`) with
staggered delays (\`delay-100\`, \`delay-150\`, \`delay-200\`).`,
  },
  {
    technique: "Magnetic Button Hover Physics",
    body: `Use the \`group\` utility. Hover ≠ just background color change.
- Scale entire button DOWN slightly on \`:active\` (\`active:scale-
  [0.98]\`) to simulate physical press.
- Nested inner icon circle translates diagonally (\`group-hover:
  translate-x-1 group-hover:-translate-y-[1px]\`) AND scales up
  (\`scale-105\`) — creates internal kinetic tension.
- Custom cubic-bezier easing on all transitions (NEVER linear / ease-
  in-out).`,
  },
  {
    technique: "Scroll Interpolation (Entry Animations)",
    body: `Elements NEVER appear statically on load. As they enter the
viewport, they execute a gentle heavy fade-up:
\`translate-y-16 blur-md opacity-0\` → \`translate-y-0 blur-0 opacity-
100\` over 800ms+.

For JS-driven reveals: \`IntersectionObserver\` or Framer Motion's
\`whileInView\`. NEVER \`window.addEventListener('scroll')\` — kills
mobile performance.`,
  },
];

export const PERFORMANCE_GUARDRAILS = `
- GPU-SAFE ANIMATION: Animate \`transform\` + \`opacity\` only.
  NEVER \`top\`, \`left\`, \`width\`, \`height\` (triggers layout reflow).
  \`will-change: transform\` sparingly, only on actively animating
  elements.

- BLUR CONSTRAINTS: \`backdrop-blur\` only on FIXED or STICKY elements
  (navbars, overlays). NEVER on scrolling containers or large content
  areas — continuous GPU repaints, severe mobile frame drops.

- GRAIN / NOISE OVERLAYS: Apply to FIXED \`pointer-events-none\`
  pseudo-elements (\`position: fixed; inset: 0; z-index: 50\`).
  NEVER attached to scrolling containers.

- Z-INDEX DISCIPLINE: No arbitrary \`z-50\` or \`z-[9999]\`. Reserve
  z-indexes for systemic layers: sticky nav, modals, overlays,
  tooltips. Define a clean scale.
`;

export const EXECUTION_PROTOCOL = `
1. [SILENT THOUGHT] Roll the Variance Engine. Choose Vibe (Ethereal
   Glass / Editorial Luxury / Soft Structuralism) + Layout
   (Asymmetric Bento / Z-Axis Cascade / Editorial Split) based on
   prompt context. Don't repeat the same combination twice.

2. [SCAFFOLD] Establish background texture, macro-whitespace scale
   (py-24 to py-40), massive typography sizes (display 80-120px).

3. [ARCHITECT] Build the DOM strictly using Double-Bezel (Doppelrand)
   for all major cards / inputs / feature grids. Use exaggerated
   squircle radii (rounded-[2rem]).

4. [CHOREOGRAPH] Inject custom cubic-bezier transitions, staggered
   navigation reveals, button-in-button hover physics.

5. [OUTPUT] Deliver flawless pixel-perfect React/Tailwind code. NO
   generic fallbacks.

6. [PRE-OUTPUT CHECKLIST] Run the checklist below before responding.
`;

export const PRE_OUTPUT_CHECKLIST = [
  "No banned fonts/icons/borders/shadows/layouts/motion patterns from Absolute Zero.",
  "A Vibe Archetype + Layout Archetype were consciously selected + applied.",
  "All major cards/containers use Double-Bezel nested architecture (outer shell + inner core, concentric radii).",
  "CTA buttons use Button-in-Button trailing icon pattern where applicable.",
  "Section padding is AT MINIMUM `py-24` — the layout breathes heavily.",
  "All transitions use custom cubic-bezier curves — NO `linear` / `ease-in-out`.",
  "Scroll entry animations are present — no element appears statically.",
  "Layout collapses gracefully below `768px` to single-column with `w-full` + `px-4`.",
  "All animations use only `transform` + `opacity` — no layout-triggering properties.",
  "`backdrop-blur` only on fixed/sticky elements, never on scrolling content.",
  "Overall impression reads as '$150k agency build', NOT 'template with nice fonts'.",
];
