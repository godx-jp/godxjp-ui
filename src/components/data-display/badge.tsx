import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  type LucideIcon,
  Pause,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import {
  toneDestructiveClass,
  toneInfoClass,
  toneMutedClass,
  toneNeutralClass,
  tonePrimaryClass,
  toneSuccessClass,
  toneWarningClass,
} from "../../lib/control-styles";
import type { ShapeProp, ToneProp } from "../../props/vocabulary";

export type BadgeVariant = "default" | "secondary" | "outline" | "dashed";
/**
 * Badge tones extend the shared status `ToneProp` with a brand `primary` tone — a SOFT brand pill
 * (tinted fill + brand text), the dashboard "role pill" pattern. The status tones stay status-only;
 * for a SOLID brand fill use `variant="default"`.
 */
export type BadgeTone = ToneProp | "primary";

interface StatusDef {
  tone: Extract<BadgeTone, "default" | "success" | "warning" | "destructive" | "info" | "neutral">;
  icon: LucideIcon;
}

const STATUS_MAP: Record<string, StatusDef> = {
  active: { tone: "success", icon: CheckCircle2 },
  completed: { tone: "success", icon: CheckCircle2 },
  delivered: { tone: "success", icon: CheckCircle2 },
  done: { tone: "success", icon: CheckCircle2 },
  permanent: { tone: "success", icon: CheckCircle2 },
  succeeded: { tone: "success", icon: CheckCircle2 },
  trialing: { tone: "info", icon: Clock },
  past_due: { tone: "warning", icon: AlertCircle },
  incomplete: { tone: "default", icon: Circle },
  canceled: { tone: "destructive", icon: XCircle },
  draft: { tone: "neutral", icon: Circle },
  pending: { tone: "warning", icon: Clock },
  scheduled: { tone: "info", icon: Clock },
  sending: { tone: "info", icon: Play },
  temporary: { tone: "warning", icon: Clock },
  bounced: { tone: "destructive", icon: AlertCircle },
  cancelled: { tone: "neutral", icon: Pause },
  deleted: { tone: "destructive", icon: Trash2 },
  failed: { tone: "destructive", icon: XCircle },
  private: { tone: "neutral", icon: Circle },
  internal: { tone: "info", icon: Circle },
  public: { tone: "info", icon: Circle },
  ASSIGNMENT_STATUS_ACTIVE: { tone: "success", icon: CheckCircle2 },
  ASSIGNMENT_STATUS_SUSPENDED: { tone: "warning", icon: Pause },
  ASSIGNMENT_STATUS_TERMINATED: { tone: "destructive", icon: XCircle },
};

const badgeVariants = cva(
  "inline-flex items-center border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        dashed: "border-dashed text-foreground",
        /* `color` mode. Deliberately empty and deliberately NOT in the public
         * `BadgeVariant` union: every fill, border and text utility has to stay
         * off the element so badge-layout.css's `[data-tinted]` rule is
         * reachable (a utility beats a components-layer rule whatever the
         * specificity). Selected by the `color` prop, never by hand. */
        tinted: "",
      },
      // Corner shape — default inherits the badge radius token; pill/sharp override via the tokens.
      shape: {
        default: "",
        pill: "rounded-[var(--radius-pill)]",
        sharp: "rounded-[var(--radius-sharp)]",
      },
    },
    defaultVariants: { variant: "default", shape: "default" },
  },
);

export interface BadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<VariantProps<typeof badgeVariants>, "variant" | "shape"> {
  variant?: BadgeVariant | null;
  /**
   * Render element — `div` (default) or `span` when the chip sits in a PHRASING context and a
   * `<div>` would be invalid HTML: inside a `TabsTrigger`/`PopoverTrigger`/`Button` (all render a
   * `<button>`, whose content model is phrasing content only), inside a `<label>` or a `<p>`.
   * It swaps the TAG only — the chip's own `inline-flex` box, icon and label are unchanged, and
   * both the icon `<svg>` and the label `<span>` are already phrasing content.
   */
  as?: "div" | "span";
  /** Corner shape — `default` (badge radius) · `pill` (fully rounded) · `sharp` (square). */
  shape?: ShapeProp | null;
  tone?: BadgeTone | null;
  /**
   * The entity's OWN colour — a status colour, an issue type, a tag — as a CSS
   * colour. A third axis beside `variant` (structure) and `tone` (meaning):
   * this one carries DATA, a colour a person picked in a settings screen.
   *
   * The chip is washed rather than filled, and the reason is a contrast floor
   * rather than taste: no foreground clears WCAG AA against every colour a
   * picker can produce (near-black and white measure equal at luminance 0.2029,
   * both 4.15:1). Washing the colour `--badge-tint-fill` into
   * `--badge-tint-surface` and keeping the surface's own label makes the ratio
   * a function of the tokens instead — 8.52:1 at the defaults, worst case
   * across the sRGB cube on both themes.
   *
   * Wins over `tone` and over `variant`'s fill when both are given.
   */
  color?: string;
  icon?: React.ComponentType<{ className?: string }> | null;
  status?: string;
  children?: React.ReactNode;
}

const badgeToneClass: Record<BadgeTone, string | undefined> = {
  default: undefined,
  primary: cn("border-transparent", tonePrimaryClass),
  success: cn("border-transparent", toneSuccessClass),
  warning: cn("border-transparent", toneWarningClass),
  destructive: cn("border-transparent", toneDestructiveClass),
  info: cn("border-transparent", toneInfoClass),
  muted: cn("border-transparent", toneMutedClass),
  neutral: cn("border-transparent", toneNeutralClass),
};

export function Badge({
  as: Element = "div",
  className,
  variant,
  shape,
  tone,
  color,
  icon,
  status,
  style,
  children,
  ...props
}: BadgeProps) {
  const { t } = useTranslation();
  const statusDef = status
    ? (STATUS_MAP[status] ?? { tone: "neutral" as const, icon: Circle })
    : null;
  const resolvedTone = tone ?? statusDef?.tone ?? "default";
  const ResolvedIcon = icon === undefined ? statusDef?.icon : icon;
  const resolvedChildren =
    children ?? (status ? (status in STATUS_MAP ? t(`status.${status}`) : status) : undefined);
  const tinted = color != null && color !== "";

  return (
    <Element
      data-slot="badge"
      data-tone={tinted ? undefined : resolvedTone}
      data-tinted={tinted ? "" : undefined}
      data-shape={shape ?? "default"}
      className={cn(
        badgeVariants({
          variant: tinted ? "tinted" : (variant ?? "default"),
          shape: shape ?? "default",
        }),
        tinted ? undefined : badgeToneClass[resolvedTone],
        className,
      )}
      style={tinted ? { ...style, ["--badge-color" as string]: color } : style}
      {...props}
    >
      {ResolvedIcon ? <ResolvedIcon data-slot="badge-icon" aria-hidden="true" /> : null}
      {/* Label span so badge-layout.css can text-box-trim the line box — JP faces (Noto Sans JP,
          M PLUS 2) carry a bottom-heavy em box (ascent ≫ descent), so flex-centering the raw text
          node rides the label visibly low inside the chip. Trim needs a real box: it does not
          reach an anonymous flex item. */}
      {resolvedChildren != null ? <span data-slot="badge-label">{resolvedChildren}</span> : null}
    </Element>
  );
}

/**
 * Status-aware badge with the shared domain-status-to-tone mapping. `Badge` remains the
 * general-purpose primitive.
 */
export const StatusBadge = Badge;
