import * as React from "react";
import { Star } from "lucide-react";

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

    return (
      <div
        ref={ref}
        role="radiogroup"
        data-slot="rating"
        className={cn("ui-rating", className)}
        aria-label={rest["aria-label"] ?? "評価"}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={current === star}
            aria-label={String(star)}
            disabled={disabled || readOnly}
            tabIndex={interactive ? 0 : -1}
            className={cn("ui-rating-star", star <= display && "ui-rating-star-filled")}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => select(star)}
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
