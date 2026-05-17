import { Activity, BugPlay, Rocket, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/general/Button";
import { Card } from "../../../components/data-display/Card";
import { PageHeader } from "../../../components/data-display/PageHeader";
import type { ForgeProduct } from "../products";

// DashboardScreen — product-level dashboard. KPI strip + recent
// activity + quick actions. Mirrors the design's
// `ProductDashboardScreen` (screens-1.jsx).

interface ActivityRow {
  id: string;
  type: "deploy" | "issue" | "plan";
  who: string;
  what: string;
  when: string;
}

const ACTIVITY: ActivityRow[] = [
  { id: "a1", type: "deploy", who: "satoshi", what: "production deploy v0.42.0", when: "12m" },
  { id: "a2", type: "issue", who: "naoki", what: "moved GK-310 to In Review", when: "32m" },
  { id: "a3", type: "plan", who: "anh", what: "PDCA-Q2-001 entered Check", when: "1h" },
];

export interface DashboardScreenProps {
  product: ForgeProduct;
}

export function DashboardScreen({ product }: DashboardScreenProps) {
  const { t } = useTranslation();
  const totalIssues = product.projects.reduce((s, p) => s + p.openIssues, 0);
  const totalPrs = product.projects.reduce((s, p) => s + p.prs, 0);

  return (
    <>
      <PageHeader
        title={`${product.name} · ${t("nav.dashboard")}`}
        subtitle={product.desc}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Kpi label={t("kpi.activeDevs")} value={String(product.devs)} icon={Activity} delta="+1" />
        <Kpi label={t("kpi.openIssues")} value={String(totalIssues)} icon={BugPlay} delta={`${totalPrs} PR`} />
        <Kpi label={t("kpi.deployments")} value="14" icon={Rocket} delta="+3" />
        <Kpi label={t("kpi.uptime")} value="99.94%" icon={TrendingUp} delta="30d" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card
          title={t("kpi.recentActivity")}
          className="col-span-2"
        >
          <ul className="flex flex-col gap-1">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="log-line">
                <span className="time">{a.when}</span>
                <span className={`src ${a.type === "deploy" ? "ok" : a.type === "plan" ? "" : "warn"}`}>{a.who}</span>
                <span>{a.what}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("kpi.quickActions")}>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start">{t("nav.plans")}</Button>
            <Button variant="secondary" className="justify-start">{t("nav.issues")}</Button>
            <Button variant="secondary" className="justify-start">{t("nav.ideas")}</Button>
            <Button variant="secondary" className="justify-start">{t("nav.gantt")}</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  delta,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
  delta?: string;
}) {
  // .kpi / .kpi-label / .kpi-value / .kpi-delta are documented
  // atom CSS classes (per rule 29 §A) — no React primitive yet
  // exposes "icon + value + delta" in one tile.
  return (
    <div className="kpi">
      <span className="kpi-label">
        <Icon size={14} /> {label}
      </span>
      <span className="kpi-value">{value}</span>
      {delta && <span className="kpi-delta">{delta}</span>}
    </div>
  );
}
