import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../components/cn";

type Phase = "plan" | "do" | "check" | "act";

const PHASES: Array<{ id: Phase; description: string }> = [
  { id: "plan", description: "Frame the goal + design contract" },
  { id: "do", description: "Execute + track progress" },
  { id: "check", description: "Measure outcomes + review" },
  { id: "act", description: "Standardize + roll out" },
];

const LINKED_TASKS = [
  { id: "GK-310", title: "Wire sticky QuickComposer", owner: "naoki", state: "in-progress" },
  { id: "GK-301", title: "SSE retry on token expire", owner: "satoshi", state: "review" },
  { id: "GK-302", title: "Forge nav grouping", owner: "kira", state: "review" },
];

const KPI = [
  { label: "Activation rate", value: "62%", delta: "+8" },
  { label: "Time to first plan", value: "4m12s", delta: "-22s" },
  { label: "Plans per dev", value: "1.4", delta: "+0.3" },
  { label: "Hypothesis hit", value: "3/5", delta: "" },
];

const ADOPTION = [
  { tag: "ADOPT", title: "Sticky QuickComposer is now default", color: "var(--success)" },
  { tag: "TRY", title: "Markdown preview in modal — gather 1 sprint feedback", color: "var(--info)" },
  { tag: "DROP", title: "Auto-save every keystroke (too aggressive)", color: "var(--destructive)" },
  { tag: "PARK", title: "AI-suggested labels (waiting on plan #21 G18)", color: "var(--muted-foreground)" },
];

// PlanDetailScreen — PDCA cycle visualizer. Click phase pill to swap
// the body view. Static handoff data — caller swaps in real backend
// payload in a later phase. Mirrors design's PlanDetailScreen
// (screens-detail.jsx).
export interface PlanDetailScreenProps {
  planId: string;
  onBack: () => void;
  onOpenIssue: (id: string) => void;
}

export function PlanDetailScreen({ planId, onBack, onOpenIssue }: PlanDetailScreenProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("check");

  return (
    <>
      <div className="flex items-center gap-2 mb-4 text-xs">
        <button onClick={onBack} className="tb-icon-btn" aria-label={t("common.back")}>
          <ArrowLeft size={14} />
        </button>
        <span className="text-muted-foreground">{t("nav.plans")}</span>
        <ChevronRight size={12} className="text-muted-foreground" />
        <span className="font-mono">{planId}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">OAuth migration kickoff</h1>
          <p className="page-subtitle">
            Q2 PDCA — moving the legacy admin login chain to OIDC end-to-end
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-warning">
            <span className="dot" /> at risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {PHASES.map((p, idx) => {
          const active = p.id === phase;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhase(p.id)}
              className={cn("relative card text-left transition-colors", active && "border-primary")}
              aria-current={active}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Step {idx + 1}
              </span>
              <h3 className="text-base font-medium mt-1">{t(`pdca.${p.id}`)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              {idx < PHASES.length - 1 && (
                <ChevronRight
                  size={14}
                  className="absolute -right-2.5 top-1/2 -translate-y-1/2 bg-background border border-border rounded-full text-muted-foreground"
                />
              )}
            </button>
          );
        })}
      </div>

      {phase === "plan" && (
        <section className="card">
          <h2 className="card-title mb-3">{t("pdca.hypothesis")}</h2>
          <p className="text-sm">
            Replacing the legacy admin password form with the OIDC chain will
            cut authentication failures by 40% within one quarter.
          </p>
          <h3 className="card-title mt-6 mb-2">{t("pdca.metrics")}</h3>
          <ul className="text-sm list-disc pl-5">
            <li>Auth failures &lt; 0.5% of attempts</li>
            <li>Time-to-sign-in &lt; 3s p95</li>
            <li>Zero password resets logged for SSO users</li>
          </ul>
          <h3 className="card-title mt-6 mb-2">{t("pdca.risks")}</h3>
          <ul className="text-sm list-disc pl-5 text-muted-foreground">
            <li>Identity-portal cookie domain drift between envs</li>
            <li>RFC 9457 problem-detail rollout coupling</li>
          </ul>
        </section>
      )}

      {phase === "do" && (
        <section className="card">
          <h2 className="card-title mb-3">{t("pdca.linkedTasks")}</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {LINKED_TASKS.map((task) => (
                <tr key={task.id} onClick={() => onOpenIssue(task.id)} className="cursor-pointer">
                  <td className="mono">{task.id}</td>
                  <td>{task.title}</td>
                  <td className="muted">@{task.owner}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <span className="dot" /> {task.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {phase === "check" && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {KPI.map((k) => (
              <div key={k.label} className="kpi">
                <span className="kpi-label">{k.label}</span>
                <span className="kpi-value">{k.value}</span>
                {k.delta && (
                  <span className={cn("kpi-delta", k.delta.startsWith("-") && "down")}>{k.delta}</span>
                )}
              </div>
            ))}
          </div>
          <section className="card">
            <h2 className="card-title mb-3">{t("pdca.review")}</h2>
            <Sparkline />
          </section>
        </>
      )}

      {phase === "act" && (
        <div className="grid grid-cols-2 gap-3">
          {ADOPTION.map((a) => (
            <div key={a.tag} className="card flex flex-col gap-2">
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: a.color }}
              >
                {a.tag}
              </span>
              <p className="text-sm">{a.title}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Sparkline() {
  const points = [12, 14, 16, 13, 18, 22, 19, 24, 28, 26, 30, 34, 31, 38];
  const max = Math.max(...points);
  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 100},${100 - (y / max) * 80}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="spark" style={{ height: 80 }}>
      <path d={`${path} L100,100 L0,100 Z`} className="area" />
      <path d={path} className="line" />
    </svg>
  );
}
