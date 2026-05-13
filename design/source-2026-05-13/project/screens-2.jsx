/* global React, I, cx, Badge, Avatar, Sparkline, Donut, T */
/* eslint-disable react/prop-types */

const { useState: useS2 } = React;

// ── Dev panel ────────────────────────────────────────────────────────
function DevPanelScreen({ locale }) {
  const t = T[locale];
  const [running, setRunning] = useS2(true);
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>f-satoshi</h1>
            <Badge kind="success">オンライン</Badge>
            <span className="muted mono" style={{ fontSize: "var(--text-xs)" }}>10.42.7.2 · uid 1007</span>
          </div>
          <p className="page-subtitle">godx-kintai · 個別の開発者ワークスペース</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.refresh size={14}/> 再起動</button>
          <button className="btn btn-danger btn-sm"><I.power size={14}/> オフボード</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <ServiceCard icon={I.terminal} title={t.tmuxSession} state="running" detail="3 panes · 2h 14m" />
        <ServiceCard icon={I.code} title={t.codeServer} state="running" detail=":8443 · v4.92" />
        <ServiceCard icon={I.mail} title={t.mailpit} state="running" detail=":11007 · 24 messages" />
        <ServiceCard icon={I.database} title={t.database} state="ready" detail="MariaDB · 3 DBs" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "10px 16px", marginBottom: 0 }}>
            <h3 className="card-title">{t.runningApps}</h3>
            <span className="badge badge-neutral" style={{ marginLeft: 8 }} dot={false}><span className="dot pulse" style={{ background: "var(--success)" }}/>2 起動中</span>
            <button className="btn btn-ghost btn-sm ml-auto" onClick={() => setRunning(!running)}>{running ? <><I.square size={12}/>停止</> : <><I.play size={12}/>起動</>}</button>
          </div>
          <table className="table">
            <thead><tr><th>ラベル</th><th>パス</th><th>ポート</th><th>URL</th><th>状態</th></tr></thead>
            <tbody>
              <tr><td className="mono">api</td><td className="mono muted">backend</td><td className="num mono tnum">9100</td><td className="mono"><a href="#" style={{ color: "var(--primary)" }}>api-kintai-f-satoshi.local.godx.jp</a></td><td><Badge kind="success">起動中</Badge></td></tr>
              <tr><td className="mono">app</td><td className="mono muted">frontend</td><td className="num mono tnum">9101</td><td className="mono"><a href="#" style={{ color: "var(--primary)" }}>app-kintai-f-satoshi.local.godx.jp</a></td><td><Badge kind="success">起動中</Badge></td></tr>
              <tr><td className="mono">storybook</td><td className="mono muted">frontend</td><td className="num mono tnum">9102</td><td className="muted">—</td><td><Badge kind="neutral">停止</Badge></td></tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ padding: "10px 16px", marginBottom: 0, background: "var(--surface-2)" }}>
            <h3 className="card-title row gap-2"><I.terminal size={14}/> tmux: f-satoshi</h3>
            <div className="ml-auto row gap-1">
              <button className="tb-icon-btn" style={{ width: 24, height: 24 }}><I.refresh size={12}/></button>
              <button className="tb-icon-btn" style={{ width: 24, height: 24 }}><I.external size={12}/></button>
            </div>
          </div>
          <div style={{ background: "oklch(18% 0.005 60)", color: "oklch(85% 0.005 60)", padding: 12, fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.6, height: 280, overflow: "auto" }}>
            <div style={{ color: "oklch(72% 0.13 155)" }}>satoshi@famgia ~/godx-kintai $ <span style={{ color: "oklch(85% 0.005 60)" }}>make run</span></div>
            <div style={{ color: "oklch(70% 0.005 60)" }}>{"=>"} omnify generate ... <span style={{ color: "oklch(72% 0.13 155)" }}>OK</span></div>
            <div style={{ color: "oklch(70% 0.005 60)" }}>{"=>"} go run ./cmd/server</div>
            <div style={{ color: "oklch(78% 0.13 240)" }}>2026/05/08 13:42:11 ▸ Listening on :9100</div>
            <div style={{ color: "oklch(78% 0.13 240)" }}>2026/05/08 13:42:11 ▸ DB connected (mariadb 10.42.0.1:3306/godx_kintai_f_satoshi)</div>
            <div style={{ color: "oklch(78% 0.13 240)" }}>2026/05/08 13:42:11 ▸ Mailpit at 10.42.0.1:11007</div>
            <div style={{ color: "oklch(80% 0.17 85)" }}>2026/05/08 13:42:18 [WARN] config: ADMIN_SSH_HOSTNAME unset (optional)</div>
            <div style={{ color: "oklch(72% 0.13 155)" }}>2026/05/08 13:42:24 [HTTP] GET  /api/health 200 8ms</div>
            <div style={{ color: "oklch(72% 0.13 155)" }}>2026/05/08 13:42:31 [HTTP] POST /api/auth/login 200 142ms</div>
            <div style={{ color: "oklch(70% 0.005 60)" }}>satoshi@famgia ~/godx-kintai $ <span className="pulse">▌</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-header"><h3 className="card-title">{t.database}</h3></div>
        <table className="table">
          <thead><tr><th>DB 名</th><th>サイズ</th><th>テーブル</th><th>最終バックアップ</th><th></th></tr></thead>
          <tbody>
            <tr><td className="mono">godx_kintai_f_satoshi</td><td className="num tnum">412 MB</td><td className="num tnum">87</td><td className="muted">12:58</td><td><div className="row gap-1"><button className="btn btn-ghost btn-sm"><I.copy size={12}/></button><button className="btn btn-ghost btn-sm">phpMyAdmin <I.external size={12}/></button></div></td></tr>
            <tr><td className="mono">godx_tempo_f_satoshi</td><td className="num tnum">88 MB</td><td className="num tnum">42</td><td className="muted">昨日</td><td><div className="row gap-1"><button className="btn btn-ghost btn-sm"><I.copy size={12}/></button><button className="btn btn-ghost btn-sm">phpMyAdmin <I.external size={12}/></button></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
const ServiceCard = ({ icon: Ico, title, state, detail }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div className="row gap-2"><Ico size={16}/><span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{title}</span><span className="ml-auto"><Badge kind={state === "running" ? "success" : "info"}>{state}</Badge></span></div>
    <div className="muted" style={{ fontSize: "var(--text-xs)" }}>{detail}</div>
  </div>
);
window.DevPanelScreen = DevPanelScreen;

// ── Agent platform ───────────────────────────────────────────────────
function AgentScreen({ locale }) {
  const t = T[locale];
  const [tab, setTab] = useS2("skills");
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.agents}</h1>
          <p className="page-subtitle">スキル · ツール · エージェント · セッション — すべて admin で管理</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.book size={14}/> ガイド</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[["skills",t.skills,I.zap],["tools",t.tools,I.settings],["agents","エージェント",I.bot],["sessions",t.sessions,I.terminal]].map(([id,label,Ico]) => (
          <div key={id} className="tab" data-active={tab===id} onClick={() => setTab(id)}><span className="row gap-1"><Ico size={14}/> {label}</span></div>
        ))}
      </div>

      {tab === "skills" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { name: "code-review", desc: "PR を読み、リスクと改善点を返す", uses: 142, kind: "system" },
            { name: "wiki-author", desc: "Markdown wiki を共通スタイルで生成", uses: 89, kind: "user" },
            { name: "deploy-runbook", desc: "本番デプロイ前のチェックリスト確認", uses: 47, kind: "user" },
            { name: "kintai-anomaly", desc: "勤怠データから異常パターンを検出", uses: 23, kind: "user" },
            { name: "schema-migrate", desc: "Omnify schema 変更の影響範囲を提示", uses: 12, kind: "system" },
            { name: "i18n-sync", desc: "ja/en/vi 翻訳キーの欠落を補完", uses: 8, kind: "user" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="row gap-2"><span className="sb-logo-mark" style={{ background: "color-mix(in oklch, var(--brand) 20%, transparent)", color: "var(--brand)" }}><I.zap size={12}/></span><span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{s.name}</span><Badge kind={s.kind === "system" ? "info" : "neutral"}>{s.kind}</Badge></div>
              <div className="muted" style={{ fontSize: "var(--text-xs)", lineHeight: 1.6 }}>{s.desc}</div>
              <div className="row gap-3 muted" style={{ fontSize: "var(--text-2xs)", marginTop: "auto" }}>
                <span>{s.uses} 回使用</span>
                <span className="ml-auto row gap-1"><button className="btn btn-ghost btn-sm"><I.pencil size={12}/></button><button className="btn btn-ghost btn-sm">使用 <I.chevronRight size={12}/></button></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "tools" && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>名前</th><th>プロバイダー</th><th>権限</th><th>最終使用</th><th>呼び出し</th><th></th></tr></thead>
            <tbody>
              {[
                { name: "godx (MCP)", provider: "@godx-jp/cli", scope: "all-resources", used: "1分前", calls: "12,481" },
                { name: "github", provider: "OAuth App", scope: "repo:read", used: "5分前", calls: "3,210" },
                { name: "playwright", provider: "Local", scope: "browser", used: "1時間前", calls: "184" },
                { name: "filesystem", provider: "Local", scope: "/workspace", used: "3分前", calls: "8,902" },
                { name: "claude-haiku-4-5", provider: "Anthropic API", scope: "model", used: "30秒前", calls: "47,128" },
              ].map((tool, i) => (
                <tr key={i}>
                  <td><span style={{ fontWeight: 500 }}>{tool.name}</span></td>
                  <td className="muted">{tool.provider}</td>
                  <td><Badge kind="info" dot={false}>{tool.scope}</Badge></td>
                  <td className="muted">{tool.used}</td>
                  <td className="num tnum">{tool.calls}</td>
                  <td><button className="tb-icon-btn"><I.more size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "agents" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {[
            { name: "PR Reviewer", kind: "orchestrator", model: "claude-sonnet-4", skills: ["code-review","wiki-author"], status: "active" },
            { name: "Schema Migrator", kind: "task", model: "claude-haiku-4-5", skills: ["schema-migrate"], status: "active" },
            { name: "Deploy Checker", kind: "task", model: "gpt-4o-mini", skills: ["deploy-runbook"], status: "paused" },
            { name: "Kintai Watchdog", kind: "watcher", model: "claude-haiku-4-5", skills: ["kintai-anomaly"], status: "active" },
          ].map((a, i) => (
            <div key={i} className="card">
              <div className="row gap-2" style={{ marginBottom: 8 }}>
                <span className="avatar brand"><I.bot size={14}/></span>
                <div className="col grow"><span style={{ fontWeight: 500 }}>{a.name}</span><span className="mono muted" style={{ fontSize: "var(--text-2xs)" }}>{a.kind} · {a.model}</span></div>
                <Badge kind={a.status === "active" ? "success" : "neutral"}>{a.status}</Badge>
              </div>
              <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                {a.skills.map(s => <span key={s} className="chip"><I.zap size={10}/>{s}</span>)}
              </div>
              <hr className="divider"/>
              <div className="row gap-2">
                <button className="btn btn-secondary btn-sm grow"><I.terminal size={12}/> セッション開始</button>
                <button className="btn btn-ghost btn-sm"><I.settings size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "sessions" && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>セッション</th><th>エージェント</th><th>開始</th><th>ターン</th><th>状態</th><th></th></tr></thead>
            <tbody>
              <tr><td className="mono">#4521</td><td>PR Reviewer</td><td className="muted">13:24</td><td className="num tnum">14</td><td><Badge kind="success"><span className="dot pulse-dot" style={{ background: "var(--success)", marginRight: 4 }}/>実行中</Badge></td><td><button className="btn btn-ghost btn-sm">開く <I.chevronRight size={12}/></button></td></tr>
              <tr><td className="mono">#4520</td><td>Schema Migrator</td><td className="muted">13:18</td><td className="num tnum">3</td><td><Badge kind="info">完了</Badge></td><td><button className="btn btn-ghost btn-sm">開く <I.chevronRight size={12}/></button></td></tr>
              <tr><td className="mono">#4519</td><td>Kintai Watchdog</td><td className="muted">12:45</td><td className="num tnum">1</td><td><Badge kind="warning">注意検出</Badge></td><td><button className="btn btn-ghost btn-sm">開く <I.chevronRight size={12}/></button></td></tr>
              <tr><td className="mono">#4518</td><td>PR Reviewer</td><td className="muted">11:24</td><td className="num tnum">22</td><td><Badge kind="error">失敗</Badge></td><td><button className="btn btn-ghost btn-sm">開く <I.chevronRight size={12}/></button></td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
window.AgentScreen = AgentScreen;

// ── Code browser + PR-lite ───────────────────────────────────────────
function CodeScreen({ locale }) {
  const t = T[locale];
  const [tab, setTab] = useS2("pr");
  return (
    <div className="page fade-in" style={{ maxWidth: 1400 }}>
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.codeBrowser}</h1>
          <p className="page-subtitle">godx-kintai · 読み取り専用 · ミニ PR フロー</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.branch size={14}/> master</button>
          <button className="btn btn-secondary btn-sm"><I.external size={14}/> GitHub</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[["files",t.files,I.folder],["commits",t.commits,I.hash],["pr",t.pullRequests,I.pr]].map(([id,label,Ico]) => (
          <div key={id} className="tab" data-active={tab===id} onClick={() => setTab(id)}><span className="row gap-1"><Ico size={14}/> {label} {id==="pr" && <span className="sb-badge">3</span>}</span></div>
        ))}
      </div>

      {tab === "files" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12 }}>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>godx-kintai · master</div>
            <div style={{ padding: 4 }}>
              {[
                { kind: "dir", name: "backend" },
                { kind: "dir", name: "frontend", open: true, children: [
                  { kind: "dir", name: "src" },
                  { kind: "file", name: "package.json" },
                  { kind: "file", name: "vite.config.ts" },
                ]},
                { kind: "dir", name: "schemas" },
                { kind: "file", name: "godx.yaml" },
                { kind: "file", name: "README.md" },
                { kind: "file", name: "CLAUDE.md" },
              ].map((n, i) => (
                <div key={i}>
                  <div className="sb-nav-item" style={{ height: 26, fontSize: "var(--text-xs)" }}>
                    <span className="sb-icon">{n.kind === "dir" ? <I.chevronDown size={12}/> : <I.doc size={12}/>}</span>
                    <span>{n.name}</span>
                  </div>
                  {n.children && n.children.map((c, j) => (
                    <div key={j} className="sb-nav-item" style={{ height: 26, fontSize: "var(--text-xs)", paddingLeft: 24 }}>
                      <span className="sb-icon">{c.kind === "dir" ? <I.chevronRight size={12}/> : <I.doc size={12}/>}</span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ display: "flex", padding: "8px 12px", borderBottom: "1px solid var(--border)", alignItems: "center", gap: 8 }}>
              <I.doc size={14}/>
              <span className="mono" style={{ fontSize: "var(--text-xs)" }}>godx.yaml</span>
              <Badge kind="neutral" dot={false}>YAML</Badge>
              <span className="ml-auto muted" style={{ fontSize: "var(--text-xs)" }}>32 行 · 1.2 KB</span>
              <button className="btn btn-ghost btn-sm"><I.copy size={12}/></button>
            </div>
            <pre style={{ margin: 0, padding: 16, background: "var(--surface-2)", fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.7, overflow: "auto" }}>
{`name: godx-kintai
description: 勤怠管理プラットフォーム

apps:
  - label: api
    path: backend
    type: laravel
    devscript: php artisan serve --host 0.0.0.0
  - label: app
    path: frontend
    type: node
    devscript: pnpm dev --host

domains:
  - label: api
    app: api
  - label: app
    app: app
  - label: storybook
    app: app
    port: 9102
    optional: true

databases:
  - api`}
            </pre>
          </div>
        </div>
      )}

      {tab === "commits" && (
        <div className="card" style={{ padding: 0 }}>
          {[
            { sha: "a8f2c1d", msg: "feat(kintai): シフトテンプレート機能 (#310)", who: "f-satoshi", when: "2分前", added: 142, removed: 18 },
            { sha: "7b2e9af", msg: "fix(design): OKLCH チャート色の差し替え", who: "n-naoto", when: "1時間前", added: 24, removed: 24 },
            { sha: "3d8c7e0", msg: "test: betoya テナント切替 e2e", who: "a-kana", when: "3時間前", added: 87, removed: 0 },
            { sha: "92a0b1f", msg: "docs: design system 統一ガイド (RFC)", who: "f-satoshi", when: "昨日", added: 312, removed: 5 },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <span className="mono" style={{ background: "var(--surface-3)", padding: "2px 6px", borderRadius: 4, fontSize: "var(--text-2xs)" }}>{c.sha}</span>
              <div className="grow"><div style={{ fontSize: "var(--text-sm)" }}>{c.msg}</div><div className="muted" style={{ fontSize: "var(--text-xs)" }}><Avatar name={c.who}/> {c.who} · {c.when}</div></div>
              <span style={{ color: "var(--success)", fontSize: "var(--text-xs)", fontFamily: "monospace" }}>+{c.added}</span>
              <span style={{ color: "var(--error)", fontSize: "var(--text-xs)", fontFamily: "monospace" }}>−{c.removed}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "pr" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 12 }}>
          <div className="col gap-2">
            {[
              { id: "#1284", title: "AIエージェントによる勤怠異常検知", status: "review", who: "f-satoshi", checks: 7, comments: 3, active: true },
              { id: "#1283", title: "OKLCH チャート色の差し替え", status: "draft", who: "n-naoto", checks: 4, comments: 1 },
              { id: "#1282", title: "Mailpit ヘルスチェック追加", status: "merged", who: "a-kana", checks: 7, comments: 0 },
            ].map((p, i) => (
              <div key={i} className={cx("card")} style={{ padding: 12, borderColor: p.active ? "var(--primary)" : undefined, borderWidth: p.active ? 2 : 1 }}>
                <div className="row gap-2" style={{ marginBottom: 4 }}>
                  <Badge kind={p.status==="merged"?"info":p.status==="review"?"success":"neutral"}>{p.status}</Badge>
                  <span className="mono muted" style={{ fontSize: "var(--text-xs)" }}>{p.id}</span>
                </div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
                <div className="row gap-3 muted" style={{ fontSize: "var(--text-xs)" }}>
                  <span><Avatar name={p.who}/> {p.who}</span>
                  <span><I.check size={10}/> {p.checks}/7</span>
                  <span>💬 {p.comments}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="row gap-2" style={{ marginBottom: 8 }}>
              <Badge kind="success">review</Badge>
              <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>#1284 · feat/kintai-anomaly → master</span>
            </div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 500, margin: "0 0 8px" }}>AIエージェントによる勤怠異常検知</h2>
            <p className="muted" style={{ fontSize: "var(--text-sm)", margin: "0 0 12px" }}>Kintai Watchdog エージェント (claude-haiku-4-5) が前日比で異常な打刻パターンを検出し、店長に通知する MVP。</p>
            <div className="row gap-2" style={{ marginBottom: 12 }}>
              <Badge kind="success" dot={false}><I.check size={10}/>CI</Badge>
              <Badge kind="success" dot={false}><I.check size={10}/>Lint</Badge>
              <Badge kind="success" dot={false}><I.check size={10}/>Tests</Badge>
              <Badge kind="warning" dot={false}><I.zap size={10}/>Agent review</Badge>
            </div>
            <hr className="divider"/>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>app/Services/AnomalyDetector.php</div>
            <div className="diff">
              <div className="diff-row ctx"><span className="ln">12</span><span className="ln">12</span><span className="body">{`class AnomalyDetector {`}</span></div>
              <div className="diff-row del"><span className="ln">13</span><span className="ln"></span><span className="body">{`  protected $threshold = 0.7;`}</span></div>
              <div className="diff-row add"><span className="ln"></span><span className="ln">13</span><span className="body">{`  protected $threshold = 0.85;`}</span></div>
              <div className="diff-row add"><span className="ln"></span><span className="ln">14</span><span className="body">{`  protected $window = '7d';`}</span></div>
              <div className="diff-row ctx"><span className="ln">14</span><span className="ln">15</span><span className="body">{``}</span></div>
              <div className="diff-row ctx"><span className="ln">15</span><span className="ln">16</span><span className="body">{`  public function detect(Collection $punches): array`}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.CodeScreen = CodeScreen;
