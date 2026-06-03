/**
 * Redesign audit checklist — for upgrading an existing project (or
 * critiquing a new design before shipping). Adapted from
 * Leonxlnx/taste-skill `redesign-existing-projects` SKILL. The MCP
 * exposes this so consumer agents can run a structured audit on a
 * page they're working on.
 *
 * Fix priority is ordered for MAXIMUM visual impact at MINIMUM
 * risk — agents should apply in this order.
 */

export interface AuditCheck {
  category:
    | "typography"
    | "color-surface"
    | "layout"
    | "interactivity"
    | "content"
    | "components"
    | "iconography"
    | "code-quality"
    | "omissions";
  /** What to look for. */
  symptom: string;
  /** Concrete fix. */
  fix: string;
  /** @godxjp/ui-specific notes if applicable. */
  uiNote?: string;
}

export const REDESIGN_CHECKS: AuditCheck[] = [
  // ── typography ─────────────────────────────────────────────────
  {
    category: "typography",
    symptom: "Inter / Roboto / Open Sans everywhere — the AI default.",
    fix: "Pick a font with character: Geist, Outfit, Cabinet Grotesk, Satoshi for sans. For editorial / creative — pair a serif heading (Newsreader, Lyon, Playfair) with a sans body.",
    uiNote:
      "Override --font-sans + --font-serif at the consumer's root CSS. Framework reads from these tokens.",
  },
  {
    category: "typography",
    symptom: "Headlines lack presence — small + thin + default tracking.",
    fix: "Increase display size, tighten letter-spacing (-0.02em to -0.04em), reduce line-height (1.1). Headlines should feel HEAVY and INTENTIONAL.",
    uiNote: "Typography.Title size={1} for hero; override fontFamily + letterSpacing inline.",
  },
  {
    category: "typography",
    symptom: "Body paragraphs full-width — hard to read.",
    fix: "Limit paragraph max-width to ~65ch. Increase line-height to 1.6+.",
    uiNote: "Wrap Typography.Paragraph in `<div style={{ maxWidth: '65ch' }}>`.",
  },
  {
    category: "typography",
    symptom: "Only Regular (400) + Bold (700) weights — flat hierarchy.",
    fix: "Introduce Medium (500) + SemiBold (600) for subtle weight contrasts.",
  },
  {
    category: "typography",
    symptom: "Numbers in proportional font — columns jitter in tables.",
    fix: "`font-variant-numeric: tabular-nums` for data, or a monospace font like Geist Mono.",
    uiNote:
      "Table primitive already uses `tabular-nums` on `.num` cells. For ad-hoc numeric labels, add the CSS prop manually.",
  },
  {
    category: "typography",
    symptom: "Orphaned words — single word on the last line of a heading.",
    fix: "`text-wrap: balance` (h1/h2/h3) or `text-wrap: pretty` (body).",
  },
  {
    category: "typography",
    symptom: "Title Case On Every Header.",
    fix: "Use sentence case instead. More modern, easier to read.",
  },

  // ── color / surface ────────────────────────────────────────────
  {
    category: "color-surface",
    symptom: "Pure #000000 background.",
    fix: "Replace with off-black (#0A0A0A) / dark charcoal (#121212) / tinted dark (deep navy).",
    uiNote:
      "Framework dark theme already uses tinted dark values — verify the consumer's override didn't force pure black.",
  },
  {
    category: "color-surface",
    symptom: "Oversaturated accent colors.",
    fix: "Keep saturation below 80%. Desaturate so accents BLEND with neutrals rather than scream.",
  },
  {
    category: "color-surface",
    symptom: "More than one accent color competing.",
    fix: "Pick ONE. Remove the rest. Consistency beats variety in palette.",
    uiNote:
      "Set ONE `data-accent` at `<html>` root. Use semantic colors (success / warning / destructive) only for genuinely semantic content.",
  },
  {
    category: "color-surface",
    symptom: "Purple/blue 'AI gradient' aesthetic — most common AI fingerprint.",
    fix: "Replace with neutral base + ONE considered accent. Drop the gradient entirely if it has no narrative purpose.",
  },
  {
    category: "color-surface",
    symptom: "Generic black `box-shadow` everywhere.",
    fix: "Tint shadow to match background hue (e.g. cool gray bg → cool gray shadow). Colored shadows over pure black.",
  },
  {
    category: "color-surface",
    symptom: "Random dark section breaking an otherwise light page.",
    fix: "Either commit to full dark mode OR keep light consistently. If contrast needed, use a SLIGHTLY darker shade of the same palette — not a sudden jump to #111.",
  },
  {
    category: "color-surface",
    symptom: "Empty flat sections with no visual depth.",
    fix: "Add subtle background imagery at low opacity (`/picsum.photos/seed/{name}/1920/1080`) OR ambient gradient at 0.02-0.05 opacity. Empty flat = unfinished.",
  },

  // ── layout ─────────────────────────────────────────────────────
  {
    category: "layout",
    symptom: "Everything centered + symmetric.",
    fix: "Break symmetry: offset margins, mixed aspect ratios, left-aligned header over centered body.",
  },
  {
    category: "layout",
    symptom: "Three equal card columns as feature row — the most generic AI layout.",
    fix: "Replace with 2-column zig-zag, asymmetric grid, horizontal scroll, or masonry. The 3-equal-cols pattern is RED FLAG #1.",
    uiNote:
      "Use Bento Grid (custom CSS grid with `gridColumn: 'span N'`) instead of `<Grid cols={3}>` for hero sections.",
  },
  {
    category: "layout",
    symptom: "`height: 100vh` causing iOS Safari jump.",
    fix: "Use `min-height: 100dvh` (dynamic viewport) instead.",
  },
  {
    category: "layout",
    symptom: "No max-width container — content stretches edge-to-edge.",
    fix: "Add a container constraint (1200-1440px) with `margin: auto`. Or use `max-w-4xl / max-w-5xl` for content-heavy pages.",
    uiNote:
      "Framework's PageContent constrains via `var(--container-max-width)`. Consumer may override.",
  },
  {
    category: "layout",
    symptom: "Cards forced to same height by flexbox.",
    fix: "Allow variable heights or use masonry when content varies.",
    uiNote: "Use Masonry primitive — handles variable heights without flexbox stretch.",
  },
  {
    category: "layout",
    symptom: "Buttons at random vertical positions in card rows.",
    fix: "Pin CTAs to card bottom — same Y-position across the row regardless of content above.",
    uiNote: "Card's `actions` footer slot bottom-aligns automatically.",
  },
  {
    category: "layout",
    symptom: "Feature lists starting at different vertical positions in pricing tables.",
    fix: "Fixed-height title/price block + consistent spacing above the feature list. Cards align across columns.",
  },
  {
    category: "layout",
    symptom: "Dashboard ALWAYS has a left sidebar.",
    fix: "Consider top navigation, floating command menu, or collapsible panel. Sidebar isn't the only chrome.",
    uiNote:
      "Framework supports both — AppShell with sidebar slot is optional; can use Topbar-only for some flows.",
  },

  // ── interactivity ──────────────────────────────────────────────
  {
    category: "interactivity",
    symptom: "No hover states on buttons.",
    fix: "Background shift, scale, or translate on hover — 150-200ms ease.",
    uiNote: "Framework Button has built-in hover. If overridden — restore.",
  },
  {
    category: "interactivity",
    symptom: "No active/pressed feedback.",
    fix: "`scale(0.98)` or `translateY(1px)` on `:active`. Simulates a physical click.",
  },
  {
    category: "interactivity",
    symptom: "No focus ring (`outline: none`).",
    fix: "Restore visible `:focus-visible` ring. Accessibility requirement, not optional.",
  },
  {
    category: "interactivity",
    symptom: "Generic circular spinner for page-level loading.",
    fix: "Replace with Skeleton placeholders matching the eventual content shape.",
    uiNote:
      "Framework Skeleton + Form `loading={{ kind: 'skeleton' }}` handles cascading initial-fetch state.",
  },
  {
    category: "interactivity",
    symptom: "No empty states — empty dashboard shows nothing.",
    fix: "Design a composed 'getting started' view: Empty primitive with title + description + next-action button.",
  },
  {
    category: "interactivity",
    symptom: "`window.alert()` for errors.",
    fix: "Inline error in the relevant Field, OR toast for non-form errors, OR Dialog for blocking errors.",
  },
  {
    category: "interactivity",
    symptom: "Dead links (`href='#'`).",
    fix: "Either link to real destinations or visually disable the button.",
  },
  {
    category: "interactivity",
    symptom: "No indication of current page in navigation.",
    fix: "Style the active nav link distinctly.",
    uiNote: "Sidebar handles via `activeId` — pass it.",
  },

  // ── content ────────────────────────────────────────────────────
  {
    category: "content",
    symptom: "Generic names — 'John Doe', 'Jane Smith'.",
    fix: "Diverse, realistic names. For Japanese apps: 田中 太郎, 佐藤 美咲, Nguyễn Lan, Maria Cruz.",
  },
  {
    category: "content",
    symptom: "Fake round numbers — '99.99%', '50%', '$100.00'.",
    fix: "Organic data: '47.2%', '$99.00', '+1 (312) 847-1928'.",
  },
  {
    category: "content",
    symptom: "Placeholder brand names — Acme, Nexus, SmartFlow.",
    fix: "Invent contextual believable brands or use the consumer's real brand.",
  },
  {
    category: "content",
    symptom:
      "AI copy clichés — 'elevate', 'seamless', 'unleash', 'next-gen', 'game-changer', 'delve', 'tapestry', 'in the world of'.",
    fix: "Plain specific language. Numbers, nouns, verbs.",
    uiNote:
      "Framework's cardinal rule 9 bans this in framework docs; same discipline applies to consumer copy.",
  },
  {
    category: "content",
    symptom: "Exclamation marks in success messages.",
    fix: "Remove. Be confident, not loud.",
  },
  {
    category: "content",
    symptom: "'Oops!' or apologetic error messages.",
    fix: "Direct + specific: 'Connection failed. Please try again.' / 'メールアドレスの形式が正しくありません'.",
  },
  {
    category: "content",
    symptom: "Lorem Ipsum.",
    fix: "Real draft copy. Even rough placeholder beats Latin.",
  },

  // ── components ─────────────────────────────────────────────────
  {
    category: "components",
    symptom: "Generic card look (border + shadow + white).",
    fix: "Remove border OR shadow OR background — keep ONE. Cards exist only when elevation communicates hierarchy.",
  },
  {
    category: "components",
    symptom: "Always one filled + one ghost button.",
    fix: "Add text links / tertiary styles for variety.",
    uiNote: "Button has `variant='link'` for tertiary actions.",
  },
  {
    category: "components",
    symptom: "3-card carousel testimonials with dots.",
    fix: "Replace with masonry wall of quotes, embedded social posts, or single rotating quote.",
  },
  {
    category: "components",
    symptom: "Pricing table with 3 equal towers.",
    fix: "Highlight recommended tier with COLOR and emphasis, not just extra height.",
  },
  {
    category: "components",
    symptom: "Modals for everything.",
    fix: "Use inline editing, Sheet (slide-over), or expandable Collapse for simple actions. Reserve Dialog for true blocking decisions.",
  },
  {
    category: "components",
    symptom: "Footer link farm with 4 columns.",
    fix: "Simplify. Main nav paths + legally required links. No marketing kitchen sink.",
  },

  // ── iconography ────────────────────────────────────────────────
  {
    category: "iconography",
    symptom: "Lucide or Feather icons exclusively.",
    fix: "Use Phosphor (Bold / Fill), Heroicons, or a custom set. AI default tell.",
    uiNote:
      "Framework ships with lucide as locked dependency (rule 14). For editorial differentiation, layer Phosphor on top.",
  },
  {
    category: "iconography",
    symptom: "Cliche icon metaphors — rocketship 'launch', shield 'security'.",
    fix: "Less obvious: bolt, fingerprint, spark, vault, gem.",
  },
  {
    category: "iconography",
    symptom: "Stock 'diverse team in office' photo.",
    fix: "Real team photos, candid shots, or a consistent illustration style. Avatar initials fallback > generic stock person.",
  },

  // ── code quality ───────────────────────────────────────────────
  {
    category: "code-quality",
    symptom: "Div soup — no semantic HTML.",
    fix: "`<nav>`, `<main>`, `<article>`, `<aside>`, `<section>` for landmarks.",
    uiNote: "AppShell renders the canonical landmark structure automatically.",
  },
  {
    category: "code-quality",
    symptom: "Inline styles mixed with CSS classes haphazardly.",
    fix: "Move styling into the project's system. Inline `style={{}}` only for layout / positioning (rule 29).",
  },
  {
    category: "code-quality",
    symptom: "Missing alt text on images.",
    fix: "Describe content for SR. Never leave `alt=''` or `alt='image'` on meaningful images.",
  },
  {
    category: "code-quality",
    symptom: "Arbitrary z-index values like `9999`.",
    fix: "Establish a clean z-index scale in CSS variables.",
  },

  // ── strategic omissions ────────────────────────────────────────
  {
    category: "omissions",
    symptom: "No legal links in footer.",
    fix: "Add Privacy Policy + Terms of Service.",
  },
  {
    category: "omissions",
    symptom: "Dead ends in user flows — no 'back'.",
    fix: "Every page has a way back. Breadcrumb, back button, OR clear nav state.",
  },
  {
    category: "omissions",
    symptom: "No custom 404 page.",
    fix: "Design a helpful branded 404 with a way home and search.",
  },
  {
    category: "omissions",
    symptom: "No form validation.",
    fix: "Client-side validation via zod schema. Framework's Form + FormField handle field-level errors automatically.",
  },
  {
    category: "omissions",
    symptom: "No 'skip to content' link.",
    fix: "Hidden skip-link, first focusable element. Essential for keyboard users.",
    uiNote: "AppShell renders one automatically.",
  },
];

export const FIX_PRIORITY = [
  "1. Font swap — biggest instant improvement, lowest risk",
  "2. Color palette cleanup — remove clashing / oversaturated colors",
  "3. Hover + active states — makes the interface feel alive",
  "4. Layout + spacing — proper grid, max-width, consistent padding",
  "5. Replace generic components — swap cliche patterns for modern alternatives",
  "6. Add loading, empty, error states — makes it feel finished",
  "7. Polish typography scale + spacing — the premium final touch",
];

export const REDESIGN_RULES = [
  "Work with the existing tech stack. Do NOT migrate frameworks or styling libraries.",
  "Do NOT break existing functionality. Test after every change.",
  "Before importing any new library, check `package.json` first.",
  "Keep changes reviewable + focused. Small targeted improvements over big rewrites.",
  "Run the audit before fixing — listing issues first prevents accidental scope creep.",
];

export function checksByCategory(cat: AuditCheck["category"]): AuditCheck[] {
  return REDESIGN_CHECKS.filter((c) => c.category === cat);
}
