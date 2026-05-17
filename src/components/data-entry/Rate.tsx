import {
  forwardRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "../cn";

/**
 * Rate — star-rating primitive (decorative input).
 *
 *   <Rate defaultValue={3.5} allowHalf />
 *   <Rate value={4} count={5} onValueChange={setRating} />
 *   <Rate value={4} icon={<Heart />} />
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style state
 *   - `size` — `"small" | "default" | "large"` (svg sized via CSS)
 *   - `disabled` — boolean
 *   - `readOnly` — display-only (matches Input)
 *   - `count` — how many icons (default 5)
 *   - `allowHalf` — left-half-click commits 0.5 step
 *   - `icon` slot — custom icon node (per cardinal rule 23 §B `icon`
 *     slot — NEVER Ant's `character`)
 *
 * The rendered row uses lucide `Star` filled vs hollow (and `StarHalf`
 * when `allowHalf` resolves to a 0.5 fraction). When `icon` is
 * provided, the custom node is reused for filled / hollow alike with
 * `data-filled` driving the color via CSS.
 */

export type RateSize = "small" | "default" | "large";

export interface RateProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Max number of stars (default 5). */
  count?: number;
  allowHalf?: boolean;
  /** Render a custom icon instead of Star. */
  icon?: ReactNode;
  size?: RateSize;
  disabled?: boolean;
  /** Read-only display (no hover effect). */
  readOnly?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<RateSize, string> = {
  small: "rate-size-small",
  default: "rate-size-default",
  large: "rate-size-large",
};

export const Rate = forwardRef<HTMLDivElement, RateProps>(function Rate(
  {
    value,
    defaultValue = 0,
    onValueChange,
    count = 5,
    allowHalf = false,
    icon,
    size = "default",
    disabled = false,
    readOnly = false,
    className,
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? currentValue;

  const commit = (next: number) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const interactive = !disabled && !readOnly;

  const handleClick = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const next =
      allowHalf && isLeftHalf(event)
        ? index - 0.5
        : index;
    commit(next);
  };

  const handleHover = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const next =
      allowHalf && isLeftHalf(event)
        ? index - 0.5
        : index;
    setHoverValue(next);
  };

  const handleLeave = () => {
    if (!interactive) return;
    setHoverValue(null);
  };

  return (
    <div
      ref={ref}
      className={cn("rate", SIZE_CLASS[size], className)}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={handleLeave}
    >
      {Array.from({ length: count }, (_, i) => {
        const index = i + 1;
        const filled = displayValue >= index;
        const half =
          allowHalf && !filled && displayValue >= index - 0.5;
        return (
          <button
            key={index}
            type="button"
            className="rate-star"
            data-filled={filled || undefined}
            data-half={half || undefined}
            disabled={disabled}
            aria-checked={Math.ceil(currentValue) === index}
            role="radio"
            aria-label={`${index} of ${count}`}
            onClick={(event) => handleClick(index, event)}
            onMouseMove={(event) => handleHover(index, event)}
          >
            {renderIcon({ icon, filled, half })}
          </button>
        );
      })}
    </div>
  );
});

Rate.displayName = "Rate";

function isLeftHalf(event: MouseEvent<HTMLButtonElement>): boolean {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX - rect.left < rect.width / 2;
}

function renderIcon(args: {
  icon: ReactNode;
  filled: boolean;
  half: boolean;
}): ReactNode {
  if (args.icon !== undefined) {
    return args.icon;
  }
  if (args.half) {
    return <StarHalf fill="currentColor" strokeWidth={1.5} aria-hidden />;
  }
  if (args.filled) {
    return <Star fill="currentColor" strokeWidth={1.5} aria-hidden />;
  }
  return <Star fill="none" strokeWidth={1.5} aria-hidden />;
}
