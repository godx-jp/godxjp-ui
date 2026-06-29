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
  tone: Extract<BadgeTone, "success" | "warning" | "destructive" | "info" | "neutral">;
  icon: LucideIcon;
}

const STATUS_MAP: Record<string, StatusDef> = {
  active: { tone: "success", icon: CheckCircle2 },
  completed: { tone: "success", icon: CheckCircle2 },
  delivered: { tone: "success", icon: CheckCircle2 },
  done: { tone: "success", icon: CheckCircle2 },
  permanent: { tone: "success", icon: CheckCircle2 },
  succeeded: { tone: "success", icon: CheckCircle2 },
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
  "inline-flex items-center border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        dashed: "border-dashed text-foreground",
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
  /** Corner shape — `default` (badge radius) · `pill` (fully rounded) · `sharp` (square). */
  shape?: ShapeProp | null;
  tone?: BadgeTone | null;
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
  className,
  variant,
  shape,
  tone,
  icon,
  status,
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

  return (
    <div
      data-slot="badge"
      data-tone={resolvedTone}
      data-shape={shape ?? "default"}
      className={cn(
        badgeVariants({ variant: variant ?? "default", shape: shape ?? "default" }),
        badgeToneClass[resolvedTone],
        className,
      )}
      {...props}
    >
      {ResolvedIcon ? <ResolvedIcon data-slot="badge-icon" aria-hidden="true" /> : null}
      {resolvedChildren}
    </div>
  );
}
