import { Activity, BugPlay, Rocket, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ForgeProduct } from "../../../data/products";

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
      <div className="page-header">
        <div>
          <h1 className="page-title">{product.name} · {t("nav.dashboard")}</h1>
          <p className="page-subtitle">{product.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Kpi label={t("kpi.activeDevs")} value={String(product.devs)} icon={Activity} delta="+1" />
        <Kpi label={t("kpi.openIssues")} value={String(totalIssues)} icon={BugPlay} delta={`${totalPrs} PR`} />
        <Kpi label={t("kpi.deployments")} value="14" icon={Rocket} delta="+3" />
        <Kpi label={t("kpi.uptime")} value="99.94%" icon={TrendingUp} delta="30d" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <section className="card col-span-2">
          <header className="card-header">
            <h2 className="card-title">{t("kpi.recentActivity")}</h2>
          </header>
          <ul className="flex flex-col gap-1">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="log-line">
                <span className="time">{a.when}</span>
                <span className={`src ${a.type === "deploy" ? "ok" : a.type === "plan" ? "" : "warn"}`}>{a.who}</span>
                <span>{a.what}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <header className="card-header">
            <h2 className="card-title">{t("kpi.quickActions")}</h2>
          </header>
          <div className="flex flex-col gap-2">
            <button className="btn btn-secondary justify-start">{t("nav.plans")}</button>
            <button className="btn btn-secondary justify-start">{t("nav.issues")}</button>
            <button className="btn btn-secondary justify-start">{t("nav.ideas")}</button>
            <button className="btn btn-secondary justify-start">{t("nav.gantt")}</button>
          </div>
        </section>
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
