/**
 * Minimalist / editorial UI mode — premium utilitarian aesthetic
 * adapted from Leonxlnx/taste-skill `minimalist-ui` SKILL. When the
 * consumer brief calls for "editorial", "premium document-style",
 * "workspace platform feel" — apply these refinements ON TOP of the
 * @godxjp/ui primitives (do NOT replace them).
 *
 * The framework's primitives ARE compatible — Tag accepts a `color`
 * string (use the pale-pastel hex), Card accepts `border` via
 * className, Typography accepts custom font via the consumer's CSS
 * variable override (`--font-sans`, `--font-serif`, `--font-mono`).
 */

export interface MinimalRule {
  topic: string;
  rule: string;
  body: string;
  example?: string;
}

export const MINIMALISM_RULES: MinimalRule[] = [
  {
    topic: "negative-constraints",
    rule:
      "Banned defaults — Inter, Roboto, Open Sans, Lucide / Feather / Heroicons standard set, Tailwind heavy shadows (md/lg/xl), primary-colored hero backgrounds, gradients, neon, full glassmorphism, `rounded-full` containers, emojis in markup, generic names, AI clichés.",
    body: `Minimalist-editorial UI REJECTS the AI defaults because they
collapse every brief into the same dribbble clone. Every banned
item has a replacement — see the rules below.

The framework's defaults are mostly safe (no neon, no purple-blue
hero, semantic palette). But Inter / Lucide are the consumer's
choice; for editorial mode, override.`,
  },
  {
    topic: "typography",
    rule:
      "Pair an editorial SERIF (Lyon Text / Newsreader / Playfair Display / Instrument Serif) for headings + a CHARACTER SANS (SF Pro Display / Geist Sans / Switzer) for body + monospace (Geist Mono / JetBrains Mono) for data + keystrokes.",
    body: `Tight tracking on serif headings (\`-0.02em\` to \`-0.04em\`) + tight
line-height (\`1.1\`). Body line-height \`1.6\` for readability. Off-
black for body (\`#111111\` / \`#2F3437\`), never pure black. Secondary
\`#787774\`. Override the framework's font tokens at the consumer
root: \`html { --font-sans: 'Geist', ui-sans-serif; --font-serif:
'Newsreader', serif; --font-mono: 'Geist Mono', ui-monospace; }\`.`,
    example: `// global.css — editorial typography
html {
  --font-sans: "Geist", "SF Pro Display", system-ui, sans-serif;
  --font-serif: "Newsreader", "Lyon Text", Georgia, serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
}

// Heading uses serif tone for editorial feel:
<Typography.Title size={1} style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
  The quarterly index
</Typography.Title>`,
  },
  {
    topic: "palette",
    rule:
      "Warm monochrome + 4 spot pastels. Canvas off-white (#F7F6F3) or pure white. Borders ultra-light (#EAEAEA / rgba(0,0,0,0.06)). Accents only from the desaturated pastel set.",
    body: `Color is a SCARCE resource. The whole UI is structured around 5
neutrals + 4 muted pastels. Pastels (pale red, blue, green, yellow)
appear ONLY in: tag/badge backgrounds, inline-code bg, icon
backgrounds.

Layer the pastels into the framework's accent variables:
\`<div data-accent="custom" style={{
  "--primary": "#1F6C9F",
  "--accent": "#E1F3FE",
}}>\` — locally scoped, the rest of the framework picks it up.`,
    example: `// Pastel chip:
<Tag color="#1F6C9F" style={{ background: "#E1F3FE", border: "none" }} bordered={false}>
  In Review
</Tag>

// Editorial canvas:
<body style={{ background: "#F7F6F3", color: "#111111" }}>
  ...
</body>`,
  },
  {
    topic: "bento-grids",
    rule:
      "Asymmetric CSS Grid feature bento boxes. Cards: `1px solid #EAEAEA` border, `8-12px` border-radius (NEVER more), generous internal padding `24-40px`, NO shadow.",
    body: `Premium minimalism gets composition from BENTO grids — varied cell
sizes (1×1, 1×2, 2×1, 2×2) arranged in CSS Grid with explicit
template areas. Differs from the framework's default symmetric
\`<Grid cols={3}>\` — use raw CSS grid for the bento layout, with
Card primitives inside.`,
    example: `<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gridAutoRows: "180px",
  gap: 16,
}}>
  <Card style={{ gridColumn: "span 2", gridRow: "span 2" }}>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card style={{ gridColumn: "span 2" }}>...</Card>
</div>`,
  },
  {
    topic: "primary-cta",
    rule:
      "Editorial Button: solid #111 bg, white text, `4-6px` radius, NO shadow. Hover: shift to #333 OR `scale(0.98)` press. Override the framework's default token-pinned Button via className.",
    body: `Framework Button variants are designed for brand-themed apps. For
editorial mode, override:`,
    example: `<Button
  className="editorial-cta"
  style={{
    background: "#111111",
    color: "#FFFFFF",
    borderRadius: 6,
    boxShadow: "none",
    fontWeight: 500,
  }}
>
  Continue
</Button>`,
  },
  {
    topic: "tags-and-badges",
    rule:
      "Pill-shape (`border-radius: 9999px`), `text-xs`, UPPERCASE with `letter-spacing: 0.05em`. Pastel background, deep text.",
    body: `Tags become labels, not decorations. UPPERCASE + tracking signals
"metadata category" to the eye.`,
    example: `<Tag style={{
  background: "#EDF3EC",
  color: "#346538",
  border: "none",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: "var(--text-2xs)",
  padding: "2px 8px",
  borderRadius: 9999,
}} bordered={false}>
  Active
</Tag>`,
  },
  {
    topic: "accordions",
    rule:
      "Strip ALL container chrome from FAQ-style Collapse. Items separated by `border-bottom: 1px solid #EAEAEA`. Toggle: sharp `+` / `−` icons.",
    body: `Default Collapse renders nested in a Card. For editorial, render
flat — borderless except for hairline separators.`,
    example: `// Custom editorial Collapse — override container styles
<Collapse className="editorial-faq">
  <Collapse.Item title="What is the refund policy?">
    14-day refund window from purchase date.
  </Collapse.Item>
</Collapse>

// CSS override:
.editorial-faq .collapse-item { border-bottom: 1px solid #EAEAEA; border-radius: 0; background: transparent; }`,
  },
  {
    topic: "keyboard-shortcuts",
    rule:
      "Render shortcuts as physical `<kbd>` keys: `1px solid #EAEAEA`, `4px` radius, `#F7F6F3` bg, monospace font.",
    body: `Shows command syntax authentically — looks like a real keyboard
key, not text. The framework's CommandPalette accepts a
\`shortcut\` array; render it via this style.`,
    example: `<kbd style={{
  border: "1px solid #EAEAEA",
  borderRadius: 4,
  background: "#F7F6F3",
  padding: "2px 6px",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
}}>⌘</kbd>
<kbd style={{ /* same */ }}>K</kbd>`,
  },
  {
    topic: "faux-os-chrome",
    rule:
      "When mocking software previews, wrap in a minimal window: white top bar + 3 small light-gray circles (macOS chrome).",
    body: `Establishes "this is a window into our product". Doesn't try to
simulate the real OS — symbolic suffices.`,
    example: `<div style={{ border: "1px solid #EAEAEA", borderRadius: 8, overflow: "hidden" }}>
  <div style={{ background: "white", height: 32, display: "flex", alignItems: "center", padding: "0 12px", gap: 6, borderBottom: "1px solid #EAEAEA" }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E7EB" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E7EB" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E5E7EB" }} />
  </div>
  <div>{/* product UI here */}</div>
</div>`,
  },
  {
    topic: "iconography",
    rule:
      "Override the framework's default lucide → use Phosphor (Bold / Fill) or Radix Icons. Standardize stroke weight across the entire app.",
    body: `Lucide is the AI default — instantly readable as "default
choice". Phosphor's Bold/Fill weight has more character.
Radix UI Icons (\`@radix-ui/react-icons\`) are subtler. Pick ONE,
standardize.`,
    example: `import { Folder as PhFolder } from "@phosphor-icons/react"

<Card extra={<PhFolder weight="bold" size={20} />}>
  Documents
</Card>`,
  },
  {
    topic: "motion",
    rule:
      "Subtle scroll-entry fade: `translateY(12px) → 0` + `opacity 0 → 1` over `600ms` `cubic-bezier(0.16, 1, 0.3, 1)`. Hover: `scale(0.98)` on active. Stagger lists `80ms * index`.",
    body: `Motion is INVISIBLE-PRESENT — supports state changes, never
demands attention. Use \`IntersectionObserver\` never raw scroll
listeners. Animate \`transform\` + \`opacity\` only (GPU). Wrap in
\`prefers-reduced-motion\`.`,
    example: `// scroll-entry hook (pseudo):
function FadeUp({ children }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add("visible")
    }, { threshold: 0.1 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className="fade-up">{children}</div>
}
// CSS:
.fade-up { opacity: 0; transform: translateY(12px); transition: opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1); }
.fade-up.visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .fade-up { transition: none; opacity: 1; transform: none; } }`,
  },
  {
    topic: "execution-protocol",
    rule:
      "Apply in order: macro-whitespace → max-width 4xl/5xl content → custom typography → 1px borders → scroll-entry → subtle background depth.",
    body: `1. Establish vertical rhythm first — \`py-24\` / \`py-32\` between
   sections.
2. Constrain main content width to \`max-w-4xl\` (~896px) or
   \`max-w-5xl\` (~1024px) — never edge-to-edge.
3. Apply the editorial typography variables (override --font-*).
4. Every card / divider / border = exactly \`1px solid #EAEAEA\`.
5. Wire scroll-entry animations to major content blocks.
6. Sections get visual depth via imagery / ambient gradient at
   very low opacity (0.02-0.05), NOT empty flat backgrounds.
7. The output should look HIGH-END natively — no manual polish
   round needed.`,
  },
];
