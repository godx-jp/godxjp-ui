/* global React, I, T, Badge, Avatar, Sparkline, Donut, PROJECT_KIND */
/* eslint-disable react/prop-types */

const { useState: useStP } = React;

// ── Product Dashboard ─────────────────────────────────────────────────
function ProductDashboardScreen({ locale, product, openProject }) {
  const t = T[locale];
  const projects = product.projects;
  const totals = {
    issues: projects.reduce((s, p) => s + p.openIssues, 0),
    prs: projects.reduce((s, p) => s + p.prs, 0),
    sandbox: projects.filter(p => p.sandbox).length,
    devs: product.devs,
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <span className="sb-logo-mark" style={{ background: product.color, width: 28, height: 28, fontSize: 14 }}>
              {product.name[0].toUpperCase()}
            </span>
            <h1 className="page-title" style={{ margin: 0 }}>{product.name}</h1>
            <Badge kind="success">稼働中</Badge>
          </div>
          <p className="page-subtitle">
            {product.role} · {product.desc} · オーナー {product.owner}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.book size={14}/> {t.wiki}</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> プロジェクトを追加</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <KpiCard label={t.projects} value={projects.length} hint={`${projects.filter(p=>p.status==="active").length} active`} icon={I.folder} tone="info"/>
        <KpiCard label={t.issues} value={totals.issues} hint="across all projects" icon={I.kanban} tone="warning"/>
        <KpiCard label={t.prs} value={totals.prs} hint={`${totals.prs} 待ちレビュー`} icon={I.pr} tone="info"/>
        <KpiCard label={t.activeDevs} value={totals.devs} hint={`${totals.sandbox} sandboxes`} icon={I.users} tone="success"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* Project grid */}
        <div className="col gap-3">
          <div className="row gap-2" style={{ alignItems: "baseline" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 500, margin: 0 }}>{t.projects}</h2>
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>· {projects.length} 件</span>
            <button className="btn btn-ghost btn-sm ml-auto"><I.filter size={14}/> フィルタ</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onOpen={() => openProject(p)}/>
            ))}
          </div>
        </div>

        {/* Right rail — recent activity + quick actions */}
        <div className="col gap-3">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{t.recentActivity}</span>
              <Badge kind="neutral" dot={false}>24h</Badge>
            </div>
            <div className="col" style={{ padding: 8 }}>
              {[
                { who: "S F", what: "GK-310 シフトテンプレート", repo: "restaurant-pos", kind: "commit", time: "12分前" },
                { who: "N N", what: "PR #142 マージ", repo: "restaurant-admin", kind: "pr", time: "1時間前" },
                { who: "A K", what: "サンドボックス起動", repo: "restaurant-api", kind: "sandbox", time: "2時間前" },
                { who: "S F", what: "アイデア追加: KDS タッチ最適化", repo: "—", kind: "idea", time: "3時間前" },
                { who: "N N", what: "GK-318 ステータス変更 → Review", repo: "restaurant-kintai", kind: "issue", time: "5時間前" },
              ].map((a, i) => (
                <div key={i} className="row gap-2" style={{ padding: "6px 8px", alignItems: "center", borderRadius: "var(--radius-sm)" }}>
                  <Avatar name={a.who}/>
                  <div className="col" style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.what}</span>
                    <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{a.repo}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 10 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 8 }}>{t.quickActions}</div>
            <div className="col gap-1">
              {[
                { icon: I.plus, label: "新規プロジェクト" },
                { icon: I.kanban, label: "課題を作成" },
                { icon: I.lightbulb, label: "アイデアをピッチ" },
                { icon: I.users, label: "メンバーを招待" },
              ].map((q, i) => (
                <button key={i} className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }}>
                  <q.icon size={14}/> {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  const k = window.PROJECT_KIND[project.kind] || window.PROJECT_KIND.service;
  const statusColor = project.status === "active"
    ? "oklch(60% 0.14 145)"
    : project.status === "review"
    ? "oklch(78% 0.15 80)"
    : "oklch(60% 0 0)";
  return (
    <div className="card" style={{ cursor: "pointer", padding: 0, overflow: "hidden", transition: "transform .15s ease, box-shadow .15s ease" }}
      onClick={onOpen}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ height: 4, background: k.color }}/>
      <div style={{ padding: 14 }}>
        <div className="row gap-2" style={{ alignItems: "center", marginBottom: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "color-mix(in oklch, " + k.color + " 18%, transparent)", color: k.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <k.icon size={14}/>
          </span>
          <div className="col grow" style={{ minWidth: 0 }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
            <span className="muted" style={{ fontSize: 11 }}>{project.stack}</span>
          </div>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "color-mix(in oklch, " + statusColor + " 15%, transparent)", color: statusColor, fontWeight: 500 }}>
            {k.label}
          </span>
        </div>

        <div className="row gap-3" style={{ marginTop: 12, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          <span className="row gap-1"><I.branch size={12}/> {project.branch}</span>
          <span className="row gap-1"><I.kanban size={12}/> {project.openIssues}</span>
          <span className="row gap-1"><I.pr size={12}/> {project.prs}</span>
          <span className="row gap-1"><I.users size={12}/> {project.devs}</span>
          {project.sandbox && (
            <span className="row gap-1 ml-auto" style={{ color: "oklch(60% 0.14 145)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "currentColor" }}/> sandbox
            </span>
          )}
        </div>

        <div className="muted" style={{ fontSize: 10, marginTop: 8, fontFamily: "var(--font-mono)" }}>
          最終コミット {project.lastCommit}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, icon: Icon, tone }) {
  const toneColor = {
    info: "oklch(56% 0.15 240)", success: "oklch(60% 0.14 145)",
    warning: "oklch(78% 0.15 80)", error: "oklch(58% 0.18 25)",
  }[tone] || "oklch(60% 0 0)";
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row gap-2" style={{ alignItems: "center", marginBottom: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: "color-mix(in oklch, " + toneColor + " 18%, transparent)", color: toneColor, display: "grid", placeItems: "center" }}>
          <Icon size={14}/>
        </span>
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{value}</div>
      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{hint}</div>
    </div>
  );
}

window.ProductDashboardScreen = ProductDashboardScreen;

// ── Projects List ─────────────────────────────────────────────────────
function ProjectsListScreen({ locale, product, openProject }) {
  const t = T[locale];
  const [filter, setFilter] = useStP("all");
  const [view, setView] = useStP("grid");
  const projects = product.projects;
  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.projects}</h1>
          <p className="page-subtitle">{product.name} に属するすべてのプロジェクト · {projects.length} 件</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> 新規プロジェクト</button>
        </div>
      </div>

      <div className="row gap-2" style={{ marginBottom: 16 }}>
        <div className="row gap-1">
          {["all", "active", "review", "planning"].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`} onClick={() => setFilter(f)}>
              {f === "all" ? "すべて" : f === "active" ? "active" : f === "review" ? "review" : "planning"}
              <span className="muted" style={{ marginLeft: 4 }}>{f === "all" ? projects.length : projects.filter(p => p.status === f).length}</span>
            </button>
          ))}
        </div>
        <div className="row gap-1 ml-auto">
          <button className={`tb-icon-btn ${view === "grid" ? "is-active" : ""}`} onClick={() => setView("grid")} title="Grid"><I.layers size={14}/></button>
          <button className={`tb-icon-btn ${view === "list" ? "is-active" : ""}`} onClick={() => setView("list")} title="List"><I.kanban size={14}/></button>
        </div>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {filtered.map(p => <ProjectCard key={p.id} project={p} onOpen={() => openProject(p)}/>)}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table" style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {["プロジェクト", "種別", "ブランチ", "課題", "PR", "Dev", "最終更新", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const k = window.PROJECT_KIND[p.kind] || window.PROJECT_KIND.service;
                return (
                  <tr key={p.id} onClick={() => openProject(p)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div className="row gap-2" style={{ alignItems: "center" }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: "color-mix(in oklch, " + k.color + " 18%, transparent)", color: k.color, display: "grid", placeItems: "center" }}>
                          <k.icon size={12}/>
                        </span>
                        <div className="col">
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{p.name}</span>
                          <span className="muted" style={{ fontSize: 11 }}>{p.stack}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}><Badge kind="neutral" dot={false}>{k.label}</Badge></td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.branch}</td>
                    <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{p.openIssues}</td>
                    <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{p.prs}</td>
                    <td style={{ padding: "10px 14px" }}>{p.devs}</td>
                    <td style={{ padding: "10px 14px" }} className="muted">{p.lastCommit}</td>
                    <td style={{ padding: "10px 14px" }}><I.chevronRight size={14}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
window.ProjectsListScreen = ProjectsListScreen;

// ── Product Issues / Plans / Ideas / Gantt / Wiki — wrappers re-using existing views
function ProductIssuesScreen({ locale, product }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.issues}</h1>
          <p className="page-subtitle">{product.name} 全体の課題 — Product Owner ビュー · {product.projects.reduce((s,p)=>s+p.openIssues,0)} 件オープン</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.filter size={14}/> プロジェクト</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>
      <window.KanbanBoard/>
    </div>
  );
}
function ProductPlansScreen({ locale, product }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.plans}</h1>
          <p className="page-subtitle">{product.name} の PDCA サイクル — 計画・実行・評価・改善</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>
      <window.PlansView/>
    </div>
  );
}
function ProductIdeasScreen({ locale, product }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.ideas}</h1>
          <p className="page-subtitle">{product.name} のアイデアプール — Shape Up Pitch</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> ピッチ</button>
        </div>
      </div>
      <window.IdeasView/>
    </div>
  );
}
function ProductGanttScreen({ locale, product }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.gantt}</h1>
          <p className="page-subtitle">{product.name} のロードマップ — 全プロジェクト横断 · 8週間ホライズン</p>
        </div>
      </div>
      <window.GanttView/>
    </div>
  );
}
function ProductWikiScreen({ locale, product }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.wiki}</h1>
          <p className="page-subtitle">{product.name} の知識ベース · オンボーディング・運用</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> ページ</button>
        </div>
      </div>
      <window.WikiView/>
    </div>
  );
}
window.ProductIssuesScreen = ProductIssuesScreen;
window.ProductPlansScreen = ProductPlansScreen;
window.ProductIdeasScreen = ProductIdeasScreen;
window.ProductGanttScreen = ProductGanttScreen;
window.ProductWikiScreen = ProductWikiScreen;

// ── Members
function MembersScreen({ locale, product }) {
  const t = T[locale];
  const members = [
    { name: "Satoshi F", role: "Product Owner", projects: ["api", "admin", "pos"], devs: 3, last: "5分前" },
    { name: "Naoki N",   role: "Tech Lead",     projects: ["api", "admin", "kintai"], devs: 2, last: "20分前" },
    { name: "Anh K",     role: "Backend Dev",   projects: ["api", "kintai"], devs: 1, last: "1時間前" },
    { name: "Mari T",    role: "Frontend Dev",  projects: ["admin", "pos", "mobile"], devs: 1, last: "3時間前" },
    { name: "Hiro S",    role: "Designer",      projects: ["admin", "pos"], devs: 0, last: "昨日" },
    { name: "Yuna K",    role: "QA",            projects: ["api", "admin"], devs: 0, last: "2日前" },
  ];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.members}</h1>
          <p className="page-subtitle">{product.name} のチーム · {members.length} 人</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> 招待</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["メンバー", "ロール", "プロジェクト", "サンドボックス", "最終アクセス", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <Avatar name={m.name}/>
                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}><Badge kind="neutral" dot={false}>{m.role}</Badge></td>
                <td style={{ padding: "10px 14px" }}>
                  <div className="row gap-1">
                    {m.projects.map(pid => {
                      const p = product.projects.find(pp => pp.id === pid);
                      if (!p) return null;
                      const k = window.PROJECT_KIND[p.kind] || window.PROJECT_KIND.service;
                      return <span key={pid} className="chip" style={{ fontSize: 10, fontFamily: "var(--font-mono)", background: "color-mix(in oklch, " + k.color + " 12%, transparent)", color: k.color, borderColor: "color-mix(in oklch, " + k.color + " 30%, transparent)" }}>{p.name.split("-").pop()}</span>;
                    })}
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{m.devs > 0 ? <span className="row gap-1"><span style={{ width: 6, height: 6, borderRadius: 99, background: "oklch(60% 0.14 145)" }}/>{m.devs}</span> : <span className="muted">—</span>}</td>
                <td style={{ padding: "10px 14px" }} className="muted">{m.last}</td>
                <td style={{ padding: "10px 14px" }}><button className="tb-icon-btn"><I.more size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.MembersScreen = MembersScreen;
