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
  toneNeutralClass,
  toneSuccessClass,
  toneWarningClass,
} from "../../lib/control-styles";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "neutral";

interface StatusDef {
  tone: Extract<BadgeVariant, "success" | "warning" | "destructive" | "info" | "neutral">;
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
        destructive: cn("border-transparent", toneDestructiveClass),
        outline: "text-foreground",
        success: cn("border-transparent", toneSuccessClass),
        warning: cn("border-transparent", toneWarningClass),
        info: cn("border-transparent", toneInfoClass),
        neutral: cn("border-transparent", toneNeutralClass),
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<VariantProps<typeof badgeVariants>, "variant"> {
  variant?: BadgeVariant | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  status?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant, icon, status, children, ...props }: BadgeProps) {
  const { t } = useTranslation();
  const statusDef = status ? (STATUS_MAP[status] ?? { tone: "neutral" as const, icon: Circle }) : null;
  const resolvedVariant = variant ?? statusDef?.tone ?? "default";
  const ResolvedIcon = icon === undefined ? statusDef?.icon : icon;
  const resolvedChildren =
    children ?? (status ? (status in STATUS_MAP ? t(`status.${status}`) : status) : undefined);

  return (
    <div data-slot="badge" className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {ResolvedIcon ? <ResolvedIcon data-slot="badge-icon" aria-hidden="true" /> : null}
      {resolvedChildren}
    </div>
  );
}
