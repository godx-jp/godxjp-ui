/* global React, I, T, Badge, Avatar */
/* eslint-disable react/prop-types */

const { useState: useStD, useMemo: useMemoD, useEffect: useEffD, useRef: useRefD } = React;

// ─────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────

const PHASE_META = {
  PLAN:  { label: "Plan",  jp: "計画", color: "oklch(60% 0.12 250)", kind: "info"    },
  DO:    { label: "Do",    jp: "実行", color: "oklch(72% 0.14 70)",  kind: "warning" },
  CHECK: { label: "Check", jp: "評価", color: "oklch(60% 0.14 145)", kind: "success" },
  ACT:   { label: "Act",   jp: "改善", color: "oklch(58% 0.16 320)", kind: "neutral" },
};

function PhasePill({ phase, active, onClick }) {
  const m = PHASE_META[phase];
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 12px", borderRadius: 99,
        border: "1px solid " + (active ? m.color : "var(--border)"),
        background: active ? "color-mix(in oklch, " + m.color + " 12%, var(--surface-1))" : "var(--surface-1)",
        color: "var(--foreground)",
        fontSize: "var(--text-xs)", fontWeight: 500, cursor: "pointer",
        fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }}/>
      {m.label}
      <span className="muted" style={{ fontWeight: 400 }}>· {m.jp}</span>
    </button>
  );
}

function MetaRow({ label, children }) {
  return (
    <div className="row gap-2" style={{ alignItems: "center", padding: "6px 0", fontSize: "var(--text-xs)" }}>
      <span className="muted" style={{ width: 88, flexShrink: 0, fontSize: "var(--text-2xs)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      <div className="grow" style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function SectionCard({ title, kicker, accent, action, children }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: accent ? "3px solid " + accent : undefined }}>
      <div className="row gap-2" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
        {kicker && (
          <span style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: accent || "var(--muted-foreground)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{kicker}</span>
        )}
        <span style={{ fontWeight: 500 }}>{title}</span>
        <div className="ml-auto">{action}</div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PDCA Plan Detail
// ─────────────────────────────────────────────────────────────────────

function PlanDetailScreen({ locale, product, planId = "PDCA-Q2-001", setRoute }) {
  const t = T[locale];

  const plan = {
    id: planId,
    title: "シフト承認フローの簡素化",
    summary: "店長が日次のシフト確定までに掛けている平均15分を5分まで短縮する。POS / 勤怠 両プロダクトを横断する PDCA。",
    cycle: "Q2 / 2026",
    sprint: "Sprint 12 → 14",
    owner: "Satoshi F",
    sponsors: ["Satoshi F", "Naoki N"],
    phase: "DO",
    pct: 62,
    started: "2026-04-01",
    review: "2026-05-22",
    closes: "2026-06-30",
    projects: ["restaurant-pos", "restaurant-kintai", "restaurant-admin"],
    health: "warning", // success | warning | error
    iteration: 2, // 第2世代 PDCA — Q1 の学びから派生
    derivedFrom: { id: "PDCA-Q1-007", title: "シフト確定 UX 観察リサーチ", cycle: "Q1 / 2026", reason: "観察で見えた『二段階承認の摩擦』を仮説化" },
    spawns: [
      { id: "PDCA-Q3-012", title: "承認テンプレート学習 (ML仮説)",         phase: "PLAN", cycle: "Q3 / 2026", origin: "TRY",  status: "起票済" },
      { id: "PDCA-Q3-013", title: "モバイル承認モード",                      phase: "PLAN", cycle: "Q3 / 2026", origin: "PARK", status: "ピッチ中" },
      { id: null,           title: "approval_v1 廃止運用ランブック",            phase: null,   cycle: "Q3 / 2026", origin: "ADOPT", status: "未起票" },
    ],
  };

  const [phase, setPhase] = useStD(plan.phase);

  // Hypothesis (PLAN)
  const hypothesis = {
    statement: "「承認の二段階化を解除し、店長一段階で確定できる UI を提供すれば、シフト確定までの平均所要時間を 67% 削減できる」",
    why: "現状は本部承認 → 店長承認 → 確定の三段階。本部承認は週次で機械的に通っているため、ボトルネックは店長の確認行為に集中している。",
    success: [
      { metric: "シフト確定平均所要時間", baseline: "14:38", target: "≤ 5:00", unit: "分:秒" },
      { metric: "店長満足度 (NPS)", baseline: "+18", target: "≥ +35", unit: "" },
      { metric: "確定後の差し戻し件数", baseline: "週 4.2 件", target: "≤ 週 1.0 件", unit: "" },
    ],
    risks: [
      { level: "Medium", text: "本部レビューの抜け漏れにより労務リスクが上振れする可能性 — 監査ログとアラート閾値で軽減" },
      { level: "Low",    text: "既存 POS 端末でのレイアウト崩れ — 端末リスト 3 機種で先行検証" },
    ],
  };

  // Execution (DO)
  const tasks = [
    { id: "GK-310", title: "シフトテンプレート機能 — 一括承認 UI",   pct: 80,  owner: "S F", due: "5/12", state: "進行中" },
    { id: "GK-318", title: "勤怠申請に承認者を複数選択",            pct: 30,  owner: "N N", due: "5/18", state: "進行中" },
    { id: "GK-321", title: "シフト印刷の日付フォーマット修正",         pct: 0,   owner: "S F", due: "5/24", state: "ブロック" },
    { id: "DS-08",  title: "OKLCH チャートカラー差し替え",           pct: 100, owner: "N N", due: "5/06", state: "完了" },
    { id: "INF-14", title: "MariaDB バックアップ運用 ランブック",     pct: 70,  owner: "A K", due: "5/20", state: "進行中" },
  ];
  const decisions = [
    { date: "4/03", who: "S F", text: "承認段階を 3 → 1 に集約。本部レビューは週次バッチに格下げ。" },
    { date: "4/12", who: "N N", text: "既存テンプレートとの互換維持のため `approval_v1` フラグを 8 週間並走。" },
    { date: "4/28", who: "S F", text: "betoya テナントを先行ロールアウト対象に決定（影響 12 店舗）。" },
  ];

  // Check (metrics)
  const metrics = [
    { label: "確定所要時間", value: "07:42", delta: "-47%", positive: true,  baseline: "14:38" },
    { label: "差し戻し件数", value: "1.8/週", delta: "-57%", positive: true,  baseline: "4.2/週" },
    { label: "監査ログ欠落", value: "0",     delta: "0",     positive: true,  baseline: "—"      },
    { label: "NPS (店長)",   value: "+27",   delta: "+9",    positive: true,  baseline: "+18"    },
  ];
  // 14 daily samples (mins to confirm a shift)
  const series = [14.6, 13.9, 14.2, 13.1, 12.8, 11.4, 10.2, 9.8, 9.1, 8.4, 8.0, 7.9, 7.6, 7.4];
  const seriesMax = 16, seriesMin = 0;

  // Act (next-cycle decisions)
  const acts = [
    { kind: "ADOPT",  text: "一段階承認 UI を本番ロールアウト。`approval_v1` を 6/30 に削除予定。" },
    { kind: "TRY",    text: "「承認テンプレート学習」— 過去30日の確定パターンから自動提案する次サイクル仮説に格上げ。" },
    { kind: "DROP",   text: "本部承認の必要性が極めて低いため、Q3 以降の運用ガイドから除外。" },
    { kind: "PARK",   text: "モバイル承認モード — Q3 の独立 PDCA としてピッチ化（スコープ外）。" },
  ];

  return (
    <div className="page fade-in">
      {/* Breadcrumb */}
      <div className="row gap-2" style={{ marginBottom: 8, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 22 }} onClick={() => setRoute && setRoute("p-plans")}>
          <I.chevronLeft size={14}/> {t.plans || "PDCA計画"}
        </button>
        <span>/</span>
        <span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{plan.id}</span>
      </div>

      {/* 系譜 — Lineage strip (parent ← current → spawned cycles). PDCA is a loop: each cycle
         is born from a prior one's learnings, and seeds the next. Make that visible. */}
      <LineageStrip plan={plan}/>

      {/* Header */}
      <div className="page-header">
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 6, alignItems: "center" }}>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>{plan.id}</span>
            <Badge kind={PHASE_META[plan.phase].kind}>{PHASE_META[plan.phase].label} · {PHASE_META[plan.phase].jp}</Badge>
            <Badge kind={plan.health === "success" ? "success" : plan.health === "warning" ? "warning" : "error"}>
              {plan.health === "success" ? "順調" : plan.health === "warning" ? "要注意" : "リスク"}
            </Badge>
            <span className="muted" style={{ fontSize: "var(--text-xs)" }}>· {plan.cycle} · {plan.sprint}</span>
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>{plan.title}</h1>
          <p className="page-subtitle" style={{ marginTop: 6, maxWidth: 720 }}>{plan.summary}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.copy size={14}/> 複製</button>
          <button className="btn btn-secondary btn-sm"><I.book size={14}/> 振り返りを書く</button>
          <button className="btn btn-primary btn-sm"><I.check size={14}/> サイクル次フェーズへ</button>
        </div>
      </div>

      {/* PDCA cycle visualizer */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <div className="row gap-2" style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>PDCA CYCLE</span>
          <span className="muted" style={{ fontSize: "var(--text-xs)" }}>· サイクル {plan.cycle}</span>
          <div className="ml-auto row gap-2" style={{ alignItems: "center" }}>
            <span className="muted" style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.05em" }}>進捗</span>
            <div style={{ width: 180, height: 6, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden" }}>
              <div style={{ width: `${plan.pct}%`, height: "100%", background: "linear-gradient(90deg, oklch(72% 0.14 145) 0%, var(--primary) 100%)" }}/>
            </div>
            <span style={{ fontSize: "var(--text-xs)", fontFeatureSettings: "'tnum'", fontWeight: 500 }}>{plan.pct}%</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {["PLAN", "DO", "CHECK", "ACT"].map((p, i) => {
            const m = PHASE_META[p];
            const status = i === 0 ? "完了" : i === 1 ? "進行中" : i === 2 ? "予定" : "予定";
            const isActive = phase === p;
            const isPast = i < 1;
            return (
              <button
                key={p}
                onClick={() => setPhase(p)}
                style={{
                  position: "relative", textAlign: "left", cursor: "pointer",
                  padding: "16px 18px",
                  background: isActive ? "color-mix(in oklch, " + m.color + " 8%, var(--surface-1))" : "var(--surface-1)",
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  borderTop: isActive ? "2px solid " + m.color : "2px solid transparent",
                  fontFamily: "var(--font-sans-jp)",
                  color: "var(--foreground)",
                }}
              >
                <div className="row gap-2" style={{ alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 99,
                    background: isPast ? m.color : isActive ? m.color : "var(--surface-3)",
                    color: isPast || isActive ? "white" : "var(--muted-foreground)",
                    display: "grid", placeItems: "center",
                    fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)",
                  }}>
                    {p[0]}
                  </span>
                  <div className="col">
                    <span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{m.label}</span>
                    <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{m.jp}</span>
                  </div>
                  <span className="ml-auto" style={{ fontSize: 10, color: m.color, fontFamily: "var(--font-mono)" }}>{status}</span>
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {p === "PLAN"  && "仮説 · 成功基準 · リスクの定義"}
                  {p === "DO"    && `${tasks.length} タスク · ${decisions.length} 決定`}
                  {p === "CHECK" && `${metrics.length} メトリクス · ${series.length}日サンプル`}
                  {p === "ACT"   && `${acts.length} 適用 · 次サイクル準備`}
                </div>
                {/* arrow */}
                {i < 3 && (
                  <span style={{
                    position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                    width: 16, height: 16, background: "var(--surface-1)", border: "1px solid var(--border)",
                    borderRadius: 99, display: "grid", placeItems: "center", zIndex: 1,
                  }}>
                    <I.chevronRight size={10}/>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <div className="col gap-3">
          {/* PLAN */}
          {phase === "PLAN" && (
            <>
              <SectionCard kicker="P · 計画" accent={PHASE_META.PLAN.color} title="仮説と成功基準">
                <div className="col gap-3">
                  <div style={{ padding: 14, background: "var(--surface-2)", borderLeft: "3px solid " + PHASE_META.PLAN.color, borderRadius: 4 }}>
                    <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>HYPOTHESIS</div>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: 1.6, fontWeight: 500 }}>{hypothesis.statement}</div>
                  </div>
                  <div className="muted" style={{ fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
                    <strong style={{ color: "var(--foreground)" }}>WHY:</strong> {hypothesis.why}
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>SUCCESS METRICS</div>
                    <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["メトリクス", "ベースライン", "目標", "単位"].map(h => (
                            <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hypothesis.success.map((m, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px 10px" }}>{m.metric}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "var(--font-mono)" }} className="muted">{m.baseline}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{m.target}</td>
                            <td style={{ padding: "8px 10px" }} className="muted">{m.unit || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SectionCard>

              <SectionCard kicker="P · リスク" accent={PHASE_META.PLAN.color} title="想定リスクと軽減策">
                <div className="col gap-2">
                  {hypothesis.risks.map((r, i) => (
                    <div key={i} className="row gap-3" style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, alignItems: "flex-start" }}>
                      <Badge kind={r.level === "High" ? "error" : r.level === "Medium" ? "warning" : "success"}>{r.level}</Badge>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, flex: 1 }}>{r.text}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* DO */}
          {phase === "DO" && (
            <>
              <SectionCard kicker="D · 実行" accent={PHASE_META.DO.color} title="関連タスク"
                action={<button className="btn btn-secondary btn-sm"><I.plus size={12}/> リンク</button>}>
                <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["ID", "タスク", "進捗", "担当", "期限", "状態"].map(h => (
                        <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(tk => (
                      <tr key={tk.id} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                          onClick={() => window.openIssueDetail && window.openIssueDetail(tk.id)}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                        <td style={{ padding: "8px 8px", fontFamily: "var(--font-mono)", fontSize: 11 }}>{tk.id}</td>
                        <td style={{ padding: "8px 8px" }}>{tk.title}</td>
                        <td style={{ padding: "8px 8px", width: 140 }}>
                          <div className="row gap-2" style={{ alignItems: "center" }}>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--surface-3)", overflow: "hidden" }}>
                              <div style={{ width: tk.pct + "%", height: "100%", background: tk.pct === 100 ? "oklch(60% 0.14 145)" : tk.state === "ブロック" ? "oklch(58% 0.18 25)" : PHASE_META.DO.color }}/>
                            </div>
                            <span style={{ fontSize: 11, fontFeatureSettings: "'tnum'", width: 32, textAlign: "right" }}>{tk.pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 8px" }}><Avatar name={tk.owner}/></td>
                        <td style={{ padding: "8px 8px", fontFamily: "var(--font-mono)", fontSize: 11 }} className="muted">{tk.due}</td>
                        <td style={{ padding: "8px 8px" }}>
                          <Badge kind={tk.state === "完了" ? "success" : tk.state === "ブロック" ? "error" : "info"}>{tk.state}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>

              <SectionCard kicker="D · 決定ログ" accent={PHASE_META.DO.color} title="サイクル中の意思決定">
                <div className="col gap-0">
                  {decisions.map((d, i) => (
                    <div key={i} className="row gap-3" style={{ padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", alignItems: "flex-start" }}>
                      <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", width: 40, flexShrink: 0 }}>{d.date}</span>
                      <Avatar name={d.who}/>
                      <div style={{ flex: 1, fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{d.text}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* CHECK */}
          {phase === "CHECK" && (
            <>
              <SectionCard kicker="C · 評価" accent={PHASE_META.CHECK.color} title="メトリクス">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  {metrics.map((mt, i) => (
                    <div key={i} style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6 }}>
                      <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{mt.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{mt.value}</div>
                      <div className="row gap-2" style={{ alignItems: "baseline", marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: mt.positive ? "oklch(60% 0.14 145)" : "oklch(58% 0.18 25)", fontWeight: 500 }}>{mt.delta}</span>
                        <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>vs {mt.baseline}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* sparkline-ish chart */}
                <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 6 }}>
                  <div className="row gap-2" style={{ marginBottom: 8, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>シフト確定平均所要時間 — 14日推移</span>
                    <span className="muted ml-auto" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>分</span>
                  </div>
                  <svg viewBox={`0 0 ${series.length * 20} 100`} preserveAspectRatio="none" style={{ width: "100%", height: 120, display: "block" }}>
                    {/* target line */}
                    <line x1="0" x2={series.length * 20} y1={100 - (5 / seriesMax) * 100} y2={100 - (5 / seriesMax) * 100} stroke="oklch(60% 0.14 145)" strokeDasharray="4 3" strokeWidth="1" opacity="0.6"/>
                    <text x="4" y={100 - (5 / seriesMax) * 100 - 4} fill="oklch(60% 0.14 145)" fontSize="9" fontFamily="var(--font-mono)">target 5:00</text>
                    {/* baseline */}
                    <line x1="0" x2={series.length * 20} y1={100 - (14.6 / seriesMax) * 100} y2={100 - (14.6 / seriesMax) * 100} stroke="var(--muted-foreground)" strokeDasharray="2 3" strokeWidth="1" opacity="0.4"/>
                    {/* line */}
                    <polyline
                      fill="none"
                      stroke={PHASE_META.CHECK.color}
                      strokeWidth="2"
                      points={series.map((v, i) => `${i * 20 + 10},${100 - (v / seriesMax) * 100}`).join(" ")}
                    />
                    {/* area */}
                    <polygon
                      fill={PHASE_META.CHECK.color}
                      opacity="0.12"
                      points={[
                        `0,100`,
                        ...series.map((v, i) => `${i * 20 + 10},${100 - (v / seriesMax) * 100}`),
                        `${series.length * 20},100`,
                      ].join(" ")}
                    />
                    {series.map((v, i) => (
                      <circle key={i} cx={i * 20 + 10} cy={100 - (v / seriesMax) * 100} r="2" fill={PHASE_META.CHECK.color}/>
                    ))}
                  </svg>
                </div>
              </SectionCard>

              <SectionCard kicker="C · 振り返り" accent={PHASE_META.CHECK.color} title="観察と学び">
                <div className="col gap-2">
                  {[
                    { kind: "良かった", tone: "success", text: "店長の確認操作は平均 7:42 まで短縮 (-47%)。Sprint 13 中盤で目標未達だった原因は端末側の入力遅延と判明。" },
                    { kind: "課題",     tone: "warning", text: "betoya テナントで 2 件のシフト確定漏れ — 監査ログのアラート閾値を 30秒→10秒 に短縮要。" },
                    { kind: "驚き",     tone: "info",    text: "差し戻し件数は予想以上に減少 (週4.2→1.8)。テンプレート学習が思ったより効いている。" },
                  ].map((r, i) => (
                    <div key={i} className="row gap-3" style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, alignItems: "flex-start" }}>
                      <Badge kind={r.tone}>{r.kind}</Badge>
                      <div style={{ flex: 1, fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{r.text}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ACT */}
          {phase === "ACT" && (
            <>
              <SectionCard kicker="A · 改善" accent={PHASE_META.ACT.color} title="次サイクルへの適用">
                <div className="col gap-2">
                  {acts.map((a, i) => {
                    const tone = a.kind === "ADOPT" ? "success" : a.kind === "TRY" ? "info" : a.kind === "DROP" ? "neutral" : "warning";
                    return (
                      <div key={i} className="row gap-3" style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, alignItems: "flex-start" }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: 4, fontFamily: "var(--font-mono)",
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                          background: a.kind === "ADOPT" ? "color-mix(in oklch, oklch(60% 0.14 145) 18%, transparent)" :
                                       a.kind === "TRY"   ? "color-mix(in oklch, oklch(56% 0.15 240) 18%, transparent)" :
                                       a.kind === "DROP"  ? "var(--surface-3)" :
                                                            "color-mix(in oklch, oklch(78% 0.15 80) 18%, transparent)",
                          color: a.kind === "ADOPT" ? "oklch(50% 0.14 145)" :
                                  a.kind === "TRY"   ? "oklch(46% 0.15 240)" :
                                  a.kind === "DROP"  ? "var(--muted-foreground)" :
                                                       "oklch(50% 0.15 80)",
                          flexShrink: 0, height: 22, display: "inline-flex", alignItems: "center",
                        }}>{a.kind}</span>
                        <div style={{ flex: 1, fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{a.text}</div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* 派生サイクル — each Act item that needs follow-up work becomes a new PDCA.
                 This is THE place where the loop closes (or stays open). */}
              <SectionCard kicker="A · 派生サイクル" accent={PHASE_META.ACT.color} title="このサイクルから生まれる次の PDCA"
                action={<span className="muted" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{plan.spawns.length} 件</span>}>
                <div className="col gap-2">
                  {plan.spawns.map((s, i) => <SpawnCard key={i} spawn={s}/>)}
                  <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", borderTop: "1px dashed var(--border)", borderRadius: 0, marginTop: 4, paddingTop: 12, color: "var(--muted-foreground)" }}>
                    <I.plus size={12}/> 学びから新サイクルを起票
                  </button>
                </div>
              </SectionCard>

              <SectionCard kicker="A · 次サイクル" accent={PHASE_META.ACT.color} title="Q3 / 2026 プレビュー">
                <div className="col gap-3">
                  <div style={{ padding: 14, background: "var(--surface-2)", borderLeft: "3px solid " + PHASE_META.ACT.color, borderRadius: 4 }}>
                    <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>NEXT HYPOTHESIS</div>
                    <div style={{ fontSize: "var(--text-base)", lineHeight: 1.6, fontWeight: 500 }}>「過去30日の確定パターンを学習し、店長に確定済みの提案を提示できれば、所要時間を 5:00 → 2:30 まで短縮できる」</div>
                  </div>
                  <MetaRow label="開始予定">2026-07-01</MetaRow>
                  <MetaRow label="リード">Naoki N <span className="muted">(Tech Lead)</span></MetaRow>
                  <MetaRow label="関連プロダクト">restaurant-kintai · restaurant-pos</MetaRow>
                </div>
              </SectionCard>
            </>
          )}
        </div>

        {/* Right rail */}
        <div className="col gap-3">
          {/* 系譜 sidebar card — derived from + spawns at-a-glance */}
          <LineageSidebarCard plan={plan}/>

          <div className="card" style={{ padding: 14 }}>
            <div className="col gap-0">
              <MetaRow label="サイクル"><span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{plan.cycle}</span></MetaRow>
              <MetaRow label="世代"><span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>第 {plan.iteration} 世代 (Q1 系列)</span></MetaRow>
              <MetaRow label="現在フェーズ">
                <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                  {["PLAN", "DO", "CHECK", "ACT"].map(p => <PhasePill key={p} phase={p} active={phase === p} onClick={() => setPhase(p)}/>)}
                </div>
              </MetaRow>
              <MetaRow label="オーナー">
                <div className="row gap-2" style={{ alignItems: "center" }}>
                  <Avatar name={plan.owner}/>
                  <span>{plan.owner}</span>
                </div>
              </MetaRow>
              <MetaRow label="スポンサー">
                <div className="row gap-1">
                  {plan.sponsors.map(s => <Avatar key={s} name={s}/>)}
                </div>
              </MetaRow>
              <MetaRow label="開始"><span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{plan.started}</span></MetaRow>
              <MetaRow label="レビュー"><span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{plan.review}</span></MetaRow>
              <MetaRow label="クローズ"><span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{plan.closes}</span></MetaRow>
              <MetaRow label="プロジェクト">
                <div className="col gap-1">
                  {plan.projects.map(p => (
                    <span key={p} className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{p}</span>
                  ))}
                </div>
              </MetaRow>
              <MetaRow label="ステータス">
                <Badge kind={plan.health === "success" ? "success" : plan.health === "warning" ? "warning" : "error"}>
                  {plan.health === "success" ? "順調" : plan.health === "warning" ? "要注意" : "リスク"}
                </Badge>
              </MetaRow>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontWeight: 500, fontSize: "var(--text-sm)" }}>関連リンク</div>
            <div className="col" style={{ padding: 6 }}>
              {[
                { icon: I.book, label: "計画ドキュメント", sub: "wiki/pdca/q2-shift-approval" },
                { icon: I.kanban, label: "Kanban フィルタ", sub: "label:plan/PDCA-Q2-001" },
                { icon: I.pr, label: "関連 PR", sub: "12 件 · 9 マージ済" },
                { icon: I.lightbulb, label: "派生アイデア", sub: "2 件" },
              ].map((l, i) => (
                <button key={i} className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", height: "auto", padding: "8px 10px" }}>
                  <l.icon size={14}/>
                  <div className="col" style={{ alignItems: "flex-start", marginLeft: 4 }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>{l.label}</span>
                    <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{l.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontWeight: 500, fontSize: "var(--text-sm)" }}>タイムライン</div>
            <div className="col" style={{ padding: 10 }}>
              {[
                { date: "5/22", text: "中間レビュー予定", kind: "info" },
                { date: "5/08", text: "メトリクス収集開始", kind: "success" },
                { date: "4/28", text: "betoya 先行ロールアウト", kind: "success" },
                { date: "4/12", text: "互換フラグ仕様確定", kind: "neutral" },
                { date: "4/03", text: "サイクル開始 (PLAN完了)", kind: "neutral" },
              ].map((e, i) => (
                <div key={i} className="row gap-2" style={{ padding: "4px 0", alignItems: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: e.kind === "success" ? "oklch(60% 0.14 145)" : e.kind === "info" ? "oklch(56% 0.15 240)" : "var(--muted-foreground)" }}/>
                  <span className="mono muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10, width: 40 }}>{e.date}</span>
                  <span style={{ fontSize: "var(--text-xs)" }}>{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────
// PDCA Lineage — visualize the loop: each cycle is born from prior learnings
// and seeds new cycles. Without this, a single Plan page reads as linear,
// which is wrong: PDCA is a chain, not a sprint.
// ─────────────────────────────────────────────────────────────────────

function LineageStrip({ plan }) {
  const phaseColor = PHASE_META[plan.phase].color;
  const parent = plan.derivedFrom;
  const kids = plan.spawns || [];
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 12, background: "var(--surface)" }}>
      <div className="row gap-2" style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", alignItems: "center", background: "var(--surface-2)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--muted-foreground)" }}>
          <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6"/>
          <polyline points="21 4 21 9 16 9"/>
        </svg>
        <span style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>系譜 · Lineage</span>
        <span className="muted" style={{ fontSize: "var(--text-xs)" }}>· 第 {plan.iteration} 世代 · このサイクルは前世代の学びから生まれ、{kids.length} の派生サイクルを生む</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1.2fr) auto minmax(0, 1.4fr)", alignItems: "stretch", gap: 0 }}>
        {/* Parent */}
        <button
          onClick={() => window.openPlanDetail && window.openPlanDetail(parent.id)}
          style={{ padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <div className="row gap-1" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>由来 · 前サイクル</span>
            <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>· {parent.cycle}</span>
          </div>
          <div className="row gap-2" style={{ alignItems: "center", opacity: 0.7 }}>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: "var(--surface-3)", color: "var(--muted-foreground)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, flexShrink: 0 }}>A</span>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{parent.id}</span>
          </div>
          <div style={{ fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted-foreground)" }}>{parent.title}</div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>↳ {parent.reason}</div>
        </button>

        {/* Arrow */}
        <LineageArrow color={phaseColor} label="生む"/>

        {/* Current */}
        <div style={{ padding: "14px 16px", background: "color-mix(in oklch, " + phaseColor + " 6%, transparent)", borderLeft: "2px solid " + phaseColor, borderRight: "2px solid " + phaseColor, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div className="row gap-1" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: phaseColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>現在 · {plan.cycle}</span>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: phaseColor, marginLeft: 4 }}/>
            <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>第 {plan.iteration} 世代</span>
          </div>
          <div className="row gap-2" style={{ alignItems: "center" }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: phaseColor, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{plan.phase[0]}</span>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{plan.id}</span>
            <span className="chip" style={{ fontSize: 9, padding: "1px 5px" }}>{PHASE_META[plan.phase].jp}</span>
          </div>
          <div style={{ fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{plan.title}</div>
          <div className="row gap-2" style={{ alignItems: "center" }}>
            <div style={{ flex: 1, height: 3, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: plan.pct + "%", height: "100%", background: phaseColor }}/>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontVariantNumeric: "tabular-nums", color: "var(--muted-foreground)" }}>{plan.pct}%</span>
          </div>
        </div>

        {/* Arrow */}
        <LineageArrow color={phaseColor} label="生む"/>

        {/* Children */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div className="row gap-1" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>派生 · 次世代</span>
            <span className="muted" style={{ fontSize: 10 }}>· {kids.length} 件</span>
          </div>
          <div className="col gap-1">
            {kids.slice(0, 3).map((k, i) => (
              <button key={i}
                onClick={() => k.id && window.openPlanDetail && window.openPlanDetail(k.id)}
                disabled={!k.id}
                className="row gap-2"
                style={{ padding: "4px 6px", border: "none", background: "transparent", cursor: k.id ? "pointer" : "default", borderRadius: 4, alignItems: "center", textAlign: "left", opacity: k.id ? 1 : 0.6 }}
                onMouseEnter={(e) => k.id && (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <OriginBadge kind={k.origin}/>
                {k.id
                  ? <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", flexShrink: 0 }}>{k.id}</span>
                  : <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", flexShrink: 0, fontStyle: "italic" }}>未起票</span>}
                <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{k.title}</span>
                <span className="muted" style={{ fontSize: 9, fontFamily: "var(--font-mono)", flexShrink: 0 }}>{k.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LineageArrow({ color, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 4px", minWidth: 44 }}>
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
        <path d="M2 30 Q 20 8, 38 24" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="2 3" fill="none"/>
        <path d="M32 18 L 38 24 L 32 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <span style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", marginTop: -4 }}>{label}</span>
    </div>
  );
}

const ORIGIN_META = {
  ADOPT: { label: "ADOPT", color: "oklch(50% 0.14 145)", bg: "color-mix(in oklch, oklch(60% 0.14 145) 18%, transparent)" },
  TRY:   { label: "TRY",   color: "oklch(46% 0.15 240)", bg: "color-mix(in oklch, oklch(56% 0.15 240) 18%, transparent)" },
  DROP:  { label: "DROP",  color: "var(--muted-foreground)", bg: "var(--surface-3)" },
  PARK:  { label: "PARK",  color: "oklch(50% 0.13 70)",  bg: "color-mix(in oklch, oklch(78% 0.15 80) 22%, transparent)" },
};

function OriginBadge({ kind }) {
  const m = ORIGIN_META[kind] || ORIGIN_META.DROP;
  return (
    <span style={{ padding: "1px 6px", borderRadius: 3, background: m.bg, color: m.color, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", flexShrink: 0 }}>{m.label}</span>
  );
}

function SpawnCard({ spawn }) {
  const m = ORIGIN_META[spawn.origin] || ORIGIN_META.DROP;
  const phaseColor = spawn.phase ? PHASE_META[spawn.phase].color : "var(--muted-foreground)";
  return (
    <div className="row gap-3" style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, alignItems: "center", borderLeft: "3px solid " + m.color }}>
      <OriginBadge kind={spawn.origin}/>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.6" style={{ flexShrink: 0 }}>
        <path d="M7 17V7m0 0l-3 3m3-3l3 3M17 7v10m0 0l3-3m-3 3l-3-3"/>
      </svg>
      <div className="col grow" style={{ minWidth: 0, gap: 2 }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          {spawn.id
            ? <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{spawn.id}</span>
            : <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>未起票</span>}
          {spawn.phase && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "color-mix(in oklch, " + phaseColor + " 12%, transparent)", color: phaseColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{PHASE_META[spawn.phase].jp}</span>}
          <span className="muted" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>· {spawn.cycle}</span>
          <span className="muted ml-auto" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{spawn.status}</span>
        </div>
        <span style={{ fontSize: "var(--text-xs)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spawn.title}</span>
      </div>
      {spawn.id ? (
        <button onClick={() => window.openPlanDetail && window.openPlanDetail(spawn.id)}
          className="btn btn-secondary btn-sm" style={{ height: 26 }}>
          開く <I.chevronRight size={11}/>
        </button>
      ) : (
        <button className="btn btn-primary btn-sm" style={{ height: 26 }}>
          <I.plus size={11}/> 起票
        </button>
      )}
    </div>
  );
}

function LineageSidebarCard({ plan }) {
  const phaseColor = PHASE_META[plan.phase].color;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="row gap-2" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: phaseColor }}>
          <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6"/>
          <polyline points="21 4 21 9 16 9"/>
        </svg>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>系譜</span>
        <span className="muted ml-auto" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>第 {plan.iteration} 世代</span>
      </div>
      <div style={{ padding: "8px 10px" }}>
        {/* Parent */}
        <button onClick={() => window.openPlanDetail && window.openPlanDetail(plan.derivedFrom.id)}
          className="row gap-2" style={{ width: "100%", padding: "8px 8px", border: "none", background: "transparent", borderRadius: 4, cursor: "pointer", alignItems: "center", textAlign: "left", opacity: 0.75 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ width: 4, alignSelf: "stretch", background: "var(--surface-3)", borderRadius: 2 }}/>
          <div className="col grow" style={{ minWidth: 0, gap: 1 }}>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>由来</span>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{plan.derivedFrom.id} · {plan.derivedFrom.cycle}</span>
            <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{plan.derivedFrom.title}</span>
          </div>
          <I.chevronRight size={12} style={{ color: "var(--muted-foreground)" }}/>
        </button>
        {/* Connector */}
        <div style={{ marginLeft: 18, height: 14, borderLeft: "1px dashed var(--border)" }}/>
        {/* Current */}
        <div className="row gap-2" style={{ padding: "8px 8px", borderRadius: 4, alignItems: "center", background: "color-mix(in oklch, " + phaseColor + " 6%, transparent)" }}>
          <span style={{ width: 4, alignSelf: "stretch", background: phaseColor, borderRadius: 2 }}/>
          <div className="col grow" style={{ minWidth: 0, gap: 1 }}>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: phaseColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>現在</span>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{plan.id} · {plan.cycle}</span>
            <span style={{ fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{plan.title}</span>
          </div>
        </div>
        {/* Connector */}
        <div style={{ marginLeft: 18, height: 14, borderLeft: "1px dashed var(--border)" }}/>
        {/* Children */}
        <div className="col gap-1">
          {plan.spawns.map((s, i) => (
            <button key={i}
              onClick={() => s.id && window.openPlanDetail && window.openPlanDetail(s.id)}
              disabled={!s.id}
              className="row gap-2" style={{ padding: "6px 8px", border: "none", background: "transparent", borderRadius: 4, cursor: s.id ? "pointer" : "default", alignItems: "center", textAlign: "left", opacity: s.id ? 0.85 : 0.55 }}
              onMouseEnter={(e) => s.id && (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span style={{ width: 4, alignSelf: "stretch", background: ORIGIN_META[s.origin].color, borderRadius: 2, opacity: 0.6 }}/>
              <div className="col grow" style={{ minWidth: 0, gap: 1 }}>
                <div className="row gap-1" style={{ alignItems: "center" }}>
                  <OriginBadge kind={s.origin}/>
                  {s.id
                    ? <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{s.id}</span>
                    : <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-foreground)", fontStyle: "italic" }}>未起票</span>}
                </div>
                <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              </div>
              {s.id && <I.chevronRight size={12} style={{ color: "var(--muted-foreground)" }}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.PlanDetailScreen = PlanDetailScreen;

// ─────────────────────────────────────────────────────────────────────
// Issue Detail
// ─────────────────────────────────────────────────────────────────────

function IssueDetailScreen({ locale, product, project, issueId = "GK-310", setRoute }) {
  const t = T[locale];

  const issue = {
    id: issueId,
    title: "シフトテンプレート機能 — 一括承認 UI",
    status: "In Progress",
    priority: "High",
    type: "Feature",
    severity: "S2",
    repo: project ? project.name : "restaurant-pos",
    branch: "feat/shift-template",
    pr: "#142",
    assignee: "Satoshi F",
    reporter: "Naoki N",
    reviewers: ["Naoki N", "Anh K"],
    watchers: 7,
    sprint: "Sprint 13",
    points: 5,
    epic: "PDCA-Q2-001 — シフト承認フローの簡素化",
    milestone: "v1.4 (2026-05-22)",
    labels: ["feature", "ui", "pos", "sprint-13"],
    created: "2026-04-12",
    updated: "12分前",
    due: "2026-05-12",
    blockedBy: [{ id: "INF-14", title: "MariaDB バックアップ運用 ランブック", state: "進行中" }],
    blocks: [{ id: "GK-318", title: "勤怠申請に承認者を複数選択", state: "進行中" }],
    relations: [{ id: "GK-321", title: "シフト印刷の日付フォーマット修正", kind: "related" }],
  };

  const description = `## 背景

Q2 PDCA「シフト承認フローの簡素化」(PDCA-Q2-001) における主要タスク。
店長が日次シフトを一括で承認できる UI を提供し、現状の三段階承認を一段階に統合する。

## やること

- [x] テンプレート選択 UI のワイヤー
- [x] 既存 \`approval_v1\` フラグとの並走対応
- [ ] 一括承認時の差分プレビュー
- [ ] 監査ログ書き込みの境界確認
- [ ] e2e (betoya テナント)

## やらないこと

- 本部承認の完全廃止（運用側でカバー）
- モバイル承認モード（Q3 別ピッチで対応）

## 受け入れ基準

平均所要時間 ≤ 5:00、確定後の差し戻し週次 ≤ 1.0 件。`;

  const checklist = [
    { done: true,  text: "テンプレート選択 UI のワイヤー" },
    { done: true,  text: "既存 approval_v1 フラグとの並走対応" },
    { done: false, text: "一括承認時の差分プレビュー" },
    { done: false, text: "監査ログ書き込みの境界確認" },
    { done: false, text: "e2e (betoya テナント)" },
  ];
  const checklistPct = Math.round(checklist.filter(c => c.done).length / checklist.length * 100);

  const [tab, setTab] = useStD("conversation");
  const [comment, setComment] = useStD("");

  const timeline = [
    { kind: "comment", who: "Naoki N", time: "4/12 10:32", body: "PDCA-Q2-001 の主要タスクとして起票。`approval_v1` 互換は 8 週間並走で合意済 — 仕様詰めお願いします。" },
    { kind: "event",   who: "Satoshi F", time: "4/14 09:01", body: "ステータスを **In Progress** に変更", icon: "branch" },
    { kind: "event",   who: "Satoshi F", time: "4/14 09:02", body: "`feat/shift-template` ブランチを作成", icon: "branch" },
    { kind: "comment", who: "Satoshi F", time: "4/22 17:45", body: "ワイヤー第1版を Figma に上げました。テンプレート選択は左カラム固定 / 確認は右ペインで差分表示の方針です。\n\n> 「店長は左から右に視線が流れる」というユーザーテストの観察に従っています。" },
    { kind: "event",   who: "—", time: "4/26 11:08", body: "PR **#142** をオープン", icon: "pr" },
    { kind: "comment", who: "Anh K", time: "4/27 14:22", body: "監査ログのトランザクション境界、`bulk_approve` の中で囲い込んでいるけど、テンプレートメタの書き込みも同一 TX に入れた方が良さそう。" },
    { kind: "event",   who: "Naoki N", time: "5/02 10:11", body: "レビュー要求", icon: "pr" },
    { kind: "comment", who: "Satoshi F", time: "5/06 16:30", body: "betoya テナントで先行ロールアウトしました。シフト確定の所要時間がベースライン 14:38 → 7:42 まで短縮。CHECK フェーズに入ります。" },
    { kind: "event",   who: "Satoshi F", time: "5/08 09:14", body: "進捗を 80% に更新", icon: "check" },
  ];

  return (
    <div className="page fade-in">
      {/* Breadcrumb */}
      <div className="row gap-2" style={{ marginBottom: 8, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 22 }} onClick={() => setRoute && setRoute(project ? "j-issues" : "p-issues")}>
          <I.chevronLeft size={14}/> {t.issues || "課題"}
        </button>
        <span>/</span>
        <span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{issue.repo}</span>
        <span>/</span>
        <span className="mono" style={{ fontFamily: "var(--font-mono)" }}>{issue.id}</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row gap-2" style={{ alignItems: "center", marginBottom: 6 }}>
            <Badge kind={issue.status === "In Progress" ? "info" : issue.status === "Done" ? "success" : "neutral"}>
              {issue.status}
            </Badge>
            <Badge kind={issue.priority === "High" ? "error" : issue.priority === "Medium" ? "warning" : "neutral"}>
              {issue.priority}
            </Badge>
            <span className="chip" style={{ fontSize: 10 }}>{issue.type}</span>
            <span className="chip" style={{ fontSize: 10 }}>{issue.severity}</span>
            <span className="muted" style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)" }}>· 更新 {issue.updated}</span>
          </div>
          <div className="row gap-2" style={{ alignItems: "baseline" }}>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", color: "var(--muted-foreground)", fontWeight: 400 }}>{issue.id}</span>
            <h1 className="page-title" style={{ margin: 0 }}>{issue.title}</h1>
          </div>
          <div className="row gap-3" style={{ marginTop: 8, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
            <span className="row gap-1"><I.folder size={12}/> {issue.repo}</span>
            <span className="row gap-1"><I.branch size={12}/> {issue.branch}</span>
            <span className="row gap-1"><I.pr size={12}/> PR {issue.pr}</span>
            <span className="row gap-1"><I.book size={12}/> {issue.epic}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm"><I.copy size={14}/> 複製</button>
          <button className="btn btn-secondary btn-sm"><I.branch size={14}/> ブランチ</button>
          <button className="btn btn-primary btn-sm"><I.check size={14}/> ステータス変更</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="row gap-1" style={{ borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
        {[
          { id: "conversation", label: "会話", count: timeline.filter(e => e.kind === "comment").length },
          { id: "tasks",        label: "チェックリスト", count: checklist.length },
          { id: "code",         label: "コード変更", count: 12 },
          { id: "history",      label: "履歴", count: timeline.filter(e => e.kind === "event").length },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{
              padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
              borderBottom: "2px solid " + (tab === tb.id ? "var(--primary)" : "transparent"),
              color: tab === tb.id ? "var(--foreground)" : "var(--muted-foreground)",
              fontSize: "var(--text-sm)", fontWeight: tab === tb.id ? 500 : 400,
              fontFamily: "var(--font-sans-jp)",
            }}>
            {tb.label}
            <span className="muted" style={{ marginLeft: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>{tb.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* Main */}
        <div className="col gap-3">
          {tab === "conversation" && (
            <>
              {/* Description */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="row gap-2" style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                  <Avatar name={issue.reporter}/>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{issue.reporter}</span>
                  <span className="muted" style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)" }}>· {issue.created} 起票</span>
                  <button className="tb-icon-btn ml-auto" style={{ width: 24, height: 24 }} title="編集"><I.code size={12}/></button>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <Markdown body={description}/>
                </div>
              </div>

              {/* Timeline */}
              <div className="col gap-2">
                {timeline.map((e, i) => e.kind === "comment" ? (
                  <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="row gap-2" style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                      <Avatar name={e.who}/>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{e.who}</span>
                      <span className="muted" style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)" }}>· {e.time}</span>
                      <button className="tb-icon-btn ml-auto" style={{ width: 22, height: 22 }} title="返信"><I.chevronRight size={12}/></button>
                    </div>
                    <div style={{ padding: "14px 20px" }}>
                      <Markdown body={e.body}/>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="row gap-2" style={{ padding: "4px 4px 4px 14px", alignItems: "center", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--border)", display: "grid", placeItems: "center" }}>
                      {e.icon === "branch" && <I.branch size={11}/>}
                      {e.icon === "pr" && <I.pr size={11}/>}
                      {e.icon === "check" && <I.check size={11}/>}
                    </span>
                    <Avatar name={e.who === "—" ? "?" : e.who}/>
                    <span style={{ fontSize: "var(--text-xs)" }} dangerouslySetInnerHTML={{__html: e.body.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--foreground)">$1</strong>').replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:11px;background:var(--surface-2);padding:1px 4px;border-radius:3px;color:var(--foreground)">$1</code>')}}/>
                    <span className="muted ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{e.time}</span>
                  </div>
                ))}
              </div>

            </>
          )}

          {tab === "tasks" && (
            <SectionCard title="チェックリスト" kicker="TASKS"
              action={<span className="muted" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{checklistPct}% 完了</span>}>
              <div style={{ height: 4, borderRadius: 2, background: "var(--surface-3)", marginBottom: 16, overflow: "hidden" }}>
                <div style={{ width: checklistPct + "%", height: "100%", background: "oklch(60% 0.14 145)" }}/>
              </div>
              <div className="col gap-1">
                {checklist.map((c, i) => (
                  <label key={i} className="row gap-2" style={{ padding: 10, alignItems: "center", borderRadius: 6, cursor: "pointer", background: c.done ? "color-mix(in oklch, oklch(60% 0.14 145) 6%, transparent)" : "var(--surface-2)" }}>
                    <input type="checkbox" defaultChecked={c.done} style={{ width: 16, height: 16, accentColor: "var(--primary)" }}/>
                    <span style={{ fontSize: "var(--text-sm)", textDecoration: c.done ? "line-through" : "none", color: c.done ? "var(--muted-foreground)" : "var(--foreground)" }}>{c.text}</span>
                  </label>
                ))}
              </div>
            </SectionCard>
          )}

          {tab === "code" && (
            <SectionCard title="コード変更" kicker="DIFF"
              action={<span className="muted" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>PR {issue.pr} · 12 ファイル · +428 / -94</span>}>
              <div className="col gap-2">
                {[
                  { file: "apps/admin/src/views/ShiftApproval.tsx", add: 142, del: 0,  status: "added" },
                  { file: "apps/admin/src/components/BulkApproveDialog.tsx", add: 86, del: 0, status: "added" },
                  { file: "apps/api/src/routes/shifts/bulk_approve.ts", add: 64, del: 12, status: "modified" },
                  { file: "apps/api/src/services/audit.ts", add: 22, del: 4, status: "modified" },
                  { file: "packages/ui/src/Button.tsx", add: 8, del: 8, status: "modified" },
                  { file: "apps/admin/tests/e2e/betoya.spec.ts", add: 106, del: 70, status: "modified" },
                ].map((f, i) => (
                  <div key={i} className="row gap-2" style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 4, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: f.status === "added" ? "oklch(60% 0.14 145)" : "oklch(60% 0.12 250)" }}/>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file}</span>
                    <span style={{ color: "oklch(60% 0.14 145)" }}>+{f.add}</span>
                    <span style={{ color: "oklch(58% 0.18 25)" }}>-{f.del}</span>
                    <I.chevronRight size={12} style={{ color: "var(--muted-foreground)" }}/>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {tab === "history" && (
            <SectionCard title="変更履歴" kicker="HISTORY">
              <div className="col">
                {timeline.filter(e => e.kind === "event").map((e, i) => (
                  <div key={i} className="row gap-3" style={{ padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                    <span className="mono muted" style={{ fontFamily: "var(--font-mono)", fontSize: 11, width: 80 }}>{e.time}</span>
                    <Avatar name={e.who === "—" ? "?" : e.who}/>
                    <span style={{ fontSize: "var(--text-sm)" }} dangerouslySetInnerHTML={{__html: e.body.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:11px;background:var(--surface-2);padding:1px 4px;border-radius:3px">$1</code>')}}/>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="col gap-3">
          <div className="card" style={{ padding: 14 }}>
            <div className="col gap-0">
              <MetaRow label="担当">
                <div className="row gap-2" style={{ alignItems: "center" }}>
                  <Avatar name={issue.assignee}/>
                  <span style={{ fontSize: "var(--text-xs)" }}>{issue.assignee}</span>
                </div>
              </MetaRow>
              <MetaRow label="レビュー">
                <div className="row gap-1">
                  {issue.reviewers.map(r => <Avatar key={r} name={r}/>)}
                </div>
              </MetaRow>
              <MetaRow label="優先度">
                <Badge kind="error">{issue.priority}</Badge>
              </MetaRow>
              <MetaRow label="種別">
                <Badge kind="neutral" dot={false}>{issue.type}</Badge>
              </MetaRow>
              <MetaRow label="ラベル">
                <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                  {issue.labels.map(l => <span key={l} className="chip" style={{ fontSize: 10 }}>{l}</span>)}
                </div>
              </MetaRow>
              <MetaRow label="マイルストーン">
                <span style={{ fontSize: "var(--text-xs)" }}>{issue.milestone}</span>
              </MetaRow>
              <MetaRow label="スプリント">
                <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{issue.sprint}</span>
              </MetaRow>
              <MetaRow label="ポイント">
                <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{issue.points}</span>
              </MetaRow>
              <MetaRow label="期限">
                <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{issue.due}</span>
              </MetaRow>
              <MetaRow label="ウォッチ">
                <span style={{ fontSize: "var(--text-xs)" }}><I.users size={11}/> {issue.watchers}</span>
              </MetaRow>
            </div>
          </div>

          <RelationCard title="ブロックされている" tone="error" items={issue.blockedBy}/>
          <RelationCard title="ブロックしている" tone="warning" items={issue.blocks}/>
          <RelationCard title="関連" tone="info" items={issue.relations}/>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontWeight: 500, fontSize: "var(--text-sm)" }}>所属 PDCA</div>
            <button onClick={() => window.openPlanDetail && window.openPlanDetail("PDCA-Q2-001")}
              className="row gap-2"
              style={{ width: "100%", padding: 12, alignItems: "center", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = ""}>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: "color-mix(in oklch, " + PHASE_META.DO.color + " 15%, transparent)", color: PHASE_META.DO.color, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>D</span>
              <div className="col grow" style={{ minWidth: 0 }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>シフト承認フローの簡素化</span>
                <span className="mono muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>PDCA-Q2-001 · DO</span>
              </div>
              <I.chevronRight size={14} style={{ color: "var(--muted-foreground)" }}/>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky quick composer (backlog.com-style) */}
      <QuickComposer
        issueId={issue.id}
        currentUser={issue.assignee}
        defaultStatus={issue.status}
        defaultAssignee={issue.assignee}
        defaultPriority={issue.priority}
      />
    </div>
  );
}

function RelationCard({ title, tone, items }) {
  if (!items || !items.length) return null;
  const toneColor = tone === "error" ? "oklch(58% 0.18 25)" : tone === "warning" ? "oklch(72% 0.14 70)" : "oklch(56% 0.15 240)";
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="row gap-2" style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: toneColor }}/>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>{title}</span>
        <span className="muted ml-auto" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{items.length}</span>
      </div>
      <div className="col" style={{ padding: 4 }}>
        {items.map(it => (
          <button key={it.id}
            onClick={() => window.openIssueDetail && window.openIssueDetail(it.id)}
            className="row gap-2"
            style={{ padding: "6px 10px", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, textAlign: "left" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = ""}>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", width: 56, flexShrink: 0 }}>{it.id}</span>
            <span style={{ fontSize: "var(--text-xs)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
            {it.state && <span style={{ fontSize: 10, color: toneColor, fontFamily: "var(--font-mono)" }}>{it.state}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Tiny markdown-ish renderer (h2, lists, checkboxes, code, blockquotes, paragraphs)
function Markdown({ body }) {
  const lines = body.split("\n");
  const blocks = [];
  let buf = [];
  let mode = "p";
  const flush = () => {
    if (!buf.length) return;
    if (mode === "p") {
      blocks.push(<p key={blocks.length} style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: inline(buf.join(" ")) }}/>);
    } else if (mode === "ul") {
      blocks.push(
        <ul key={blocks.length} style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
          {buf.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(l) }}/>)}
        </ul>
      );
    } else if (mode === "task") {
      blocks.push(
        <ul key={blocks.length} style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
          {buf.map((l, i) => {
            const done = l.startsWith("[x]");
            const text = l.replace(/^\[[x ]\]\s*/, "");
            return (
              <li key={i} className="row gap-2" style={{ alignItems: "center" }}>
                <span style={{ width: 14, height: 14, border: "1.5px solid var(--border)", borderRadius: 3, background: done ? "oklch(60% 0.14 145)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {done && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
                </span>
                <span style={{ textDecoration: done ? "line-through" : "none", color: done ? "var(--muted-foreground)" : "var(--foreground)" }} dangerouslySetInnerHTML={{ __html: inline(text) }}/>
              </li>
            );
          })}
        </ul>
      );
    } else if (mode === "quote") {
      blocks.push(
        <blockquote key={blocks.length} style={{ margin: "0 0 12px", padding: "8px 14px", borderLeft: "3px solid var(--border)", color: "var(--muted-foreground)", fontSize: "var(--text-sm)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: inline(buf.join(" ")) }}/>
      );
    }
    buf = [];
  };
  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.92em;background:var(--surface-2);padding:1px 5px;border-radius:3px">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--primary);text-decoration:none">$1</a>');
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); mode = "p"; continue; }
    if (line.startsWith("## ")) { flush(); blocks.push(<h2 key={blocks.length} style={{ fontSize: "var(--text-base)", fontWeight: 600, margin: "16px 0 8px" }}>{line.slice(3)}</h2>); mode = "p"; continue; }
    if (line.startsWith("- [")) { if (mode !== "task") flush(); mode = "task"; buf.push(line.slice(2)); continue; }
    if (line.startsWith("- "))  { if (mode !== "ul")   flush(); mode = "ul";   buf.push(line.slice(2)); continue; }
    if (line.startsWith("> "))  { if (mode !== "quote") flush(); mode = "quote"; buf.push(line.slice(2)); continue; }
    if (mode !== "p") flush();
    mode = "p"; buf.push(line);
  }
  flush();
  return <>{blocks}</>;
}

window.IssueDetailScreen = IssueDetailScreen;

// ─────────────────────────────────────────────────────────────────
// QuickComposer — sticky footer comment composer (backlog.com-style).
// Collapsed: 52px row with avatar + placeholder + status/priority chips.
// Expanded:  Write/Preview, formatting, status/担当者/優先度 popover pickers,
//            "apply changes on submit" hint, ⌘+Enter submit, Esc collapse.
// ─────────────────────────────────────────────────────────────────

const QC_STATUS = [
  { value: "open",        label: "オープン",   color: "oklch(56% 0.15 240)" },
  { value: "in_progress", label: "進行中",     color: "oklch(72% 0.14 70)"  },
  { value: "in_review",   label: "レビュー中", color: "oklch(56% 0.16 290)" },
  { value: "done",        label: "完了",       color: "oklch(58% 0.14 150)" },
  { value: "closed",      label: "クローズ",   color: "oklch(55% 0.02 250)" },
];
const QC_PRIORITY = [
  { value: "P0", label: "P0 緊急", color: "oklch(58% 0.18 25)" },
  { value: "P1", label: "P1 高",   color: "oklch(65% 0.16 35)" },
  { value: "P2", label: "P2 中",   color: "oklch(72% 0.14 70)" },
  { value: "P3", label: "P3 低",   color: "oklch(55% 0.02 250)" },
];
const QC_ASSIGNEES = ["山田 太郎","佐藤 花子","鈴木 一郎","田中 翔","高橋 美咲","未割当"];

function MiniAvatar({ name, size = 22 }) {
  const initials = (name || "?").split(/\s+/).map(s => s[0]).slice(0,2).join("").toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      display: "grid", placeItems: "center",
      background: "color-mix(in oklch, var(--accent) 14%, var(--surface-2))",
      color: "var(--accent)", fontFamily: "var(--font-mono)",
      fontSize: Math.max(9, Math.round(size * 0.42)), fontWeight: 600,
      letterSpacing: 0.2,
    }}>{initials}</span>
  );
}

function QuickComposer({ issueId, currentUser, defaultStatus = "in_progress", defaultAssignee, defaultPriority = "P1" }) {
  const [expanded, setExpanded] = useStD(false);
  const [text, setText] = useStD("");
  const [mode, setMode] = useStD("write");
  const [status, setStatus] = useStD(defaultStatus);
  const [assignee, setAssignee] = useStD(defaultAssignee || currentUser);
  const [priority, setPriority] = useStD(defaultPriority);
  const [openMenu, setOpenMenu] = useStD(null); // null | "status" | "assignee" | "priority"
  const taRef = useRefD(null);
  const rootRef = useRefD(null);

  const statusObj = QC_STATUS.find(s => s.value === status) || QC_STATUS[0];
  const priorityObj = QC_PRIORITY.find(p => p.value === priority) || QC_PRIORITY[1];
  const statusChanged = status !== defaultStatus;
  const assigneeChanged = assignee !== (defaultAssignee || currentUser);

  const expand = () => {
    setExpanded(true);
    setTimeout(() => taRef.current && taRef.current.focus(), 60);
  };
  const collapse = () => {
    if (!text.trim()) {
      setExpanded(false);
      setOpenMenu(null);
      setStatus(defaultStatus);
      setAssignee(defaultAssignee || currentUser);
      setPriority(defaultPriority);
    }
  };
  const submit = () => {
    if (!text.trim()) return;
    setText("");
    setExpanded(false);
    setOpenMenu(null);
  };

  // Keyboard: Esc collapse, ⌘/Ctrl+Enter submit, "C" anywhere expands
  useEffD(() => {
    const onKey = (e) => {
      if (expanded) {
        if (e.key === "Escape") collapse();
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
      } else {
        const tag = (e.target && e.target.tagName) || "";
        const editable = tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable);
        if (!editable && (e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          expand();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Click outside closes any open picker
  useEffD(() => {
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={rootRef} style={{
      position: "sticky", bottom: 0, zIndex: 30,
      marginLeft: -24, marginRight: -24, marginTop: 24,
      background: "color-mix(in oklch, var(--background) 92%, transparent)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderTop: "1px solid var(--border)",
      boxShadow: expanded ? "0 -8px 24px oklch(0 0 0 / 0.08)" : "0 -2px 8px oklch(0 0 0 / 0.04)",
      transition: "box-shadow 200ms ease",
    }}>
      {!expanded ? (
        <button onClick={expand}
          className="row gap-3"
          style={{
            width: "100%", padding: "0 24px", height: 52,
            background: "transparent", border: "none", cursor: "text",
            alignItems: "center", textAlign: "left", color: "inherit",
          }}>
          <MiniAvatar name={currentUser} size={26}/>
          <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
            <span className="mono" style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginRight: 8, color: "var(--muted-foreground)" }}>{issueId}</span>
            にコメントを追加…
          </span>
          <div className="row gap-1" onClick={(e) => e.stopPropagation()} style={{ alignItems: "center" }}>
            <span className="row gap-1" style={{
              padding: "3px 8px", height: 22, borderRadius: 4,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              fontSize: 11, alignItems: "center",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: statusObj.color }}/>
              <span>{statusObj.label}</span>
            </span>
            <span className="row gap-1" style={{
              padding: "3px 8px", height: 22, borderRadius: 4,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              fontSize: 11, fontFamily: "var(--font-mono)", alignItems: "center",
            }}>{priorityObj.value}</span>
            <kbd style={{
              marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 10,
              padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)",
              border: "1px solid var(--border)", color: "var(--muted-foreground)",
            }}>C</kbd>
          </div>
        </button>
      ) : (
        <div style={{ padding: "10px 24px 14px" }}>
          {/* Toolbar */}
          <div className="row gap-2" style={{ marginBottom: 8, alignItems: "center" }}>
            <div className="row gap-1" style={{ background: "var(--surface-2)", borderRadius: 6, padding: 2 }}>
              {[["write","Write"],["preview","Preview"]].map(([k,l]) => (
                <button key={k} onClick={() => setMode(k)}
                  style={{
                    border: "none", padding: "3px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer",
                    background: mode === k ? "var(--background)" : "transparent",
                    boxShadow: mode === k ? "0 1px 2px oklch(0 0 0 / 0.06)" : "none",
                    fontWeight: 500, color: "var(--foreground)",
                  }}>{l}</button>
              ))}
            </div>
            <div className="row gap-0" style={{ borderLeft: "1px solid var(--border)", paddingLeft: 8, marginLeft: 2 }}>
              {[
                { l:"B", w: 600, ff: "var(--font-sans-jp)" },
                { l:"I", w: 400, ff: "var(--font-sans-jp)", fs: "italic" },
                { l:"</>", w: 500, ff: "var(--font-mono)" },
                { l:"🔗", ff: "var(--font-sans-jp)" },
                { l:"≡", ff: "var(--font-sans-jp)" },
                { l:"”", ff: "var(--font-sans-jp)" },
              ].map((b,i) => (
                <button key={i}
                  className="tb-icon-btn"
                  style={{ width: 26, height: 26, fontSize: 12, fontWeight: b.w || 400, fontFamily: b.ff, fontStyle: b.fs || "normal", color: "var(--muted-foreground)" }}>
                  {b.l}
                </button>
              ))}
            </div>
            <span className="muted ml-auto" style={{ fontSize: 11 }}>@ メンション · # 課題 · / コマンド</span>
          </div>

          {/* Editor / preview */}
          {mode === "write" ? (
            <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="コメントを書く… (Markdown 対応 · ⌘+Enter で送信)"
              style={{
                width: "100%", minHeight: 96, maxHeight: 240, resize: "vertical",
                border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                fontSize: "var(--text-sm)", lineHeight: 1.6, fontFamily: "var(--font-sans-jp)",
                background: "var(--background)", color: "var(--foreground)", outline: "none",
                boxSizing: "border-box",
              }}/>
          ) : (
            <div style={{
              minHeight: 96, padding: "8px 12px",
              border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface-2)", fontSize: "var(--text-sm)",
            }}>
              {text.trim() ? <Markdown body={text}/> : <span className="muted">プレビューする内容がありません</span>}
            </div>
          )}

          {/* Action bar */}
          <div className="row gap-2" style={{ marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <QCPill label="ステータス" value={statusObj.label} dot={statusObj.color}
              changed={statusChanged}
              open={openMenu === "status"}
              onToggle={() => setOpenMenu(openMenu === "status" ? null : "status")}>
              {QC_STATUS.map(o => (
                <QCPickRow key={o.value} active={o.value === status} onClick={() => { setStatus(o.value); setOpenMenu(null); }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: o.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1 }}>{o.label}</span>
                </QCPickRow>
              ))}
            </QCPill>

            <QCPill label="担当者" value={assignee} avatar={assignee}
              changed={assigneeChanged}
              open={openMenu === "assignee"}
              onToggle={() => setOpenMenu(openMenu === "assignee" ? null : "assignee")}>
              {QC_ASSIGNEES.map(n => (
                <QCPickRow key={n} active={n === assignee} onClick={() => { setAssignee(n); setOpenMenu(null); }}>
                  <MiniAvatar name={n} size={18}/>
                  <span style={{ flex: 1 }}>{n}</span>
                </QCPickRow>
              ))}
            </QCPill>

            <QCPill label="優先度" value={priorityObj.label} dot={priorityObj.color} mono
              open={openMenu === "priority"}
              onToggle={() => setOpenMenu(openMenu === "priority" ? null : "priority")}>
              {QC_PRIORITY.map(o => (
                <QCPickRow key={o.value} active={o.value === priority} onClick={() => { setPriority(o.value); setOpenMenu(null); }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: o.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12 }}>{o.label}</span>
                </QCPickRow>
              ))}
            </QCPill>

            <div className="ml-auto row gap-2" style={{ alignItems: "center" }}>
              {(statusChanged || assigneeChanged) && (
                <span className="row gap-1" style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 4,
                  background: "color-mix(in oklch, oklch(72% 0.14 70) 14%, transparent)",
                  color: "oklch(45% 0.14 70)", alignItems: "center",
                }}>
                  <span>↻</span>
                  <span>送信時に変更を反映</span>
                </span>
              )}
              <button onClick={() => { setText(""); setExpanded(false); setOpenMenu(null); }}
                className="btn btn-ghost btn-sm">キャンセル
                <kbd style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.6 }}>Esc</kbd>
              </button>
              <button onClick={submit}
                disabled={!text.trim()}
                className="btn btn-primary btn-sm"
                style={{ opacity: text.trim() ? 1 : 0.45, cursor: text.trim() ? "pointer" : "not-allowed" }}>
                コメント
                <kbd style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.75 }}>⌘↵</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QCPill({ label, value, dot, avatar, mono, changed, open, onToggle, children }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onToggle}
        className="row gap-1"
        style={{
          padding: "0 10px", height: 28, borderRadius: 6,
          background: open ? "var(--surface-2)" : "var(--background)",
          border: "1px solid " + (changed ? "oklch(72% 0.14 70)" : "var(--border)"),
          cursor: "pointer", fontSize: 12, alignItems: "center",
          fontFamily: "var(--font-sans-jp)",
          boxShadow: changed ? "0 0 0 3px color-mix(in oklch, oklch(72% 0.14 70) 18%, transparent)" : "none",
          transition: "all 120ms ease",
        }}>
        <span className="muted" style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
        <span style={{ width: 1, height: 12, background: "var(--border)", margin: "0 6px 0 4px" }}/>
        {avatar ? <MiniAvatar name={avatar} size={16}/> : dot && <span style={{ width: 8, height: 8, borderRadius: 99, background: dot, flexShrink: 0 }}/>}
        <span style={{ fontFamily: mono ? "var(--font-mono)" : "var(--font-sans-jp)", fontWeight: 500 }}>{value}</span>
        <I.chevronDown size={11}/>
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: 0,
          minWidth: 220, background: "var(--background)",
          border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 10px 28px oklch(0 0 0 / 0.14), 0 2px 6px oklch(0 0 0 / 0.06)",
          padding: 4, zIndex: 40,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function QCPickRow({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="row gap-2"
      style={{
        width: "100%", padding: "6px 8px", borderRadius: 4,
        background: active ? "var(--surface-2)" : "transparent",
        border: "none", cursor: "pointer", fontSize: 12,
        alignItems: "center", textAlign: "left",
        fontFamily: "var(--font-sans-jp)", color: "var(--foreground)",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {children}
      {active && <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>✓</span>}
    </button>
  );
}

window.QuickComposer = QuickComposer;