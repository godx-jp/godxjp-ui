import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../components/cn";
import { Badge } from "../../../components/data-display/Badge";
import { Card } from "../../../components/data-display/Card";
import { IconButton } from "../../../components/data-display/IconButton";
import { PageHeader } from "../../../components/data-display/PageHeader";
import { Typography } from "../../../components/general/Typography";

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
        <IconButton onClick={onBack} variant="ghost" size="sm" aria-label={t("common.back")}>
          <ArrowLeft size={14} />
        </IconButton>
        <Typography.Text color="secondary">{t("nav.plans")}</Typography.Text>
        <ChevronRight size={12} className="text-muted-foreground" />
        <Typography.Text code>{planId}</Typography.Text>
      </div>

      <PageHeader
        title="OAuth migration kickoff"
        subtitle="Q2 PDCA — moving the legacy admin login chain to OIDC end-to-end"
        actions={<Badge variant="warning">at risk</Badge>}
      />

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
              <Typography.Title size={5} className="mt-1">{t(`pdca.${p.id}`)}</Typography.Title>
              <Typography.Paragraph color="secondary" className="mt-1">{p.description}</Typography.Paragraph>
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
        <Card title={t("pdca.hypothesis")}>
          <Typography.Paragraph>
            Replacing the legacy admin password form with the OIDC chain will
            cut authentication failures by 40% within one quarter.
          </Typography.Paragraph>
          <Typography.Title size={5} className="mt-6 mb-2">{t("pdca.metrics")}</Typography.Title>
          <ul className="text-sm list-disc pl-5">
            <li>Auth failures &lt; 0.5% of attempts</li>
            <li>Time-to-sign-in &lt; 3s p95</li>
            <li>Zero password resets logged for SSO users</li>
          </ul>
          <Typography.Title size={5} className="mt-6 mb-2">{t("pdca.risks")}</Typography.Title>
          <ul className="text-sm list-disc pl-5 text-muted-foreground">
            <li>Identity-portal cookie domain drift between envs</li>
            <li>RFC 9457 problem-detail rollout coupling</li>
          </ul>
        </Card>
      )}

      {phase === "do" && (
        <Card title={t("pdca.linkedTasks")}>
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
                    <Badge variant="neutral">{task.state}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
          <Card title={t("pdca.review")}>
            <Sparkline />
          </Card>
        </>
      )}

      {phase === "act" && (
        <div className="grid grid-cols-2 gap-3">
          {ADOPTION.map((a) => (
            <Card key={a.tag} className="flex flex-col gap-2">
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: a.color }}
              >
                {a.tag}
              </span>
              <Typography.Paragraph>{a.title}</Typography.Paragraph>
            </Card>
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
