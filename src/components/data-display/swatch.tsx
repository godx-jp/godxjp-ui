import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";
import type { SwatchProp } from "../../props/components/data-display.prop";

export type {
  SwatchProp,
  SwatchProp as SwatchProps,
} from "../../props/components/data-display.prop";

/**
 * Swatch — a READ-ONLY sample of one colour a person chose (gh#527).
 *
 * The colour arrives as a VALUE, never as a token: it is a brand's `primary_color`, a calendar
 * category, a tag a user tinted. That is the axis `Legend` cannot express — its `tone` is a closed
 * set of semantic roles — and the reason there was no legal way to draw one: a hand-rolled
 * `<span className="w-[10px] h-[10px] rounded-[2px] bg-[#c0392f]" />` is blocked by ui-audit three
 * times over, so the only remaining move was a suppression comment.
 *
 * It is the same square mark `Legend` draws (a sample reads as a SAMPLE; a pill reads as a chip
 * you could click), one step larger, because it stands beside a name rather than inside an 11px
 * key. The hairline is not decoration: without it a white or near-white value is invisible on a
 * white card, and the sample stops showing anything at all.
 *
 * ## The accessible name
 *
 * Given an `aria-label` the mark is a `role="img"` that announces it, which is what lets the
 * colour be shown with no visible label beside it. Given none it is `aria-hidden` — the Legend
 * rule, for the same reason: a swatch that repeats a label already on screen would announce the
 * same thing twice. Colour is never the sole carrier either way.
 */
export function Swatch({ color, className, style, ...props }: SwatchProp) {
  const named = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  return (
    <span
      data-slot="swatch"
      className={cn("ui-swatch", className)}
      // Per-instance, like Badge's `--badge-color`: an inline declaration for a value the
      // stylesheet cannot know, over a token the stylesheet declares so the property always
      // resolves. No hex ever enters the CSS.
      style={{ ...style, ["--swatch-color" as string]: color } as CSSProperties}
      role={named ? "img" : undefined}
      aria-hidden={named ? undefined : true}
      {...props}
    />
  );
}
