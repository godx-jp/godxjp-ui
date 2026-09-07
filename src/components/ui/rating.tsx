import * as React from "react";
import { Star } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";

export type RatingProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of symbols. This library's older name for antd's `count`; both are accepted. */
  max?: number;
  /** antd `count` — number of symbols. Default 5. */
  count?: number;
  /**
   * antd `allowHalf` — a symbol can be half-filled, so the scale is 0.5 … count in steps of 0.5.
   * The keyboard steps by a half too, and each symbol becomes TWO hit areas (leading / trailing).
   */
  allowHalf?: boolean;
  /**
   * antd `allowClear` — choosing the value that is already chosen clears it back to 0. On by
   * default in antd; off here, because a rating inside a form is usually required and a silent
   * reset on a second click reads as a lost answer.
   */
  allowClear?: boolean;
  /**
   * antd `character` — what a symbol IS. A node for every symbol, or a function of the 1-based
   * index for a scale whose symbols differ (A/B/C, 松竹梅, a heart for the top step).
   */
  character?: React.ReactNode | ((index: number) => React.ReactNode);
  /**
   * antd `tooltips` — a label per step, in order. It is folded into each symbol's ACCESSIBLE NAME
   * rather than shown only on hover: a `title` attribute is invisible to a keyboard and to touch,
   * and the whole point of the prop is to say what "3 of 5" means.
   */
  tooltips?: readonly string[];
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
};

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      max,
      count,
      allowHalf = false,
      allowClear = false,
      character,
      tooltips,
      readOnly,
      disabled,
      name,
      className,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    // antd calls it `count`; this library shipped `max` first. One wins, `count` first, and the
    // default is antd's 5 either way.
    const symbols = count ?? max ?? 5;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = value ?? internal;
    const [hover, setHover] = React.useState<number | null>(null);
    const display = hover ?? current;
    const interactive = !readOnly && !disabled;
    /** The smallest move the scale allows — antd's `allowHalf` is exactly this and nothing else. */
    const stepSize = allowHalf ? 0.5 : 1;

    const select = (next: number) => {
      if (!interactive) return;
      // antd `allowClear`: picking the value that is already picked drops back to 0.
      const resolved = allowClear && next === current ? 0 : next;
      if (value === undefined) setInternal(resolved);
      onValueChange?.(resolved);
    };

    // Roving tabindex: only the checked star is tabbable; if nothing is checked the first star is,
    // so the radiogroup always exposes a single tab stop (APG radiogroup pattern).
    const focusableStar = current > 0 ? Math.ceil(current) : 1;

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
      if (!interactive) return;
      // Every case either assigns or returns, so this needs no initialiser — and the type
      // narrows to number, which is what select() actually wants.
      let next: number;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = Math.min(symbols, star + stepSize);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = Math.max(stepSize, star - stepSize);
          break;
        case "Home":
          next = stepSize;
          break;
        case "End":
          next = symbols;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    /** The label a screen reader reads for one step — the `tooltips` entry, or "n of max". */
    const stepLabel = (star: number) => {
      const tooltip = tooltips?.[star - 1];
      const base = t("ui.rating.starLabel", { star, max: symbols });
      return tooltip ? `${base}, ${tooltip}` : base;
    };

    const glyph = (star: number) =>
      typeof character === "function"
        ? character(star)
        : (character ?? <Star aria-hidden="true" />);

    return (
      <div
        ref={ref}
        role="radiogroup"
        data-slot="rating"
        data-allow-half={allowHalf ? "true" : undefined}
        className={cn("ui-rating", className)}
        aria-label={rest["aria-label"] ?? t("ui.rating.ariaLabel")}
      >
        {Array.from({ length: symbols }, (_, i) => i + 1).map((star) => {
          const symbol = (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={current === star}
              aria-label={stepLabel(star)}
              disabled={disabled || readOnly}
              tabIndex={interactive && star === focusableStar ? 0 : -1}
              className={cn(
                "ui-rating-star",
                star <= display && "ui-rating-star-filled",
                allowHalf && star - 0.5 === display && "ui-rating-star-half-filled",
              )}
              onMouseEnter={() => interactive && setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => select(star)}
              onKeyDown={(e) => onKeyDown(e, star)}
            >
              {glyph(star)}
            </button>
          );
          // Without `allowHalf` the symbol IS the radio, exactly as before — no wrapper, no extra
          // node. `allowHalf` splits ONE symbol into two hit areas rather than doubling the number
          // of radios: the half is a position INSIDE a step, not a step of its own, and ten radios
          // announced for a five-star scale would be lying about the scale.
          if (!allowHalf) return symbol;
          return (
            <span key={star} data-slot="rating-symbol" className="ui-rating-symbol">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled || readOnly}
                data-slot="rating-half"
                className="ui-rating-star-half"
                onMouseEnter={() => interactive && setHover(star - 0.5)}
                onMouseLeave={() => setHover(null)}
                onClick={() => select(star - 0.5)}
              />
              {symbol}
            </span>
          );
        })}
        {name ? <input type="hidden" name={name} value={current} /> : null}
      </div>
    );
  },
);
Rating.displayName = "Rating";
