import * as React from "react";

import { cn } from "../../lib/utils";
import type { IconGlyphProp } from "../../props/components/general.prop";

export type {
  IconGlyphProp,
  IconGlyphProp as IconProps,
} from "../../props/components/general.prop";

/**
 * Icon — a glyph on the `--icon-size-*` scale, and the only supported way to draw a standalone one.
 *
 * WHY THIS EXISTS (gh#712). A lucide component ships `width="24" height="24"`, and exactly four
 * rules in this library ever override that: `.ui-button svg`, `.ui-dropdown-menu-item > svg`,
 * `.ui-topbar-item > svg` and `[data-slot="list-row-leading"] > svg`. Anywhere else — in a `Text`,
 * in a table cell, in an `<a>` — the glyph draws at 24px beside 14px type, 1.71× the text it
 * annotates. A consumer cannot fix that themselves: `size-4` and `w-[16px]` are what
 * docs/CONSUMER-RULES.md §3/§8 forbid, and `size={16}` hard-codes a number the theme owns. One
 * consumer measured 38 such glyphs in a single app.
 *
 * RENDERS ONTO THE GLYPH, NOT AROUND IT. `as={Lock}` is invoked with the class, the size and the
 * a11y wiring, so the element that carries the metric IS the `<svg>`. A wrapper `<span>` would add
 * a box to every flex row that holds an icon, and would break `Button`'s own `svg` rule by putting
 * an element between the two.
 *
 * DECORATIVE BY DEFAULT. Without `label` the glyph is `aria-hidden` — a glyph beside a visible
 * label is decoration, and announcing it twice is the usual defect (WCAG 2.2 SC 1.1.1). Pass
 * `label` only when the glyph is the ONLY thing saying what it says; it then renders as
 * `role="img"` + that name, which is how a graphic gets a name in WAI-ARIA 1.2. The string is the
 * consumer's to localize — the library ships no copy for it.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconGlyphProp>(function Icon(
  { as: Glyph, size = "md", tone, label, className, ...props },
  ref,
) {
  // An empty string is not an accessible name (it is the absence of one), so it reads as absent —
  // the same rule TopbarItem's `badge` follows.
  const named = label !== undefined && label !== "";
  return (
    <Glyph
      ref={ref}
      data-slot="icon"
      data-size={size}
      // Absent when no tone is asked for, so the resting glyph inherits `currentColor` from
      // whatever surface it sits on rather than being repainted in the page's ink.
      data-tone={tone}
      className={cn("ui-icon", className)}
      role={named ? "img" : undefined}
      aria-label={named ? label : undefined}
      aria-hidden={named ? undefined : true}
      {...props}
    />
  );
});
