/**
 * Theme axes — `data-theme` / `data-accent` / `data-density` /
 * `data-font-size`. Set on `<html>` (or any subtree) to rebind the
 * entire token chain at runtime. Cardinal rule 21 makes this
 * mandatory: every primitive must honour every axis without
 * hardcoded values.
 */

export interface ThemeAxis {
  name: string;
  /** The HTML data attribute (`data-theme`, etc.). */
  attribute: string;
  /** Valid values. */
  values: string[];
  /** What the axis controls. */
  controls: string;
  /** Body of guide. */
  body: string;
  /** Example usage. */
  example: string;
}

export const THEME_AXES: ThemeAxis[] = [
  {
    name: "Theme",
    attribute: "data-theme",
    values: ["light", "dark"],
    controls:
      "Surface / foreground / border palettes — rebinds `--background`, `--foreground`, `--card`, `--border`, etc.",
    body: `Mounted on \`<html>\` at app boot. The framework ships matching
light + dark token sets in \`src/styles/theme.css\` — every
\`--background\` / \`--foreground\` pair is AA-contrast verified for
both. Consumers respect the user's OS preference via
\`prefers-color-scheme\` (CSS \`@media\` query in theme.css), and
override via \`data-theme="dark"\` to force. The Storybook toolbar
includes a Theme picker — verify every PR on both.`,
    example: `// Auto from system preference (default in theme.css):
<html data-theme="light"><body>...</body></html>

// Or force dark for the user:
document.documentElement.dataset.theme = "dark"`,
  },
  {
    name: "Accent",
    attribute: "data-accent",
    values: ["blue", "violet", "cyan", "green", "orange", "rose"],
    controls:
      "Brand hue — rebinds `--primary`, `--primary-foreground`, `--ring`, `--sidebar-active-*`. Same slot name, different hue.",
    body: `Per cardinal rule 19 — service-specific brand colors live HERE,
not in component props. Set \`data-accent="blue"\` for the GoDX-blue
brand. Add a new palette by appending a \`[data-accent="<name>"]\`
block to \`src/styles/theme.css\` — both \`--primary\`,
\`--primary-foreground\`, \`--ring\` must be defined. The slot
contract is what allows the same primitive to look
"GoDX blue" on one tenant + "Acme red" on another with zero
code changes. Storybook toolbar has an Accent picker.`,
    example: `// Per-tenant brand:
<html data-accent="violet"><body>... </body></html>

// Per-section (e.g. admin section uses a different palette):
<div data-accent="rose"><ImportantCTA /></div>`,
  },
  {
    name: "Density",
    attribute: "data-density",
    values: ["compact", "default", "comfortable"],
    controls:
      "Element heights + paddings — rebinds `--density-element`, `--density-element-sm`, `--density-element-lg`, `--density-card`, `--density-page`, `--header-height`, `--sidebar-width`. NOT `--touch-target-min` (44px floor on mobile).",
    body: `User preference (in the Tweaks panel). \`compact\` packs more rows
on screen (kintai sheets, ops tables); \`comfortable\` gives airy
spacing (marketing, onboarding). Primitives never read pixel values
directly — they reference \`var(--density-element)\` which rebinds
per axis. The exception: \`--touch-target-min: 44px\` stays fixed on
mobile via \`@media (pointer: coarse)\` so density doesn't shrink
tap targets below the WCAG minimum.`,
    example: `// Application-wide preference:
<html data-density="compact"><body>...</body></html>

// Per-page (compact tables on a Reports page):
<div data-density="compact"><BigTable /></div>`,
  },
  {
    name: "Font size",
    attribute: "data-font-size",
    values: ["sm", "base", "lg", "xl"],
    controls:
      "Root rem scale — rescales every rem-based token across the system (spacing, density, type, radii). Accessibility-driven.",
    body: `For users with low-vision needs (or just preference). Sets \`html\`
font-size from \`14px → 16px (default) → 18px → 20px\`. Because the
entire token system is rem-based, EVERY value scales proportionally
— a "default" Button height that was 32px at \`base\` becomes 36px at
\`lg\`. Touch targets, density, spacing — everything stays in
harmony. Consumer apps expose this via the Tweaks panel (or a
"Display size" setting).`,
    example: `// User preference:
<html data-font-size="lg"><body>...</body></html>

// Programmatic via Tweaks API:
import { useTweaks } from "@godxjp/ui/hooks"
const { fontSize, setFontSize } = useTweaks()
setFontSize("lg")`,
  },
];

export const AXIS_SWEEP_PROTOCOL = `
Every PR that touches a primitive must verify all 4 axes via the
Storybook toolbar:

  1. Toggle Theme (light → dark)
  2. Toggle each Accent (blue → violet → cyan → green → orange → rose)
  3. Toggle Density (compact → default → comfortable)
  4. Toggle Font size (sm → base → lg → xl)

A failure to render correctly on any axis = a tokens / CSS bug.
Fix the primitive / CSS / token, never paper over with a one-off
override (rule 25 — stories are docs, UI is the primitive).
`;
