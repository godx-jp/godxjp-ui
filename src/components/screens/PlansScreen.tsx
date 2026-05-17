import { useTranslation } from "react-i18next";
import { cn } from "../cn";

type Phase = "plan" | "do" | "check" | "act";
type Health = "ok" | "at-risk" | "off-track";

interface PlanCardData {
  id: string;
  number: number;
  title: string;
  phase: Phase;
  health: Health;
  owner: string;
  due: string;
  progress: number;
}

const PLANS: PlanCardData[] = [
  { id: "PDCA-Q2-001", number: 1, title: "OAuth migration kickoff", phase: "check", health: "at-risk", owner: "satoshi", due: "2026-06-30", progress: 64 },
  { id: "PDCA-Q2-002", number: 2, title: "Forge-service extraction (Plan #19)", phase: "do", health: "ok", owner: "naoki", due: "2026-07-14", progress: 41 },
  { id: "PDCA-Q2-003", number: 3, title: "Sandbox secrets via Vault (Plan #38)", phase: "plan", health: "ok", owner: "anh", due: "2026-08-01", progress: 12 },
  { id: "PDCA-Q2-004", number: 4, title: "Knowledge-service slug routing (Plan #18)", phase: "act", health: "ok", owner: "kira", due: "2026-05-31", progress: 92 },
];

const PHASE_LABEL: Record<Phase, string> = { plan: "Plan", do: "Do", check: "Check", act: "Act" };
const HEALTH_TONE: Record<Health, string> = {
  ok: "badge-success",
  "at-risk": "badge-warning",
  "off-track": "badge-error",
};

export interface PlansScreenProps {
  onOpenPlan: (id: string) => void;
}

export function PlansScreen({ onOpenPlan }: PlansScreenProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("nav.plans")}</h1>
          <p className="page-subtitle">{PLANS.length} plans · PDCA cycle</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">+ {t("common.new")}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onOpenPlan(plan.id)}
            className="card text-left hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">#{plan.id}</span>
              <span className="badge badge-neutral">
                <span className="dot" /> {PHASE_LABEL[plan.phase]}
              </span>
              <span className={cn("badge", HEALTH_TONE[plan.health])}>
                <span className="dot" />
                {plan.health}
              </span>
            </div>
            <h3 className="text-base font-medium mb-2">{plan.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>@{plan.owner}</span>
              <span>·</span>
              <span>{plan.due}</span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${plan.progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block tnum">{plan.progress}%</span>
          </button>
        ))}
      </div>
    </>
  );
}
