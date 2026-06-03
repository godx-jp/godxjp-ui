import * as React from "react";
import { Star } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";

export type RatingProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
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
      max = 5,
      readOnly,
      disabled,
      name,
      className,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [internal, setInternal] = React.useState(defaultValue);
    const current = value ?? internal;
    const [hover, setHover] = React.useState<number | null>(null);
    const display = hover ?? current;
    const interactive = !readOnly && !disabled;

    const select = (next: number) => {
      if (!interactive) return;
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    // Roving tabindex: only the checked star is tabbable; if nothing is checked the first star is,
    // so the radiogroup always exposes a single tab stop (APG radiogroup pattern).
    const focusableStar = current > 0 ? current : 1;

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
      if (!interactive) return;
      let next: number | null = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = Math.min(max, star + 1);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = Math.max(1, star - 1);
          break;
        case "Home":
          next = 1;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      select(next);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        data-slot="rating"
        className={cn("ui-rating", className)}
        aria-label={rest["aria-label"] ?? t("ui.rating.ariaLabel")}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={current === star}
            aria-label={t("ui.rating.starLabel", { star, max })}
            disabled={disabled || readOnly}
            tabIndex={interactive && star === focusableStar ? 0 : -1}
            className={cn("ui-rating-star", star <= display && "ui-rating-star-filled")}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => select(star)}
            onKeyDown={(e) => onKeyDown(e, star)}
          >
            <Star aria-hidden="true" />
          </button>
        ))}
        {name ? <input type="hidden" name={name} value={current} /> : null}
      </div>
    );
  },
);
Rating.displayName = "Rating";
