/* global React, I, cx, Badge, Avatar, T */
/* eslint-disable react/prop-types */

const { useState: useS3 } = React;

// ── Domain pool ──────────────────────────────────────────────────────
function DomainsScreen({ locale }) {
  const t = T[locale];
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="grow">
          <h1 className="page-title">{t.domains}</h1>
          <p className="page-subtitle">Caddy 経由の reverse-proxy マッピング — 開発者ごとに自動発行</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.refresh size={14}/> godx.yaml から同期</button>
          <button className="btn btn-primary btn-sm"><I.plus size={14}/> {t.new}</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="row gap-3">
          <div className="col grow">
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>パブリックドメイン</span>
            <span className="mono" style={{ fontSize: "var(--text-base)", fontWeight: 500 }}>example.test</span>
          </div>
          <div className="col">
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>合計マッピング</span>
            <span className="kpi-value">38</span>
          </div>
          <div className="col">
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>稼働中</span>
            <span className="kpi-value" style={{ color: "var(--success)" }}>34</span>
          </div>
          <div className="col">
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>注意</span>
            <span className="kpi-value" style={{ color: "var(--attention)" }}>2</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>サブドメイン</th><th>プロジェクト</th><th>開発者</th><th>ターゲット</th><th>TLS</th><th>ヘルス</th><th></th></tr></thead>
          <tbody>
            {[
              { sub: "api-kintai-f-satoshi", proj: "godx-kintai", dev: "f-satoshi", target: "10.42.7.2:9100", tls: true, health: "ok" },
              { sub: "app-kintai-f-satoshi", proj: "godx-kintai", dev: "f-satoshi", target: "10.42.7.2:9101", tls: true, health: "ok" },
              { sub: "api-kintai-alice", proj: "godx-kintai", dev: "alice", target: "10.42.4.2:9100", tls: true, health: "ok" },
              { sub: "app-kintai-alice", proj: "godx-kintai", dev: "alice", target: "10.42.4.2:9101", tls: true, health: "ok" },
              { sub: "api-tempo-f-satoshi", proj: "godx-tempo", dev: "f-satoshi", target: "10.42.7.2:9200", tls: true, health: "ok" },
              { sub: "api-betoya-alice", proj: "betoya-api", dev: "alice", target: "10.42.4.2:9300", tls: true, health: "warn" },
              { sub: "mailpit-f-satoshi", proj: "—", dev: "f-satoshi", target: "127.0.0.1:11007", tls: true, health: "ok" },
            ].map((d, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ fontWeight: 500 }}>{d.sub}</span><span className="muted">.example.test</span></td>
                <td>{d.proj === "—" ? <span className="muted">—</span> : <span className="row gap-1"><span className="dot" style={{ background: "var(--primary)" }}/>{d.proj}</span>}</td>
                <td><div className="row gap-1"><Avatar name={d.dev}/><span style={{ fontSize: "var(--text-sm)" }}>{d.dev}</span></div></td>
                <td className="mono" style={{ color: "var(--muted-foreground)" }}>{d.target}</td>
                <td>{d.tls ? <Badge kind="success" dot={false}><I.shield size={10}/>有効</Badge> : <Badge kind="neutral" dot={false}>無効</Badge>}</td>
                <td>{d.health === "ok" ? <Badge kind="success">200</Badge> : <Badge kind="warning">502 ×3</Badge>}</td>
                <td><div className="row gap-1"><button className="btn btn-ghost btn-sm"><I.external size={12}/></button><button className="btn btn-ghost btn-sm"><I.copy size={12}/></button><button className="tb-icon-btn"><I.more size={16}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.DomainsScreen = DomainsScreen;

// ── Login ────────────────────────────────────────────────────────────
function LoginScreen({ locale, setRoute }) {
  const t = T[locale];
  return (
    <div className="auth-shell" data-density="comfortable">
      <div className="auth-art">
        <div className="row gap-2"><span className="sb-logo-mark" style={{ background: "white", color: "var(--brand)", width: 36, height: 36, fontSize: 18 }}>F</span><div className="col"><span style={{ fontWeight: 500, fontSize: "var(--text-lg)" }}>Famgia</span><span style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>godx-admin</span></div></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.4, letterSpacing: "-0.01em", marginBottom: 16 }}>丁寧でストイックな信頼感を、<br/>業務の道具として残す。</div>
          <div style={{ fontSize: "var(--text-sm)", opacity: 0.85, lineHeight: 1.7, maxWidth: 420 }}>godx 統合管理コンソール — 開発者ワークスペース、勤怠、店舗、AI エージェントを 1 つのデザイン言語で運用。</div>
        </div>
        <div className="row gap-2" style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>
          <span>© famgia.com</span><span className="ml-auto mono">v1.0 · {new Date().toLocaleDateString("ja-JP")}</span>
        </div>
      </div>
      <div className="auth-card">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div className="row gap-2" style={{ marginBottom: 24 }}>
            <span className="sb-logo-mark" style={{ width: 32, height: 32, fontSize: 14 }}>g</span>
            <span style={{ fontWeight: 500 }}>godx-admin</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 8px" }}>{t.login}</h1>
          <p className="muted" style={{ fontSize: "var(--text-sm)", margin: "0 0 24px" }}>famgia.com アカウントでサインインしてください。</p>
          <div className="col gap-3">
            <div><label className="label">メールアドレス</label><input className="input" placeholder="you@famgia.com" defaultValue="satoshi@famgia.com"/></div>
            <div><label className="label">パスワード</label><input className="input" type="password" placeholder="••••••••" defaultValue="password"/></div>
            <label className="row gap-2" style={{ fontSize: "var(--text-sm)" }}><input type="checkbox"/> ログイン状態を保持</label>
            <button className="btn btn-primary btn-lg" onClick={() => setRoute("dashboard")}>{t.login}</button>
            <hr className="divider"/>
            <button className="btn btn-secondary btn-lg"><I.shield size={14}/> SSO で続行 (Keycloak)</button>
            <p className="muted" style={{ fontSize: "var(--text-xs)", textAlign: "center" }}>サインインすると <a href="#" style={{ color: "var(--primary)" }}>利用規約</a> および <a href="#" style={{ color: "var(--primary)" }}>プライバシーポリシー</a> に同意したものとみなされます。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
window.LoginScreen = LoginScreen;

// ── Design System overview ──────────────────────────────────────────
function SystemScreen({ locale }) {
  const t = T[locale];
  const [tab, setTab] = useS3("rules");
  return (
    <div className="page fade-in" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>godx Unified Design System</h1>
            <Badge kind="info">v1.0</Badge>
          </div>
          <p className="page-subtitle">famgia.com 全プロダクトに適用する単一の視覚言語 — godx-admin · dxs-kintai · dxs-tempo · betoya · 今後のすべてのサービス</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.download size={14}/> tokens.css</button>
          <button className="btn btn-primary btn-sm"><I.book size={14}/> Figma library</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[["rules",t.rules],["color",t.color],["typography",t.typography],["spacing","スペース"],["components",t.components],["governance","運用"]].map(([id,label]) => (
          <div key={id} className="tab" data-active={tab===id} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === "rules" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>3つの設計原則</h3>
            <div className="col gap-3">
              {[
                { jp: "渋み", romaji: "shibumi", en: "Restrained elegance", rule: "Primary chroma ≤ 0.18 in OKLCH — ネオン禁止、彩度過多禁止" },
                { jp: "間", romaji: "ma", en: "Breathing room", rule: "Body line-height: 1.7 — 漢字の升目が衝突しないこと" },
                { jp: "簡素", romaji: "kanso", en: "Simplicity", rule: "フォントウェイトは 400 / 500 / 700 の3つだけ" },
              ].map((p, i) => (
                <div key={i} className="row gap-3" style={{ padding: 12, background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1, color: "var(--brand)" }}>{p.jp}</div>
                  <div className="col grow">
                    <div className="row gap-2" style={{ fontSize: "var(--text-sm)" }}><span style={{ fontWeight: 500 }}>{p.romaji}</span><span className="muted">— {p.en}</span></div>
                    <div className="muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>{p.rule}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>ハードルール (CIで強制)</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "var(--text-sm)", lineHeight: 1.9 }}>
              <li><strong>カラー</strong> — <code className="mono" style={{ background: "var(--surface-3)", padding: "1px 5px", borderRadius: 3 }}>tokens.css</code> 以外で hex/rgb を書かない</li>
              <li><strong>タイポ</strong> — h1 ≤ 20px、body 14px / 1.7、3 weights only</li>
              <li><strong>スペース</strong> — すべて 4px グリッド (<code>--spacing-*</code>)</li>
              <li><strong>角丸</strong> — base 6px、shadow は popover / dialog のみ</li>
              <li><strong>赤の使用</strong> — 破壊的操作のみ。注意は 朱 (<code>--attention</code>) を優先</li>
              <li><strong>絵文字</strong> — 製品 UI で禁止 (CJK font 間で破綻)</li>
              <li><strong>テナント</strong> — <code>--primary, --ring, --foreground</code> のみ上書き可</li>
              <li><strong>i18n</strong> — UI 文字列は <code>locales/{"{ja,en,vi}"}.json</code></li>
              <li><strong>密度</strong> — タッチ 44px floor、データ 28px、デフォルト 32px</li>
            </ul>
          </div>

          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3 className="card-title" style={{ marginBottom: 12 }}>カラーシグナリング規則 (全プロダクト共通)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {[
                { dot: "var(--error)", name: "danger 茜", hex: "#b7282e", use: "破壊的のみ — 削除、却下、解雇" },
                { dot: "var(--attention)", name: "attention 朱", hex: "#eb6101", use: "非クリティカル ← 赤より優先" },
                { dot: "var(--warning)", name: "warning 山吹", hex: "#f8b500", use: "下書き、保留、一時的状態" },
                { dot: "var(--success)", name: "success 若竹", hex: "#68be8d", use: "承認、完了、正常" },
                { dot: "var(--info)", name: "info 群青", hex: "#4c6cb3", use: "情報、中立的文脈" },
              ].map((c, i) => (
                <div key={i} style={{ padding: 12, background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                  <div className="row gap-2" style={{ marginBottom: 6 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: c.dot }}/><span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{c.name}</span></div>
                  <div className="mono muted" style={{ fontSize: "var(--text-2xs)", marginBottom: 6 }}>{c.hex}</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: 1.5 }}>{c.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "color" && (
        <div className="col gap-3">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>テナント (Primary だけ上書き)</h3>
            <div className="row gap-3">
              {window.PRODUCTS.map(p => (
                <div key={p.id} data-tenant={p.tenant} style={{ flex: 1, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                  <div style={{ height: 48, borderRadius: "var(--radius-md)", background: "var(--primary)", marginBottom: 8 }}/>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{p.name}</div>
                  <div className="muted mono" style={{ fontSize: "var(--text-2xs)" }}>data-tenant=&quot;{p.tenant}&quot;</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>和色 (Wa-iro) — 装飾 / チャート用 (セマンティックには使用禁止)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {[
                ["藍","#165e83"],["群青","#4c6cb3"],["瑠璃","#1e50a2"],["紺","#223a70"],["若竹","#68be8d"],["萌葱","#006e54"],["山吹","#f8b500"],
                ["朱","#eb6101"],["茜","#b7282e"],["臙脂","#b94047"],["桜","#fef4f4"],["墨","#595857"],["鼠","#949495"],
              ].map(([n,h]) => (
                <div key={n} style={{ textAlign: "center" }}>
                  <div style={{ height: 56, borderRadius: "var(--radius-md)", background: h, border: "1px solid var(--border)" }}/>
                  <div style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>{n}</div>
                  <div className="mono muted" style={{ fontSize: 9 }}>{h}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "typography" && (
        <div className="col gap-3">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>M PLUS 2 — 1つのフォントで全機能を覆う</h3>
            <div className="col gap-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              {[
                { size: "32px", label: "h1 cap (--text-4xl)", weight: 500, sample: "勤怠管理を、丁寧に。" },
                { size: "20px", label: "h1 default (--heading-h1)", weight: 500, sample: "ダッシュボード · Dashboard · Bảng điều khiển" },
                { size: "18px", label: "h2 (--heading-h2)", weight: 500, sample: "プロダクト統合の進捗" },
                { size: "14px", label: "body (--text-base) — JP density default", weight: 400, sample: "本文は 14px / 1.7 で組みます。漢字とひらがな、英字、数字 1234, Vietnamese (Việt Nam) すべて統一されたメトリクス。" },
                { size: "12px", label: "caption (--text-xs)", weight: 400, sample: "ラベル・補助情報・テーブルセルなど" },
              ].map((s, i) => (
                <div key={i} className="row gap-4" style={{ alignItems: "baseline" }}>
                  <span className="mono muted" style={{ width: 200, fontSize: "var(--text-xs)" }}>{s.label}</span>
                  <span style={{ fontSize: s.size, fontWeight: s.weight, lineHeight: 1.3 }}>{s.sample}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "spacing" && (
        <div className="col gap-3">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>4px グリッド — すべての spacing がここから派生</h3>
            <div className="col gap-2">
              {[1,2,3,4,5,6,8,10,12].map(n => (
                <div key={n} className="row gap-3"><span className="mono muted" style={{ width: 100, fontSize: "var(--text-xs)" }}>--spacing-{n}</span><div style={{ height: 12, width: `${n*4}px`, background: "var(--primary)", borderRadius: 2 }}/><span className="mono muted" style={{ fontSize: "var(--text-xs)" }}>{n*4}px</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>3つの密度モード</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { name: "compact", h: 28, use: "kintone 風データテーブル" },
                { name: "default", h: 32, use: "アプリ標準 — それ以外すべて" },
                { name: "comfortable", h: 44, use: "ログイン / モバイル / WCAG 44px floor" },
              ].map((d, i) => (
                <div key={i} style={{ padding: 12, background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                  <div className="row gap-2" style={{ marginBottom: 8 }}><span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{d.name}</span><Badge kind="neutral" dot={false}>{d.h}px</Badge></div>
                  <div style={{ height: d.h, background: "var(--primary)", borderRadius: "var(--radius-md)", marginBottom: 8, opacity: 0.9 }}/>
                  <div className="muted" style={{ fontSize: "var(--text-xs)" }}>{d.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "components" && (
        <div className="col gap-3">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>ボタン</h3>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-ghost">Ghost</button>
              <button className="btn btn-danger">Danger</button>
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary"><I.plus size={14}/>アイコン付き</button>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>バッジ / シグナル</h3>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <Badge kind="success">承認しました</Badge>
              <Badge kind="info">情報</Badge>
              <Badge kind="warning">下書き</Badge>
              <Badge kind="attention">注意</Badge>
              <Badge kind="error">エラー</Badge>
              <Badge kind="neutral">中立</Badge>
              <Badge kind="outline" dot={false}>outline</Badge>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>入力</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div><label className="label">テキスト</label><input className="input" placeholder="氏名"/></div>
              <div><label className="label">メール</label><input className="input" type="email" placeholder="you@famgia.com"/></div>
              <div><label className="label">パスワード</label><input className="input" type="password" defaultValue="••••••"/></div>
              <div style={{ gridColumn: "1 / -1" }}><label className="label">テキストエリア</label><textarea className="input" rows={3} placeholder="自由入力"/></div>
            </div>
          </div>
        </div>
      )}

      {tab === "governance" && (
        <div className="col gap-3">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>運用フロー</h3>
            <div className="prose">
              <p>このデザインシステムは <code>@godxjp/ui</code> パッケージとして配布され、すべての famgia.com プロダクトが peer dependency として消費します。</p>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li><strong>変更提案</strong> — <code>godx-admin</code> リポジトリに RFC issue を作成</li>
                <li><strong>議論</strong> — Design council (週1) で承認</li>
                <li><strong>実装</strong> — <code>tokens.css</code> + <code>@godxjp/ui</code> に反映、minor バンプ</li>
                <li><strong>展開</strong> — 各プロダクトが renovate で取り込み</li>
                <li><strong>記録</strong> — 本ガイド (System screen) を更新</li>
              </ol>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>採用状況</h3>
            <table className="table">
              <thead><tr><th>プロダクト</th><th>tokens.css</th><th>@godxjp/ui</th><th>i18n 共通</th><th>カバレッジ</th></tr></thead>
              <tbody>
                <tr><td>godx-admin</td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">完全</Badge></td><td className="num tnum">100%</td></tr>
                <tr><td>dxs-kintai</td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">完全</Badge></td><td className="num tnum">98%</td></tr>
                <tr><td>dxs-tempo</td><td><Badge kind="warning">v0.9</Badge></td><td><Badge kind="warning">v0.9</Badge></td><td><Badge kind="warning">部分</Badge></td><td className="num tnum">62%</td></tr>
                <tr><td>betoya</td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">v1.0</Badge></td><td><Badge kind="success">完全</Badge></td><td className="num tnum">94%</td></tr>
                <tr><td>godx-cms-base</td><td><Badge kind="error">未対応</Badge></td><td><Badge kind="error">未対応</Badge></td><td><Badge kind="neutral">N/A</Badge></td><td className="num tnum">12%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
window.SystemScreen = SystemScreen;
