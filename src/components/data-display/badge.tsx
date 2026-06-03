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
  toneSuccessClass,
  toneWarningClass,
} from "../../lib/control-styles";
import type { ToneProp } from "../../props/vocabulary";

export type BadgeVariant = "default" | "secondary" | "outline";
export type BadgeTone = ToneProp;

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
  "inline-flex items-center border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<VariantProps<typeof badgeVariants>, "variant"> {
  variant?: BadgeVariant | null;
  tone?: BadgeTone | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  status?: string;
  children?: React.ReactNode;
}

const badgeToneClass: Record<BadgeTone, string | undefined> = {
  default: undefined,
  success: cn("border-transparent", toneSuccessClass),
  warning: cn("border-transparent", toneWarningClass),
  destructive: cn("border-transparent", toneDestructiveClass),
  info: cn("border-transparent", toneInfoClass),
  muted: cn("border-transparent", toneMutedClass),
  neutral: cn("border-transparent", toneNeutralClass),
};

export function Badge({ className, variant, tone, icon, status, children, ...props }: BadgeProps) {
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
      className={cn(
        badgeVariants({ variant: variant ?? "default" }),
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
