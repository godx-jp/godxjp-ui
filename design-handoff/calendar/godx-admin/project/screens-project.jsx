/* global React, I, T, Badge, Avatar, Sparkline, Donut, PROJECT_KIND */
/* eslint-disable react/prop-types */

const { useState: useStPj } = React;

// ── Project Overview (Project home) ──────────────────────────────────
function ProjectOverviewScreen({ locale, product, project, setRoute }) {
  const t = T[locale];
  const k = window.PROJECT_KIND[project.kind] || window.PROJECT_KIND.service;
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "color-mix(in oklch, " + k.color + " 18%, transparent)", color: k.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <k.icon size={16}/>
            </span>
            <h1 className="page-title" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)" }}>{project.name}</h1>
            <Badge kind={project.status === "active" ? "success" : project.status === "review" ? "warning" : "neutral"}>{project.status}</Badge>
            {project.sandbox && <Badge kind="info" dot={false}>sandbox</Badge>}
          </div>
          <p className="page-subtitle">
            <span className="mono">github.com/godx-jp/{project.name}</span> · {project.branch} · {project.stack} · {project.devs} 開発者
          </p>
        </div>
        <div className="page-actions">
          {project.sandbox && (
            <button className="btn btn-secondary btn-sm" onClick={() => setRoute("j-sandbox")}>
              <I.terminal size={14}/> サンドボックス
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setRoute("j-code")}>
            <I.code size={14}/> コード
          </button>
          <button className="btn btn-primary btn-sm">
            <I.play size={14}/> デプロイ
          </button>
        </div>
      </div>

      {/* Project KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <PrjKpi label="オープン課題" value={project.openIssues} icon={I.kanban} tone="warning" onClick={() => setRoute("j-issues")}/>
        <PrjKpi label="プルリクエスト" value={project.prs} icon={I.pr} tone="info" onClick={() => setRoute("j-prs")}/>
        <PrjKpi label="ブランチ" value="14" icon={I.branch} tone="neutral" onClick={() => setRoute("j-branches")}/>
        <PrjKpi label="デプロイ (7d)" value="6" icon={I.zap} tone="success" onClick={() => setRoute("j-deploys")}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* README + recent commits */}
        <div className="col gap-3">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="row gap-2" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <I.doc size={14}/>
              <span style={{ fontWeight: 500 }}>README.md</span>
              <button className="btn btn-ghost btn-sm ml-auto"><I.pencil size={12}/> 編集</button>
            </div>
            <article className="prose" style={{ padding: 18 }}>
              <h2 style={{ marginTop: 0 }}>{project.name}</h2>
              <p className="muted">{project.kind === "service" ? "API バックエンドサービス" : project.kind === "web" ? "管理画面 (Web)" : project.kind === "desktop" ? "店舗向けデスクトップ POS" : project.kind === "workstation" ? "厨房ディスプレイ (KDS)" : project.kind === "mobile" ? "モバイルアプリ" : "ライブラリ"} — {product.name} の構成要素。</p>
              <h3>セットアップ</h3>
              <pre><code>{`$ gx project enter ${project.name}\n$ make install\n$ make run`}</code></pre>
              <h3>環境</h3>
              <ul>
                <li>Stack — <code>{project.stack}</code></li>
                <li>サンドボックス — <code>{project.sandbox ? "有効" : "未対応"}</code></li>
                <li>デフォルトブランチ — <code>{project.branch}</code></li>
              </ul>
              <p className="muted">最終更新 {project.lastCommit}</p>
            </article>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="row gap-2" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <I.branch size={14}/>
              <span style={{ fontWeight: 500 }}>最近のコミット</span>
              <span className="muted ml-auto" style={{ fontSize: 11 }}>{project.branch}</span>
            </div>
            <div>
              {[
                { hash: "a8c3f2e", msg: "feat: シフトテンプレート編集ロジック", who: "Satoshi F", time: "12分前", agent: false },
                { hash: "7b219da", msg: "fix: Mailpit 接続タイムアウト", who: "agent · claude", time: "1時間前", agent: true },
                { hash: "3e94c01", msg: "refactor: API ルーター分離", who: "Naoki N", time: "3時間前", agent: false },
                { hash: "f02a8b6", msg: "test: 勤怠 e2e Playwright", who: "Anh K", time: "昨日", agent: false },
                { hash: "d10c7e5", msg: "chore: deps 更新 (security)", who: "agent · dependabot", time: "2日前", agent: true },
              ].map((c, i) => (
                <div key={i} className="row gap-2" style={{ padding: "8px 14px", borderTop: i ? "1px solid var(--border)" : 0, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", width: 64 }}>{c.hash}</span>
                  <span style={{ flex: 1, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.msg}</span>
                  {c.agent && <Badge kind="info" dot={false}>AI</Badge>}
                  <span className="muted" style={{ fontSize: 11 }}>{c.who}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="col gap-3">
          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 8 }}>稼働状況</div>
            <div className="col gap-2">
              {[
                { label: "本番", val: "v1.4.2", tone: "success", up: "12d" },
                { label: "staging", val: "v1.5.0-rc", tone: "warning", up: "3h" },
                { label: "preview/PR-142", val: "preview", tone: "info", up: "30m" },
              ].map((d, i) => (
                <div key={i} className="row gap-2" style={{ alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: d.tone === "success" ? "oklch(60% 0.14 145)" : d.tone === "warning" ? "oklch(78% 0.15 80)" : "oklch(56% 0.15 240)" }}/>
                  <span style={{ flex: 1 }}>{d.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{d.val}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{d.up}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 8 }}>コントリビューター</div>
            <div className="col gap-2">
              {[["Satoshi F", 142], ["Naoki N", 88], ["Anh K", 47], ["agent · claude", 31]].map(([n, c], i) => (
                <div key={i} className="row gap-2" style={{ alignItems: "center" }}>
                  <Avatar name={n}/>
                  <span style={{ flex: 1, fontSize: "var(--text-xs)" }}>{n}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{c} commits</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 500, marginBottom: 8 }}>クイック</div>
            <div className="col gap-1">
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => setRoute("j-sandbox")}><I.terminal size={14}/> サンドボックス起動</button>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => setRoute("j-prs")}><I.pr size={14}/> PR レビュー</button>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => setRoute("j-agents")}><I.bot size={14}/> AI セッション</button>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }}><I.doc size={14}/> CHANGELOG</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrjKpi({ label, value, icon: Icon, tone, onClick }) {
  const c = { success: "oklch(60% 0.14 145)", warning: "oklch(78% 0.15 80)", info: "oklch(56% 0.15 240)", neutral: "oklch(60% 0 0)" }[tone] || "oklch(60% 0 0)";
  return (
    <div className="card" style={{ padding: 12, cursor: "pointer" }} onClick={onClick}>
      <div className="row gap-2" style={{ alignItems: "center", marginBottom: 6 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: "color-mix(in oklch, " + c + " 18%, transparent)", color: c, display: "grid", placeItems: "center" }}>
          <Icon size={12}/>
        </span>
        <span style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
window.ProjectOverviewScreen = ProjectOverviewScreen;

// ── Project Issues (project-scoped Kanban)
function ProjectIssuesScreen({ locale, product, project }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.issues}</h1>
          <p className="page-subtitle"><span className="mono">{project.name}</span> · {project.openIssues} オープン</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>
      <window.KanbanBoard/>
    </div>
  );
}
window.ProjectIssuesScreen = ProjectIssuesScreen;

// ── Branches
function BranchesScreen({ locale, project }) {
  const branches = [
    { name: "main", ahead: 0, behind: 0, last: "12分前 · Satoshi F", protected: true, default: true },
    { name: "develop", ahead: 8, behind: 2, last: "1時間前 · Naoki N", protected: true },
    { name: "feature/print", ahead: 3, behind: 5, last: "30分前 · Satoshi F", current: project.branch === "feature/print" },
    { name: "feature/multi-approver", ahead: 6, behind: 8, last: "2時間前 · Naoki N" },
    { name: "fix/csv-format", ahead: 1, behind: 12, last: "昨日 · Anh K" },
    { name: "agent/claude/refactor-router", ahead: 4, behind: 1, last: "30分前 · agent", agent: true },
  ];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">ブランチ</h1>
          <p className="page-subtitle"><span className="mono">{project.name}</span> · {branches.length} ブランチ</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> 新規ブランチ</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {branches.map((b, i) => (
          <div key={i} className="row gap-3" style={{ padding: "12px 16px", borderTop: i ? "1px solid var(--border)" : 0, alignItems: "center" }}>
            <I.branch size={14} style={{ color: "var(--muted-foreground)" }}/>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: b.default ? 500 : 400 }}>{b.name}</span>
            {b.default && <Badge kind="success" dot={false}>default</Badge>}
            {b.protected && <Badge kind="info" dot={false}>protected</Badge>}
            {b.current && <Badge kind="warning" dot={false}>current</Badge>}
            {b.agent && <Badge kind="info" dot={false}>AI</Badge>}
            <span className="muted ml-auto" style={{ fontSize: 11 }}>
              {b.ahead > 0 && <span style={{ color: "oklch(60% 0.14 145)" }}>↑{b.ahead}</span>}
              {b.ahead > 0 && b.behind > 0 && " · "}
              {b.behind > 0 && <span style={{ color: "oklch(58% 0.18 25)" }}>↓{b.behind}</span>}
            </span>
            <span className="muted" style={{ fontSize: 11, width: 200, textAlign: "right" }}>{b.last}</span>
            <button className="tb-icon-btn"><I.more size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
window.BranchesScreen = BranchesScreen;

// ── Pull Requests
function PRsScreen({ locale, project }) {
  const prs = [
    { id: 142, title: "feat: シフトテンプレート編集 UI", who: "Satoshi F", branch: "feature/print → main", labels: ["feature", "ui"], state: "review", checks: { ok: 8, fail: 0 }, comments: 12 },
    { id: 141, title: "fix: 勤怠申請の複数承認者バグ", who: "Naoki N", branch: "fix/multi-approver → main", labels: ["bug"], state: "approved", checks: { ok: 8, fail: 0 }, comments: 4 },
    { id: 140, title: "agent: ルーター分離リファクタリング", who: "agent · claude", branch: "agent/claude/refactor → main", labels: ["agent", "refactor"], state: "draft", checks: { ok: 6, fail: 2 }, comments: 7, agent: true },
    { id: 139, title: "chore: deps 更新", who: "agent · dependabot", branch: "deps/weekly → main", labels: ["deps", "agent"], state: "review", checks: { ok: 8, fail: 0 }, comments: 1, agent: true },
  ];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">プルリクエスト</h1>
          <p className="page-subtitle"><span className="mono">{project.name}</span> · {prs.length} オープン</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> 新規 PR</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {prs.map((pr, i) => (
          <div key={pr.id} className="row gap-3" style={{ padding: "14px 16px", borderTop: i ? "1px solid var(--border)" : 0, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "color-mix(in oklch, " + (pr.state === "approved" ? "oklch(60% 0.14 145)" : pr.state === "draft" ? "oklch(60% 0 0)" : "oklch(78% 0.15 80)") + " 18%, transparent)", color: pr.state === "approved" ? "oklch(60% 0.14 145)" : pr.state === "draft" ? "oklch(60% 0 0)" : "oklch(78% 0.15 80)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <I.pr size={14}/>
            </div>
            <div className="col" style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap-2" style={{ alignItems: "center" }}>
                <span className="muted mono" style={{ fontSize: 11 }}>#{pr.id}</span>
                <span style={{ fontWeight: 500 }}>{pr.title}</span>
                {pr.agent && <Badge kind="info" dot={false}>AI</Badge>}
                <Badge kind={pr.state === "approved" ? "success" : pr.state === "draft" ? "neutral" : "warning"}>{pr.state}</Badge>
              </div>
              <div className="row gap-2" style={{ marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
                <span className="mono">{pr.branch}</span>
                <span>· {pr.who}</span>
              </div>
              <div className="row gap-1" style={{ marginTop: 6, flexWrap: "wrap" }}>
                {pr.labels.map(l => <span key={l} className="chip" style={{ fontSize: 10 }}>{l}</span>)}
              </div>
            </div>
            <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
              <div className="row gap-2" style={{ fontSize: 11 }}>
                {pr.checks.ok > 0 && <span style={{ color: "oklch(60% 0.14 145)" }}>✓ {pr.checks.ok}</span>}
                {pr.checks.fail > 0 && <span style={{ color: "oklch(58% 0.18 25)" }}>✗ {pr.checks.fail}</span>}
                <span className="muted">💬 {pr.comments}</span>
              </div>
              <button className="btn btn-ghost btn-sm">レビュー</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.PRsScreen = PRsScreen;

// ── Deploys
function DeploysScreen({ locale, project }) {
  const deploys = [
    { env: "production", version: "v1.4.2", commit: "a8c3f2e", who: "Satoshi F", at: "12d 前", status: "live", url: project.name + ".godx.jp" },
    { env: "staging",    version: "v1.5.0-rc", commit: "7b219da", who: "Naoki N", at: "3h 前", status: "live", url: "stg-" + project.name + ".godx.jp" },
    { env: "preview/PR-142", version: "preview", commit: "3e94c01", who: "agent", at: "30m 前", status: "live", url: "pr-142-" + project.name + ".godx.jp" },
    { env: "production", version: "v1.4.1", commit: "f02a8b6", who: "Anh K", at: "20d 前", status: "old", url: "—" },
    { env: "staging",    version: "v1.5.0-beta", commit: "d10c7e5", who: "Naoki N", at: "2d 前", status: "old", url: "—" },
  ];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">デプロイ</h1>
          <p className="page-subtitle"><span className="mono">{project.name}</span> · 過去 7 日 · {deploys.filter(d=>d.status==="live").length} 稼働中</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.refresh size={14}/> 更新</button>
          <button className="btn btn-primary btn-sm"><I.zap size={14}/> 新規デプロイ</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["環境", "バージョン", "コミット", "デプロイ者", "URL", "経過", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deploys.map((d, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)", opacity: d.status === "old" ? 0.5 : 1 }}>
                <td style={{ padding: "10px 14px" }}>
                  <span className="row gap-2" style={{ alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: d.status === "live" ? (d.env.includes("prod") ? "oklch(60% 0.14 145)" : d.env.includes("staging") ? "oklch(78% 0.15 80)" : "oklch(56% 0.15 240)") : "oklch(60% 0 0)" }}/>
                    {d.env}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12 }}>{d.version}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{d.commit}</td>
                <td style={{ padding: "10px 14px" }}>{d.who}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 11 }}>{d.url !== "—" ? <a href="#" style={{ color: "var(--brand)" }}>{d.url} <I.external size={10}/></a> : <span className="muted">—</span>}</td>
                <td style={{ padding: "10px 14px" }} className="muted">{d.at}</td>
                <td style={{ padding: "10px 14px" }}><button className="tb-icon-btn"><I.more size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.DeploysScreen = DeploysScreen;
