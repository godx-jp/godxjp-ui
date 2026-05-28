// StatusBadge — globally consistent status display. Adding a new status:
// extend STATUS_MAP below + add key to i18n JSON (`status.*`), never inline `<Badge>`.
import * as React from "react";
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

type Tone = "success" | "warning" | "destructive" | "info" | "neutral";

interface StatusDef {
  tone: Tone;
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

const TONE_CLASSES: Record<Tone, string> = {
  success: toneSuccessClass,
  warning: toneWarningClass,
  destructive: toneDestructiveClass,
  info: toneInfoClass,
  neutral: toneNeutralClass,
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: React.ReactNode;
}

export function StatusBadge({ status, className, label: labelOverride }: StatusBadgeProps) {
  const { t } = useTranslation();
  const def = STATUS_MAP[status] ?? { tone: "neutral" as const, icon: Circle };
  const Icon = def.icon;
  const resolvedLabel = labelOverride ?? (status in STATUS_MAP ? t(`status.${status}`) : status);

  return (
    <span data-slot="status-badge" className={cn(TONE_CLASSES[def.tone], className)}>
      <Icon data-slot="status-badge-icon" aria-hidden="true" />
      <span>{resolvedLabel}</span>
    </span>
  );
}
