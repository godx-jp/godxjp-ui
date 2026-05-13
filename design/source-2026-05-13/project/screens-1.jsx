/* global React, I, cx, Badge, Avatar, Sparkline, Donut, T */
/* eslint-disable react/prop-types */

const { useState: useS } = React;

// ── Dashboard ────────────────────────────────────────────────────────
function DashboardScreen({ locale, product }) {
  const t = T[locale];
  const [tab, setTab] = useS("overview");
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.dashboard}</h1>
          <p className="page-subtitle">{product.name} · 全体の状態とアクティビティ</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.refresh size={14}/> 更新</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {["overview","activity","alerts"].map(x => (
          <div key={x} className="tab" data-active={tab===x} onClick={() => setTab(x)}>
            {x === "overview" ? t.overview : x === "activity" ? t.activity : "アラート"}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <KPI label={t.activeDevs} value="14" delta="+2" sparkData={[8,9,11,10,12,13,14]} />
        <KPI label={t.openIssues} value="38" delta="-5" down sparkData={[55,52,48,45,43,40,38]} />
        <KPI label={t.deployments} value="27" delta="+12" sparkData={[12,15,14,18,21,24,27]} />
        <KPI label={t.uptime} value="99.97%" delta="+0.02" sparkData={[99.92,99.93,99.95,99.94,99.96,99.97,99.97]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t.recentActivity}</h3>
            <button className="btn btn-ghost btn-sm ml-auto"><I.filter size={14}/></button>
          </div>
          <div className="col gap-1">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="log-line">
                <span className="time">{a.time}</span>
                <span className={`src ${a.kind}`}>{a.src}</span>
                <span><span className="muted">{a.who}</span> · {a.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col gap-3">
          <div className="card">
            <div className="card-header"><h3 className="card-title">プロジェクト健全性</h3></div>
            <div className="row gap-3">
              <Donut value={87} />
              <div className="col gap-1" style={{ flex: 1 }}>
                <div className="row gap-2"><span className="dot" style={{ background: "var(--success)" }}/><span style={{ fontSize: "var(--text-xs)" }}>正常 12</span></div>
                <div className="row gap-2"><span className="dot" style={{ background: "var(--warning)" }}/><span style={{ fontSize: "var(--text-xs)" }}>注意 2</span></div>
                <div className="row gap-2"><span className="dot" style={{ background: "var(--error)" }}/><span style={{ fontSize: "var(--text-xs)" }}>停止 0</span></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t.quickActions}</h3></div>
            <div className="col gap-1">
              <QuickAct icon={I.users} label="開発者を追加" />
              <QuickAct icon={I.folder} label="プロジェクトを作成" />
              <QuickAct icon={I.globe} label="ドメインを同期" />
              <QuickAct icon={I.bot} label="AIエージェントを設定" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t.projects}</h3>
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>14 件</span>
            <div className="ml-auto row gap-2">
              <input className="input" placeholder="検索…" style={{ width: 200, height: "var(--density-element-sm)" }}/>
              <button className="btn btn-secondary btn-sm"><I.filter size={14}/></button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr><th>プロジェクト</th><th>開発者</th><th>ステータス</th><th className="num">課題</th><th className="num">最終更新</th><th></th></tr>
            </thead>
            <tbody>
              {PROJECTS_LIST.map((p,i) => (
                <tr key={i}>
                  <td><div className="row gap-2"><span className="sb-logo-mark" style={{ background: p.color }}>{p.name[0].toUpperCase()}</span><div className="col"><span style={{ fontWeight: 500 }}>{p.name}</span><span className="mono muted">{p.slug}</span></div></div></td>
                  <td><div className="row gap-1">{p.devs.map((d,j) => <Avatar key={j} name={d}/>)}<span className="muted" style={{ fontSize: "var(--text-xs)" }}>+{p.more}</span></div></td>
                  <td><Badge kind={p.status}>{p.statusLabel}</Badge></td>
                  <td className="num tnum">{p.issues}</td>
                  <td className="num tnum muted">{p.updated}</td>
                  <td><button className="tb-icon-btn"><I.more size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const KPI = ({ label, value, delta, down, sparkData }) => (
  <div className="kpi">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    <div className="row gap-2" style={{ alignItems: "center" }}>
      <span className={cx("kpi-delta", down && "down")}>{down ? <I.arrowDown size={12}/> : <I.arrowUp size={12}/>}{delta}</span>
      <div style={{ flex: 1, marginLeft: 4 }}><Sparkline data={sparkData} /></div>
    </div>
  </div>
);
const QuickAct = ({ icon: Ico, label }) => (
  <div className="sb-nav-item" style={{ height: 32 }}><span className="sb-icon"><Ico size={16}/></span><span className="sb-label">{label}</span><I.chevronRight size={14}/></div>
);

const ACTIVITY = [
  { time: "13:42", src: "ok", kind: "ok", who: "f-satoshi", msg: "godx-kintai @ master を再起動" },
  { time: "13:38", src: "deploy", kind: "ok", who: "alice", msg: "betoya/api を本番にデプロイ #2741" },
  { time: "13:24", src: "agent", kind: "", who: "claude-code", msg: "セッション #4521 でPRを作成 #1284" },
  { time: "13:19", src: "auth", kind: "warn", who: "f-naoto", msg: "SSHキー回転を要求" },
  { time: "12:58", src: "db", kind: "", who: "system", msg: "godx_kintai_alice をバックアップ (412 MB)" },
  { time: "12:41", src: "warn", kind: "warn", who: "tempo", msg: "URL_API のヘルスチェックが502を3回連続" },
  { time: "12:30", src: "ok", kind: "ok", who: "f-satoshi", msg: "issue #284「シフト承認」を解決" },
  { time: "12:14", src: "build", kind: "", who: "ci", msg: "frontend ビルド完了 — 1m 24s" },
  { time: "11:58", src: "err", kind: "err", who: "mailpit", msg: "f-naoto の SMTP 配信失敗 — 再試行中" },
];
const PROJECTS_LIST = [
  { name: "godx-kintai", slug: "kintai", color: "oklch(56% 0.15 240)", devs: ["S F","A K","N N"], more: 2, status: "success", statusLabel: "稼働中", issues: 38, updated: "13:42" },
  { name: "godx-tempo", slug: "tempo", color: "oklch(48% 0.16 285)", devs: ["A K","M T"], more: 1, status: "success", statusLabel: "稼働中", issues: 24, updated: "13:38" },
  { name: "betoya-api", slug: "betoya", color: "oklch(58% 0.159 150)", devs: ["A K"], more: 0, status: "warning", statusLabel: "注意", issues: 6, updated: "12:41" },
  { name: "godx-auth", slug: "auth", color: "oklch(56% 0.15 240)", devs: ["S F","M T"], more: 0, status: "success", statusLabel: "稼働中", issues: 12, updated: "11:24" },
  { name: "godx-cms-base", slug: "cms", color: "oklch(48% 0.16 285)", devs: ["N N"], more: 0, status: "info", statusLabel: "開発中", issues: 8, updated: "昨日" },
];

window.DashboardScreen = DashboardScreen;

// ── Workspace (project) ──────────────────────────────────────────────
function WorkspaceScreen({ locale }) {
  const t = T[locale];
  const [tab, setTab] = useS("issues");
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <span className="sb-logo-mark" style={{ background: "oklch(56% 0.15 240)" }}>K</span>
            <h1 className="page-title" style={{ margin: 0 }}>godx-kintai</h1>
            <Badge kind="success">稼働中</Badge>
          </div>
          <p className="page-subtitle"><span className="mono">github.com/godx-jp/godx-kintai</span> · master · 3 開発者</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.book size={14}/> {t.wiki}</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[["issues",t.issues,I.kanban],["gantt",t.gantt,I.layers],["wiki",t.wiki,I.book],["plans",t.plans,I.shield],["ideas",t.ideas,I.lightbulb]].map(([id,label,Ico]) => (
          <div key={id} className="tab" data-active={tab===id} onClick={() => setTab(id)}>
            <span className="row gap-1"><Ico size={14}/> {label}</span>
          </div>
        ))}
      </div>

      {tab === "issues" && <KanbanBoard />}
      {tab === "gantt" && <GanttView />}
      {tab === "wiki" && <WikiView />}
      {tab === "plans" && <PlansView />}
      {tab === "ideas" && <IdeasView />}
    </div>
  );
}

function KanbanBoard() {
  const cols = [
    { title: "BACKLOG", count: 12, items: [
      { id: "GK-321", title: "シフト印刷の日付フォーマット修正", labels: ["bug","print"], assignee: "S F" },
      { id: "GK-318", title: "勤怠申請に承認者を複数選択", labels: ["enhancement"], assignee: "N N" },
      { id: "GK-315", title: "Mailpit 接続先のヘルスチェック", labels: ["infra"], assignee: "A K" },
    ]},
    { title: "IN PROGRESS", count: 4, items: [
      { id: "GK-310", title: "シフトテンプレート機能", labels: ["feature","ui"], assignee: "S F" },
      { id: "GK-308", title: "OKLCH チャートカラー差し替え", labels: ["design"], assignee: "N N" },
    ]},
    { title: "REVIEW", count: 3, items: [
      { id: "GK-305", title: "betoya テナント切替 e2e", labels: ["test"], assignee: "A K" },
    ]},
    { title: "DONE", count: 28, items: [
      { id: "GK-302", title: "ヘッダー高さを 48px に統一", labels: ["design"], assignee: "S F" },
      { id: "GK-301", title: "JP/VI ロケールピッカー", labels: ["i18n"], assignee: "N N" },
    ]},
  ];
  return (
    <div className="kanban">
      {cols.map((c, i) => (
        <div key={i} className="kanban-col">
          <div className="kanban-col-head"><span>{c.title}</span><span className="kanban-col-count">{c.count}</span><button className="tb-icon-btn ml-auto" style={{ width: 20, height: 20 }}><I.plus size={12}/></button></div>
          {c.items.map(it => (
            <div key={it.id} className="issue-card" style={{ cursor: "pointer" }} onClick={() => window.openIssueDetail && window.openIssueDetail(it.id)}>
              <span className="issue-id">{it.id}</span>
              <span className="issue-title">{it.title}</span>
              <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                {it.labels.map(l => <span key={l} className="chip" style={{ fontSize: 10 }}>{l}</span>)}
              </div>
              <div className="row gap-2" style={{ alignItems: "center" }}>
                <Avatar name={it.assignee}/>
                <span className="muted ml-auto" style={{ fontSize: "var(--text-2xs)" }}><I.link size={10}/> 2</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function GanttView() {
  // Day-grid Gantt — godx-kintai 2026 Q2 roadmap.
  const TOTAL_WEEKS = 8;
  const TOTAL_DAYS = TOTAL_WEEKS * 7;
  const COL = 28; // px / day
  const ROW = 36; // px / row
  const HEADER = 64;
  const TODAY_INDEX = 12;

  const swimlanes = [
    { id: "plan",   label: "PDCA · 計画",  color: "oklch(70% 0.10 250)" },
    { id: "feat",   label: "機能開発",      color: "oklch(60% 0.14 145)" },
    { id: "ops",    label: "運用・インフラ", color: "oklch(72% 0.14 70)"  },
    { id: "design", label: "デザイン",      color: "oklch(58% 0.16 320)" },
  ];

  // start = day index from horizon start; span = duration in days; pct = progress
  // deps = list of task ids this row depends on (FS = finish-to-start)
  const tasks = [
    { lane: "plan",   id: "PDCA-Q2", title: "Q2 計画立案",                 owner: "S F", start: 0,  span: 6,  pct: 100 },
    { lane: "plan",   id: "PDCA-RV", title: "Q1 振り返り",                 owner: "N N", start: 4,  span: 4,  pct: 100, deps: ["PDCA-Q2"] },
    { lane: "feat",   id: "GK-310",  title: "シフトテンプレート機能",        owner: "S F", start: 6,  span: 14, pct: 55, milestone: 20, milestoneLabel: "v1.4 リリース", deps: ["PDCA-Q2"] },
    { lane: "feat",   id: "GK-318",  title: "勤怠申請に複数承認者",          owner: "N N", start: 10, span: 9,  pct: 30, deps: ["GK-310"] },
    { lane: "feat",   id: "GK-321",  title: "シフト印刷フォーマット修正",     owner: "S F", start: 14, span: 5,  pct: 0,  blocked: "プリンタドライバ調査待ち", deps: ["GK-310"] },
    { lane: "ops",    id: "INF-12",  title: "Mailpit ヘルスチェック",        owner: "A K", start: 2,  span: 4,  pct: 100 },
    { lane: "ops",    id: "INF-14",  title: "MariaDB バックアップ運用",       owner: "A K", start: 8,  span: 7,  pct: 70 },
    { lane: "ops",    id: "INF-15",  title: "betoya パフォーマンス検証",      owner: "A K", start: 16, span: 8,  pct: 10, deps: ["INF-14"] },
    { lane: "design", id: "DS-08",   title: "OKLCH チャートカラー差し替え",   owner: "N N", start: 5,  span: 9,  pct: 80 },
    { lane: "design", id: "DS-11",   title: "wa-iro パレット適用ガイド",       owner: "N N", start: 18, span: 10, pct: 0,  deps: ["DS-08"] },
  ];

  // Layout: assign absolute Y position per task (accounting for swimlane header rows)
  const layout = [];
  let y = 0;
  for (const lane of swimlanes) {
    const laneStartY = y;
    y += 28; // lane label row height
    const laneTasks = tasks.filter(t => t.lane === lane.id);
    laneTasks.forEach(task => {
      layout.push({ ...task, laneColor: lane.color, top: y });
      y += ROW;
    });
    lane._height = y - laneStartY;
  }
  const TIMELINE_HEIGHT = y;
  const byId = Object.fromEntries(layout.map(t => [t.id, t]));

  // Reference date 2026-05-08
  const today = new Date(2026, 4, 8);
  const start = new Date(today); start.setDate(today.getDate() - TODAY_INDEX);
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, w) => {
    const d = new Date(start); d.setDate(start.getDate() + w * 7);
    return { idx: w + 1, label: `${d.getMonth()+1}/${d.getDate()}`, sprint: w < 4 ? "Sprint 12" : "Sprint 13" };
  });

  // Selected task — defaults to GK-310 (the most active card)
  const [selectedId, setSelectedId] = useS("GK-310");
  const selected = byId[selectedId];

  // Resource utilization per day (count of active tasks per owner)
  const owners = ["S F", "N N", "A K"];
  const utilization = owners.map(o => {
    const arr = Array.from({ length: TOTAL_DAYS }, () => 0);
    for (const t of tasks) {
      if (t.owner !== o) continue;
      for (let d = t.start; d < t.start + t.span; d++) arr[d] += 1;
    }
    return { owner: o, days: arr, max: Math.max(...arr, 1) };
  });

  // Stats
  const stats = {
    onTrack:  tasks.filter(t => t.pct > 0 && t.pct < 100 && !t.blocked).length,
    done:     tasks.filter(t => t.pct === 100).length,
    blocked:  tasks.filter(t => t.blocked).length,
    overdue:  tasks.filter(t => (t.start + t.span) < TODAY_INDEX && t.pct < 100 && !t.blocked).length,
    milestones: tasks.filter(t => t.milestone != null).length,
  };

  return (
    <div className="col gap-3 fade-in">
      {/* KPI strip */}
      <div className="row gap-3" style={{ flexWrap: "wrap" }}>
        <KpiTile label="完了" value={stats.done} hint="全タスク中" tone="success"/>
        <KpiTile label="進行中" value={stats.onTrack} hint="予定通り" tone="info"/>
        <KpiTile label="ブロック" value={stats.blocked} hint="要対応" tone={stats.blocked ? "error" : "muted"}/>
        <KpiTile label="遅延" value={stats.overdue} hint="期限超過" tone={stats.overdue ? "warning" : "muted"}/>
        <KpiTile label="マイルストーン" value={stats.milestones} hint="本クォーター" tone="muted"/>
        <div className="grow"/>
        <div className="row gap-1" style={{ alignItems: "center" }}>
          <span className="muted" style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.05em" }}>進捗</span>
          <div style={{ width: 140, height: 6, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden" }}>
            <div style={{ width: `${Math.round(tasks.reduce((s,t) => s + t.pct, 0) / tasks.length)}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-wakatake, oklch(72% 0.14 145)) 0%, var(--primary) 100%)" }}/>
          </div>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, fontFeatureSettings: "'tnum'" }}>{Math.round(tasks.reduce((s,t) => s + t.pct, 0) / tasks.length)}%</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row gap-2" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <span style={{ fontWeight: 500 }}>2026 Q2 ロードマップ</span>
          <Badge kind="info">8週間</Badge>
          <span className="muted" style={{ fontSize: "var(--text-xs)" }}>· {tasks.length} タスク · {swimlanes.length} スイムレーン · 4 依存関係</span>
          <div className="row gap-1 ml-auto">
            <button className="btn btn-ghost btn-sm"><I.filter size={14}/> フィルタ</button>
            <div className="row" style={{ background: "var(--surface-2)", borderRadius: 6, padding: 2 }}>
              <button className="btn btn-secondary btn-sm" style={{ height: 24, padding: "0 10px" }}>日</button>
              <button className="btn btn-ghost btn-sm" style={{ height: 24, padding: "0 10px" }}>週</button>
              <button className="btn btn-ghost btn-sm" style={{ height: 24, padding: "0 10px" }}>月</button>
            </div>
            <button className="btn btn-primary btn-sm"><I.plus size={14}/> タスク</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "260px 1fr 280px" : "260px 1fr" }}>
          {/* LEFT: task list */}
          <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{ height: HEADER, padding: "0 12px", display: "flex", alignItems: "flex-end", paddingBottom: 8, borderBottom: "1px solid var(--border)", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>タスク</div>
            {swimlanes.map(lane => {
              const laneRows = tasks.filter(t => t.lane === lane.id);
              return (
                <React.Fragment key={lane.id}>
                  <div style={{ height: 28, padding: "0 12px", display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", background: "var(--surface-3)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: lane.color }}/>
                    {lane.label}
                    <span style={{ marginLeft: "auto", fontSize: 10 }}>{laneRows.length}</span>
                  </div>
                  {laneRows.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className="row gap-2"
                      style={{
                        height: ROW, padding: "0 12px", alignItems: "center",
                        borderTop: "1px solid var(--border)", fontSize: "var(--text-xs)", cursor: "pointer",
                        background: selectedId === t.id ? "color-mix(in oklch, " + lane.color + " 12%, var(--surface-1))" : "transparent",
                        borderLeft: selectedId === t.id ? "2px solid " + lane.color : "2px solid transparent"
                      }}>
                      <span className="mono muted" style={{ fontSize: 10, width: 56, flexShrink: 0 }}>{t.id}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.title}</span>
                      {t.blocked && <span style={{ color: "var(--accent-shu, oklch(62% 0.18 35))", fontSize: 12 }}>●</span>}
                      <Avatar name={t.owner}/>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>

          {/* CENTER: timeline */}
          <div style={{ overflowX: "auto", position: "relative" }}>
            <div style={{ width: TOTAL_DAYS * COL, position: "relative" }}>
              {/* header — sprints + weeks */}
              <div style={{ height: HEADER, borderBottom: "1px solid var(--border)", position: "relative" }}>
                {/* sprint band */}
                <div style={{ display: "flex", height: 22, borderBottom: "1px dashed var(--border)" }}>
                  {[{label:"Sprint 12", days: 28}, {label:"Sprint 13", days: 28}].map((s, i) => (
                    <div key={i} style={{ width: s.days * COL, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", borderRight: i === 0 ? "1px solid var(--border)" : undefined, background: i % 2 ? "color-mix(in oklch, var(--surface-2) 50%, transparent)" : "transparent" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? "var(--accent-wakatake, oklch(72% 0.14 145))" : "var(--accent-gunjo, oklch(56% 0.15 250))" }}/>
                      {s.label}
                    </div>
                  ))}
                </div>
                {/* week cells */}
                <div style={{ display: "flex", height: HEADER - 22 }}>
                  {weeks.map((w, i) => (
                    <div key={i} style={{ width: 7 * COL, padding: "6px 8px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>WEEK {w.idx}</span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>{w.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* timeline body */}
              <div style={{ position: "relative", height: TIMELINE_HEIGHT }}>
                {/* bg grid */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {Array.from({ length: TOTAL_DAYS }, (_, d) => (
                    <div key={d} style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: d * COL, width: COL,
                      borderRight: d % 7 === 6 ? "1px solid var(--border)" : "1px dashed color-mix(in oklch, var(--border) 50%, transparent)",
                      background: (Math.floor(d / 7)) % 2 ? "color-mix(in oklch, var(--surface-2) 30%, transparent)" : "transparent"
                    }}/>
                  ))}
                </div>

                {/* swimlane label row backgrounds */}
                {swimlanes.map((lane, i) => {
                  const offset = swimlanes.slice(0, i).reduce((s, l) => s + l._height, 0);
                  return (
                    <div key={lane.id} style={{
                      position: "absolute", left: 0, right: 0,
                      top: offset, height: 28,
                      background: "var(--surface-3)",
                      borderBottom: "1px solid var(--border)"
                    }}/>
                  );
                })}

                {/* today line */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: TODAY_INDEX * COL, width: 2,
                  background: "var(--accent-akane, oklch(58% 0.18 25))",
                  zIndex: 4
                }}>
                  <div style={{
                    position: "absolute", top: -HEADER + 26, left: -22,
                    width: 44, padding: "2px 6px", textAlign: "center",
                    fontSize: 10, fontWeight: 600,
                    color: "var(--background)",
                    background: "var(--accent-akane, oklch(58% 0.18 25))",
                    borderRadius: 4, letterSpacing: "0.05em"
                  }}>今日</div>
                </div>

                {/* SVG layer for dependency arrows */}
                <svg width={TOTAL_DAYS * COL} height={TIMELINE_HEIGHT} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M0,0 L10,5 L0,10 Z" fill="oklch(50% 0.02 280)"/>
                    </marker>
                  </defs>
                  {layout.flatMap(t => (t.deps || []).map(depId => {
                    const dep = byId[depId];
                    if (!dep) return null;
                    const x1 = (dep.start + dep.span) * COL;
                    const y1 = dep.top + ROW/2;
                    const x2 = t.start * COL;
                    const y2 = t.top + ROW/2;
                    const midX = x1 + 8;
                    const stroke = selectedId === t.id || selectedId === depId ? "var(--primary)" : "color-mix(in oklch, var(--muted-foreground) 50%, transparent)";
                    const sw = selectedId === t.id || selectedId === depId ? 1.5 : 1;
                    return (
                      <path
                        key={t.id + "-" + depId}
                        d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2 - 4} ${y2}`}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={sw}
                        strokeDasharray={selectedId === t.id ? "0" : "3 2"}
                        markerEnd="url(#arrow)"
                      />
                    );
                  }))}
                </svg>

                {/* Bars */}
                {layout.map(t => {
                  const isSel = selectedId === t.id;
                  const bg = t.blocked
                    ? "repeating-linear-gradient(45deg, color-mix(in oklch, " + t.laneColor + " 35%, transparent) 0 6px, color-mix(in oklch, " + t.laneColor + " 15%, transparent) 6px 12px)"
                    : "color-mix(in oklch, " + t.laneColor + " 20%, var(--surface-1))";
                  return (
                    <div key={t.id} style={{ position: "absolute", left: t.start * COL + 4, top: t.top + 6, width: t.span * COL - 8, height: ROW - 12, zIndex: isSel ? 3 : 1 }}>
                      <div onClick={() => setSelectedId(t.id)}
                        style={{
                          position: "relative", width: "100%", height: "100%",
                          background: bg,
                          border: `${isSel ? 2 : 1}px solid ${t.laneColor}`,
                          borderRadius: 6,
                          display: "flex", alignItems: "center", padding: "0 8px",
                          fontSize: 11, fontWeight: 500, color: "var(--foreground)",
                          overflow: "hidden", whiteSpace: "nowrap",
                          cursor: "pointer",
                          boxShadow: isSel ? "0 4px 12px color-mix(in oklch, " + t.laneColor + " 30%, transparent)" : "none",
                          transition: "box-shadow .15s, border-width .15s"
                        }}>
                        {t.pct > 0 && !t.blocked && (
                          <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0,
                            width: `${t.pct}%`,
                            background: "color-mix(in oklch, " + t.laneColor + " 38%, transparent)",
                            borderRadius: "5px 0 0 5px"
                          }}/>
                        )}
                        <span style={{ position: "relative", textOverflow: "ellipsis", overflow: "hidden", flex: 1 }}>
                          {t.title}
                        </span>
                        <span className="mono" style={{ position: "relative", fontSize: 10, fontWeight: 600, marginLeft: 6, fontFeatureSettings: "'tnum'", color: t.blocked ? "var(--accent-shu, oklch(62% 0.18 35))" : "var(--muted-foreground)" }}>
                          {t.blocked ? "BLOCKED" : t.pct + "%"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Milestone markers */}
                {layout.filter(t => t.milestone != null).map(t => (
                  <div key={t.id + "-ms"} style={{ position: "absolute", left: t.milestone * COL - 7, top: t.top + ROW/2 - 7, zIndex: 5 }}>
                    <div style={{
                      width: 14, height: 14,
                      background: "var(--accent-yamabuki, oklch(78% 0.15 80))",
                      transform: "rotate(45deg)",
                      border: "1.5px solid var(--foreground)",
                      boxShadow: "0 0 0 3px var(--surface-1)"
                    }}/>
                    {t.milestoneLabel && (
                      <div style={{
                        position: "absolute", left: 16, top: -4,
                        whiteSpace: "nowrap",
                        fontSize: 10, fontWeight: 600,
                        padding: "2px 6px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--accent-yamabuki, oklch(78% 0.15 80))",
                        borderRadius: 4
                      }}>★ {t.milestoneLabel}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Resource utilization heatmap */}
              <div style={{ borderTop: "2px solid var(--border)", background: "var(--surface-2)" }}>
                <div style={{ padding: "8px 12px", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  リソース稼働率 / 日
                </div>
                {utilization.map(u => (
                  <div key={u.owner} className="row" style={{ height: 22, alignItems: "center", borderTop: "1px solid var(--border)" }}>
                    {u.days.map((load, d) => {
                      const intensity = load / 3; // normalize to 0..1 (3 = overload)
                      const bg = load === 0 ? "transparent" :
                        load >= 3 ? "var(--accent-shu, oklch(62% 0.18 35))" :
                        load === 2 ? "color-mix(in oklch, var(--accent-yamabuki, oklch(78% 0.15 80)) 70%, transparent)" :
                                     "color-mix(in oklch, var(--accent-wakatake, oklch(72% 0.14 145)) 50%, transparent)";
                      return (
                        <div key={d} style={{
                          width: COL, height: "100%",
                          background: bg,
                          borderRight: d % 7 === 6 ? "1px solid var(--border)" : undefined,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 600, color: load >= 2 ? "var(--background)" : "var(--muted-foreground)"
                        }}>{load > 0 ? load : ""}</div>
                      );
                    })}
                  </div>
                ))}
                {/* owner labels overlaid on the left edge */}
              </div>
            </div>
          </div>

          {/* RIGHT: detail panel */}
          {selected && (
            <div style={{ borderLeft: "1px solid var(--border)", padding: 16, overflowY: "auto", background: "var(--surface-1)" }}>
              <div className="row gap-2" style={{ alignItems: "flex-start", marginBottom: 12 }}>
                <div className="col grow gap-1">
                  <span className="mono muted" style={{ fontSize: 10 }}>{selected.id}</span>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 500, margin: 0 }}>{selected.title}</h3>
                </div>
                <button className="tb-icon-btn" onClick={() => setSelectedId(null)}><I.x size={14}/></button>
              </div>
              <div className="col gap-3">
                <div className="row gap-2">
                  {selected.blocked && <Badge kind="error">ブロック中</Badge>}
                  {!selected.blocked && selected.pct === 100 && <Badge kind="success">完了</Badge>}
                  {!selected.blocked && selected.pct > 0 && selected.pct < 100 && <Badge kind="info">進行中</Badge>}
                  {!selected.blocked && selected.pct === 0 && <Badge>未着手</Badge>}
                  <span className="chip">{swimlanes.find(l => l.id === selected.lane).label}</span>
                </div>

                <div>
                  <div className="muted" style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.05em", marginBottom: 4 }}>進捗</div>
                  <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden" }}>
                    <div style={{ width: `${selected.pct}%`, height: "100%", background: selected.laneColor }}/>
                  </div>
                  <div className="row" style={{ marginTop: 4, fontSize: "var(--text-2xs)" }}>
                    <span className="mono" style={{ fontFeatureSettings: "'tnum'" }}>{selected.pct}%</span>
                    <span className="muted ml-auto">{selected.span} 日 · {selected.span * 6}h 見積</span>
                  </div>
                </div>

                <div className="col gap-1">
                  <div className="row" style={{ fontSize: "var(--text-xs)" }}>
                    <span className="muted">担当</span>
                    <span className="ml-auto row gap-1" style={{ alignItems: "center" }}><Avatar name={selected.owner}/> {selected.owner}</span>
                  </div>
                  <div className="row" style={{ fontSize: "var(--text-xs)" }}>
                    <span className="muted">期間</span>
                    <span className="ml-auto mono" style={{ fontFeatureSettings: "'tnum'" }}>D{selected.start} → D{selected.start + selected.span}</span>
                  </div>
                  <div className="row" style={{ fontSize: "var(--text-xs)" }}>
                    <span className="muted">優先度</span>
                    <span className="ml-auto">{selected.blocked ? "高" : "中"}</span>
                  </div>
                </div>

                {selected.blocked && (
                  <div style={{ padding: 10, borderRadius: 6, background: "color-mix(in oklch, var(--accent-shu, oklch(62% 0.18 35)) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--accent-shu, oklch(62% 0.18 35)) 35%, transparent)", fontSize: "var(--text-xs)" }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>ブロック要因</div>
                    <div className="muted">{selected.blocked}</div>
                  </div>
                )}

                {selected.deps && selected.deps.length > 0 && (
                  <div className="col gap-1">
                    <div className="muted" style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.05em" }}>依存タスク</div>
                    {selected.deps.map(d => {
                      const dep = byId[d];
                      if (!dep) return null;
                      return (
                        <div key={d} onClick={() => setSelectedId(d)} className="row gap-2" style={{ padding: "6px 8px", borderRadius: 4, cursor: "pointer", background: "var(--surface-2)", fontSize: "var(--text-xs)" }}>
                          <span className="mono muted" style={{ fontSize: 10 }}>{dep.id}</span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dep.title}</span>
                          {dep.pct === 100 && <I.check size={12}/>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected.milestoneLabel && (
                  <div style={{ padding: 10, borderRadius: 6, background: "color-mix(in oklch, var(--accent-yamabuki, oklch(78% 0.15 80)) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--accent-yamabuki, oklch(78% 0.15 80)) 40%, transparent)", fontSize: "var(--text-xs)" }}>
                    <div className="row gap-1" style={{ alignItems: "center", marginBottom: 2 }}>
                      <span style={{ width: 8, height: 8, background: "var(--accent-yamabuki, oklch(78% 0.15 80))", transform: "rotate(45deg)", display: "inline-block", border: "1px solid var(--foreground)" }}/>
                      <span style={{ fontWeight: 500 }}>{selected.milestoneLabel}</span>
                    </div>
                    <div className="muted">D{selected.milestone} で達成予定</div>
                  </div>
                )}

                <hr className="divider"/>

                <div className="col gap-2">
                  <button className="btn btn-primary btn-sm"><I.external size={14}/> 課題を開く</button>
                  <button className="btn btn-secondary btn-sm"><I.branch size={14}/> 関連ブランチを表示</button>
                  <button className="btn btn-ghost btn-sm"><I.bot size={14}/> AI エージェントに作業させる</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / legend */}
        <div className="row gap-4" style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", flexWrap: "wrap", alignItems: "center" }}>
          <span className="row gap-1"><span style={{ width: 14, height: 8, borderRadius: 2, background: "color-mix(in oklch, oklch(60% 0.14 145) 20%, var(--surface-1))", border: "1px solid oklch(60% 0.14 145)" }}/> 期間バー</span>
          <span className="row gap-1"><span style={{ width: 14, height: 8, borderRadius: 2, background: "color-mix(in oklch, oklch(60% 0.14 145) 38%, transparent)" }}/> 進捗</span>
          <span className="row gap-1"><span style={{ width: 8, height: 8, background: "var(--accent-yamabuki, oklch(78% 0.15 80))", transform: "rotate(45deg)", border: "1px solid var(--foreground)", display: "inline-block" }}/> マイルストーン</span>
          <span className="row gap-1"><span style={{ width: 14, height: 8, borderRadius: 2, background: "repeating-linear-gradient(45deg, oklch(60% 0.14 145 / 35%) 0 4px, transparent 4px 8px)", border: "1px solid oklch(60% 0.14 145)" }}/> ブロック</span>
          <span className="row gap-1"><svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="oklch(50% 0.02 280)" strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arrow)"/></svg> 依存</span>
          <span className="row gap-1"><span style={{ width: 2, height: 12, background: "var(--accent-akane, oklch(58% 0.18 25))" }}/> 今日</span>
          <span className="ml-auto muted">タスクをクリックで詳細</span>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, hint, tone = "muted" }) {
  const toneColor = {
    success: "var(--accent-wakatake, oklch(72% 0.14 145))",
    info:    "var(--accent-gunjo, oklch(56% 0.15 250))",
    warning: "var(--accent-yamabuki, oklch(78% 0.15 80))",
    error:   "var(--accent-shu, oklch(62% 0.18 35))",
    muted:   "var(--muted-foreground)",
  }[tone];
  return (
    <div className="card" style={{ padding: "10px 14px", minWidth: 120, flex: "0 0 auto", borderLeft: "3px solid " + toneColor }}>
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
      <div className="row gap-2" style={{ alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--text-2xl)", fontWeight: 500, fontFeatureSettings: "'tnum'", color: "var(--foreground)" }}>{value}</span>
        <span className="muted" style={{ fontSize: "var(--text-2xs)" }}>{hint}</span>
      </div>
    </div>
  );
}


function WikiView() {
  return (
    <div className="wiki-layout">
      <aside className="wiki-toc">
        <div style={{ fontWeight: 500, color: "var(--foreground)", padding: "0 8px 8px" }}>ページ</div>
        <a className="active" href="#">Onboarding</a>
        <a href="#">アーキテクチャ概要</a>
        <a href="#">godx.yaml リファレンス</a>
        <a href="#">テナント追加手順</a>
        <a href="#">DB バックアップ運用</a>
      </aside>
      <article className="prose">
        <h1>Onboarding — godx-kintai</h1>
        <p className="muted">最終更新 2026-05-08 · 編集者 f-satoshi</p>
        <p>このページは新しい開発者が <code>godx-kintai</code> プロジェクトに参加する際の最短手順をまとめたものです。Famgia 管理者からアカウントが発行された後、最初に読む文書として設計されています。</p>
        <h2>1. 前提</h2>
        <ul>
          <li>Famgia 管理者から <strong>Linux ユーザ</strong> が作成済みであること</li>
          <li>SSH 公開鍵が <code>~/.ssh/authorized_keys</code> に登録済みであること</li>
          <li>tmux Web ターミナルにアクセスできること</li>
        </ul>
        <h2>2. 初回起動</h2>
        <pre><code>{"$ gx project enter godx-kintai\n$ cd backend && cp .env.example .env\n$ make run"}</code></pre>
        <blockquote>
          <p><strong>注意</strong> — netns 内で動作するため <code>127.0.0.1</code> ではなく <code>${"{DB_HOST}"}</code> を使用してください。</p>
        </blockquote>
        <h2>3. 関連ページ</h2>
        <ul>
          <li><a href="#">[[godx-yaml-domains]]</a></li>
          <li><a href="#">[[deploy]]</a></li>
        </ul>
      </article>
      <aside className="wiki-toc">
        <div style={{ fontWeight: 500, color: "var(--foreground)", padding: "0 8px 8px" }}>このページ</div>
        <a href="#">前提</a>
        <a href="#">初回起動</a>
        <a href="#">関連ページ</a>
        <hr className="divider"/>
        <div style={{ fontWeight: 500, color: "var(--foreground)", padding: "0 8px 8px" }}>バックリンク (3)</div>
        <a href="#">README</a>
        <a href="#">runbooks/dev-onboarding</a>
        <a href="#">team-handbook</a>
      </aside>
    </div>
  );
}

function PlansView() {
  return (
    <div className="col gap-3">
      {[
        { phase: "PLAN", title: "Q2: シフト承認フローの簡素化", owner: "S F", status: "info", date: "2026-04-01" },
        { phase: "DO", title: "勤怠CSV出力のフォーマット統一", owner: "N N", status: "warning", date: "2026-04-15" },
        { phase: "CHECK", title: "betoya テナント パフォーマンス検証", owner: "A K", status: "success", date: "2026-05-01" },
        { phase: "ACT", title: "OKLCH トークン化 — 全プロダクト適用", owner: "S F", status: "success", date: "2026-05-08" },
      ].map((p,i) => (
        <div key={i} className="card row gap-4" style={{ cursor: "pointer" }} onClick={() => window.openPlanDetail && window.openPlanDetail("PDCA-Q2-001")}>
          <div className="col" style={{ width: 60 }}>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>{p.phase}</span>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>{p.date}</span>
          </div>
          <div className="grow">
            <div style={{ fontWeight: 500 }}>{p.title}</div>
            <div className="muted" style={{ fontSize: "var(--text-xs)" }}>担当 {p.owner} · 決定 3件 · 振り返り 1件</div>
          </div>
          <Badge kind={p.status}>{p.phase}</Badge>
        </div>
      ))}
    </div>
  );
}

function IdeasView() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {[
        { title: "AIエージェントによる勤怠異常検知", appetite: "6週間", risk: "Medium", likes: 7 },
        { title: "店長向けモバイル承認モード", appetite: "2週間", risk: "Low", likes: 12 },
        { title: "wa-iro チャートカラーの自動割り当て", appetite: "2週間", risk: "Low", likes: 4 },
        { title: "godx-yaml の WYSIWYG エディタ", appetite: "6週間", risk: "High", likes: 9 },
      ].map((p, i) => (
        <div key={i} className="card">
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <Badge kind="info">Pitch</Badge>
            <Badge kind={p.risk === "High" ? "error" : p.risk === "Medium" ? "warning" : "success"}>{p.risk}</Badge>
            <span className="muted ml-auto" style={{ fontSize: "var(--text-xs)" }}>♡ {p.likes}</span>
          </div>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
          <div className="muted" style={{ fontSize: "var(--text-xs)" }}>Appetite — {p.appetite}</div>
          <hr className="divider"/>
          <div className="muted" style={{ fontSize: "var(--text-xs)" }}>「もしこの予算 ({p.appetite}) でできたら投資する価値があるか？」を判定する Shape Up ピッチ。</div>
        </div>
      ))}
    </div>
  );
}

window.WorkspaceScreen = WorkspaceScreen;
window.KanbanBoard = KanbanBoard;
window.GanttView = GanttView;
window.WikiView = WikiView;
window.PlansView = PlansView;
window.IdeasView = IdeasView;
