import { cn } from "../../lib/utils";
import type { LegendProp } from "../../props/components/data-display.prop";

export type {
  LegendItemProp,
  LegendProp,
  LegendProp as LegendProps,
} from "../../props/components/data-display.prop";

/**
 * Legend — the KEY for a set of tones: which colour means what.
 *
 * Pair it with anything that encodes meaning as colour and cannot repeat the words on every mark:
 * a `Progress` breakdown, a chart, a status column. It is the reason a colour-coded surface can
 * satisfy WCAG 1.4.1 — the tone is never the only carrier of the meaning, because the key spells
 * it out once in words.
 *
 * The swatch is `aria-hidden`: it is the same information as the label beside it, and a screen
 * reader announcing "square, overdue" twice per key is noise. What reaches assistive tech is a
 * plain list of the labels, which is exactly what the key says.
 */
export function Legend({ items, className, ...props }: LegendProp) {
  return (
    <ul className={cn("ui-legend", className)} {...props}>
      {/* Keyed by position: `label` is a ReactNode, so it is not a key, and a legend is a fixed
          list read top to bottom rather than a collection that reorders. */}
      {items.map((item, index) => (
        <li key={index} className="ui-legend-item">
          <span className="ui-legend-swatch" data-tone={item.tone} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
