/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateB, useMemo: useMemoB } = React;

const yenB = (n) => "¥" + (n || 0).toLocaleString();

// ── Organizations ────────────────────────────────────────────────────
function MeOrgs({ memberships, services, setRoute, openCreateOrg }) {
  const I = window.I;
  const [tab, setTab] = useStateB("active");
  const counts = {
    all:     memberships.length,
    active:  memberships.filter(m => m.status === "active").length,
    past:    memberships.filter(m => m.status === "past").length,
  };
  const rows = memberships.filter(m => tab === "all" || m.status === tab);

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">所属組織</h1>
          <p className="page-subtitle">あなたが現在・過去に所属した組織。退職後も給与明細等の履歴データはここから参照できます。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.handshake(13)} 招待コードを入力</button>
          <button className="btn btn-primary btn-sm" onClick={openCreateOrg}>{I.plus(13)} 組織を作成</button>
        </div>
      </header>

      <div className="me-tabs">
        {[["active","現在所属", counts.active],["past","退職済み", counts.past],["all","すべて", counts.all]].map(([k,l,c]) => (
          <div key={k} className="tab" data-active={tab===k} onClick={() => setTab(k)}>
            {l} <span className="muted" style={{ marginLeft: 6 }}>{c}</span>
          </div>
        ))}
      </div>

      <div className="me-orgs" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
        {rows.map(m => <FullOrgCard key={m.id} m={m} services={services} setRoute={setRoute}/>)}
      </div>
    </div>
  );
}

function FullOrgCard({ m, services, setRoute }) {
  const I = window.I;
  const isPast = m.status === "past";
  return (
    <article className="me-org-card" data-past={isPast || undefined}>
      <div className="me-org-head">
        <div className="me-org-mark" style={{ background: m.orgColor }}>{m.orgInitial}</div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="me-org-name">{m.orgName}</div>
          <div className="me-org-role">{m.role} · {m.department}</div>
        </div>
        {m.isOwner && <span className="badge badge-attention"><span className="dot"/>Owner</span>}
        {isPast && <span className="badge badge-neutral"><span className="dot"/>退職済み</span>}
      </div>

      <dl className="ov-dl" style={{ fontSize: 12, gridTemplateColumns: "80px 1fr", gap: "4px 12px", margin: 0 }}>
        <dt>従業員ID</dt><dd className="mono">{m.employeeId}</dd>
        <dt>所属拠点</dt><dd>{m.branch} <span className="muted mono" style={{ fontSize: 10, marginLeft: 4 }}>{m.branchCode}</span></dd>
        <dt>入社日</dt><dd className="mono">{m.joinedAt}</dd>
        {isPast && <>
          <dt>退職日</dt><dd className="mono">{m.leftAt}</dd>
          <dt>事由</dt><dd>{m.reason}</dd>
        </>}
      </dl>

      <div>
        <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          {isPast ? "履歴データの参照" : "利用可能なサービス"}
        </div>
        <div className="me-org-services">
          {(isPast ? m.historicalServices : m.services).map(sid => {
            const s = services[sid];
            if (!s) return null;
            return <span key={sid} className="chip">
              <span className="prod-sticker xs" style={{ background: s.accent }}>{s.sticker}</span>
              {s.name}
              {isPast && <span className="muted" style={{ fontSize: 10, marginLeft: 4 }}>(履歴)</span>}
            </span>;
          })}
          {(isPast ? m.historicalServices : m.services).length === 0 &&
            <span className="muted" style={{ fontSize: 12 }}>—</span>}
        </div>
      </div>

      <div className="row gap-2" style={{ paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        {!isPast && <button className="btn btn-primary btn-sm">{I.external(13)} 組織コンソールへ</button>}
        {isPast && <button className="btn btn-secondary btn-sm" onClick={() => setRoute("payslips")}>{I.wallet(13)} 給与履歴</button>}
        <button className="btn btn-ghost btn-sm">{I.lock(13)} プライバシー</button>
        {!isPast && !m.isOwner && <button className="btn btn-ghost btn-sm ml-auto" style={{ color: "var(--destructive)" }}>{I.logout(13)} 退会</button>}
      </div>
    </article>
  );
}

// ── Invitations ──────────────────────────────────────────────────────
function MeInvitations({ invitations, services, setRoute }) {
  const I = window.I;

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">招待</h1>
          <p className="page-subtitle">あなた宛に届いた組織からの参加依頼。承諾するとその組織のメンバーになります。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.handshake(13)} 招待コードを入力</button>
        </div>
      </header>

      {invitations.length === 0 ? (
        <div className="me-empty">
          <div className="me-empty-icon">{I.handshake(22)}</div>
          <div className="me-empty-title">届いている招待はありません</div>
          <div className="me-empty-desc">組織から招待されると、メールと共にここに表示されます。組織のオーナーから受け取った招待コードがあれば下記から入力できます。</div>
          <div className="me-empty-actions">
            <button className="btn btn-secondary btn-sm">{I.handshake(13)} 招待コードを入力</button>
            <button className="btn btn-primary btn-sm" onClick={() => setRoute("orgs")}>{I.plus(13)} 自分で組織を作成</button>
          </div>
        </div>
      ) : (
        <div className="ds-cards">
          {invitations.map((inv, i) => <InvitationCard key={inv.id} inv={inv} services={services} fresh={i===0}/>)}
        </div>
      )}
    </div>
  );
}

function InvitationCard({ inv, services, fresh }) {
  const I = window.I;
  return (
    <article className="invitation-card" data-fresh={fresh || undefined}>
      <div className="invitation-head">
        <div className="me-org-mark" style={{ background: inv.orgColor, width: 44, height: 44, fontSize: 16, borderRadius: 10 }}>{inv.orgInitial}</div>
        <div className="grow">
          <div style={{ fontSize: 15, fontWeight: 500 }}>{inv.orgName} <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>から</span></div>
          <div className="muted" style={{ fontSize: 12 }}>{inv.invitedBy} <span className="mono">&lt;{inv.invitedByEmail}&gt;</span> · {inv.invitedAt}</div>
        </div>
        <span className="badge badge-attention"><span className="dot pulse"/>未対応</span>
      </div>

      <dl className="ov-dl" style={{ fontSize: 12, gridTemplateColumns: "90px 1fr", gap: "4px 12px", margin: 0 }}>
        <dt>ロール</dt><dd><strong>{inv.role}</strong></dd>
        <dt>利用サービス</dt><dd>
          <div className="me-org-services">
            {inv.services.map(sid => {
              const s = services[sid];
              return <span key={sid} className="chip"><span className="prod-sticker xs" style={{ background: s.accent }}>{s.sticker}</span>{s.name}</span>;
            })}
          </div>
        </dd>
        <dt>有効期限</dt><dd className="mono">{inv.expiresAt}</dd>
      </dl>

      {inv.note && <div className="invitation-note">{inv.note}</div>}

      <div className="invitation-foot">
        <button className="btn btn-primary btn-sm">{I.check(13)} 承諾</button>
        <button className="btn btn-ghost btn-sm">{I.x(13)} 辞退</button>
        <span className="muted ml-auto" style={{ fontSize: 11 }}>
          承諾すると <strong style={{ color: "var(--foreground)" }}>氏名・メール</strong> が組織に共有されます
        </span>
      </div>
    </article>
  );
}

// ── Payslips ─────────────────────────────────────────────────────────
function MePayslips({ payslips, memberships, setRoute }) {
  const I = window.I;
  const [year, setYear] = useStateB(2026);
  const [orgFilter, setOrgFilter] = useStateB("all");

  // Group orgs (current + past) that have payslips.
  const orgsWithSlips = useMemoB(() => {
    const seen = new Map();
    payslips.forEach(p => seen.set(p.orgId, p.orgName));
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name, past: memberships.find(m=>m.orgId===id)?.status === "past" }));
  }, [payslips, memberships]);

  const filtered = useMemoB(() => payslips.filter(p =>
    p.period.startsWith(String(year)) && (orgFilter === "all" || p.orgId === orgFilter)
  ), [payslips, year, orgFilter]);

  const ytdNet   = filtered.filter(p => p.status !== "scheduled").reduce((a,p) => a + p.net, 0);
  const ytdGross = filtered.filter(p => p.status !== "scheduled").reduce((a,p) => a + p.gross, 0);

  // Build monthly bar chart (last 12 months across all orgs, current year)
  const chartData = useMemoB(() => {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const period = `${year}-${String(m).padStart(2,"0")}`;
      const total = payslips
        .filter(p => p.period === period && (orgFilter === "all" || p.orgId === orgFilter) && p.status !== "scheduled")
        .reduce((a,p) => a + p.net, 0);
      months.push({ m, period, total });
    }
    return months;
  }, [payslips, year, orgFilter]);
  const maxBar = Math.max(...chartData.map(d => d.total), 1);

  const years = useMemoB(() => {
    const set = new Set();
    payslips.forEach(p => set.add(Number(p.period.slice(0,4))));
    return Array.from(set).sort((a,b) => b - a);
  }, [payslips]);

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">給与明細</h1>
          <p className="page-subtitle">現在と過去すべての勤務先からの明細。退職後も継続して参照できます。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.download(13)} 一括ダウンロード</button>
        </div>
      </header>

      <div className="payslip-grid">
        <div className="card payslip-summary">
          <div className="payslip-summary-l">{year} 年 手取り合計</div>
          <div className="payslip-summary-v">
            {yenB(ytdNet)}<span className="yen">/年</span>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
              <span className="muted" style={{ fontSize: 12 }}>総支給</span>
              <span className="tnum mono">{yenB(ytdGross)}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
              <span className="muted" style={{ fontSize: 12 }}>控除合計</span>
              <span className="tnum mono">{yenB(ytdGross - ytdNet)}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
              <span className="muted" style={{ fontSize: 12 }}>明細件数</span>
              <span className="tnum mono">{filtered.length} 件</span>
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 className="card-title">月次 手取り推移 — {year}</h3>
            <span className="muted" style={{ fontSize: 11 }}>{orgFilter === "all" ? "全組織合算" : orgsWithSlips.find(o=>o.id===orgFilter)?.name}</span>
          </div>
          <div className="chart-bars">
            {chartData.map(d => (
              <div key={d.m} className="chart-bar"
                   style={{ height: `${(d.total / maxBar) * 100}%`, minHeight: d.total ? 4 : 1, opacity: d.total ? 1 : 0.4 }}
                   title={`${d.period}: ${yenB(d.total)}`}>
                <div className="chart-bar-cap">{d.m}月</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="payslip-toolbar">
        <div className="seg">
          {years.map(y => (
            <button key={y} className={year===y?"on":""} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
        <div className="seg">
          <button className={orgFilter==="all"?"on":""} onClick={() => setOrgFilter("all")}>すべて</button>
          {orgsWithSlips.map(o => (
            <button key={o.id} className={orgFilter===o.id?"on":""} onClick={() => setOrgFilter(o.id)}>
              {o.name} {o.past && <span className="muted" style={{ fontSize: 10, marginLeft: 2 }}>(退職)</span>}
            </button>
          ))}
        </div>
        <span className="muted ml-auto" style={{ fontSize: 12 }}>{filtered.length} 件</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>支給月</th>
            <th>支給元</th>
            <th className="num">総支給</th>
            <th className="num">控除</th>
            <th className="num">手取り</th>
            <th>支給日</th>
            <th>状態</th>
            <th style={{ width: 80 }}></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)" }}>該当する明細はありません</td></tr>
            )}
            {filtered.map(p => {
              const isPast = memberships.find(m => m.orgId === p.orgId)?.status === "past";
              return (
                <tr key={p.id}>
                  <td><strong>{p.periodLabel}</strong>{p.note && <div className="muted" style={{ fontSize: 11 }}>{p.note}</div>}</td>
                  <td>
                    <div className="row gap-2">
                      <span>{p.orgName}</span>
                      {isPast && <span className="chip" style={{ fontSize: 10 }}>退職済み</span>}
                    </div>
                  </td>
                  <td className="num mono">{yenB(p.gross)}</td>
                  <td className="num mono muted">{yenB(p.deductions)}</td>
                  <td className="num mono" style={{ fontWeight: 500 }}>{yenB(p.net)}</td>
                  <td className="mono">{p.paidAt}</td>
                  <td>
                    {p.status === "released"  && <span className="badge badge-success"><span className="dot"/>公開</span>}
                    {p.status === "scheduled" && <span className="badge badge-warning"><span className="dot"/>予定</span>}
                    {p.status === "final"     && <span className="badge badge-neutral"><span className="dot"/>確定</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="tb-icon-btn" title="表示">{I.eye(14)}</button>
                    <button className="tb-icon-btn" title="ダウンロード">{I.download(14)}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tax documents ────────────────────────────────────────────────────
function MeTax({ taxDocs }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">源泉徴収票・年末調整</h1>
          <p className="page-subtitle">確定申告や住宅ローン審査で使用する税務関連書類。過去の勤務先発行のものも保管されます。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.download(13)} 一括 PDF</button>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>対象年</th>
            <th>種類</th>
            <th>発行元</th>
            <th className="num">年間支給</th>
            <th>発行日</th>
            <th></th>
            <th style={{ width: 80 }}></th>
          </tr></thead>
          <tbody>
            {taxDocs.map(d => (
              <tr key={d.id}>
                <td><strong>{d.year} 年</strong></td>
                <td>{d.type}</td>
                <td>
                  <div className="row gap-2">
                    <span>{d.orgName}</span>
                    {d.archived && <span className="chip" style={{ fontSize: 10 }}>履歴</span>}
                  </div>
                </td>
                <td className="num mono">{yenB(d.grossYear)}</td>
                <td className="mono">{d.issuedAt}</td>
                <td>{d.archived ? <span className="badge badge-neutral"><span className="dot"/>退職組織</span> : <span className="badge badge-info"><span className="dot"/>現組織</span>}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="tb-icon-btn" title="表示">{I.eye(14)}</button>
                  <button className="tb-icon-btn" title="ダウンロード">{I.download(14)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16, padding: "16px 20px" }}>
        <div className="row gap-3" style={{ alignItems: "flex-start" }}>
          <span style={{ color: "var(--info)" }}>{I.info(18)}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>過去の勤務先の書類について</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
              退職した組織の源泉徴収票・給与明細は、組織側の保存期間 (法定: 7年間) 内であれば dxs から再発行を依頼できます。発行依頼は各書類の右側メニューから。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attendance summary (link-out to kintai service) ─────────────────
function MeAttendance({ memberships }) {
  const I = window.I;
  const active = memberships.filter(m => m.status === "active" && m.services.includes("kintai"));

  // Simulated monthly summary
  const monthData = [
    { period: "2026/05", days: 12, hours: 96.5, overtime: 4.2, late: 0, paid: 2 },
    { period: "2026/04", days: 21, hours: 168.0, overtime: 12.5, late: 1, paid: 1 },
    { period: "2026/03", days: 22, hours: 176.0, overtime: 18.0, late: 0, paid: 0 },
    { period: "2026/02", days: 19, hours: 152.0, overtime: 8.0, late: 0, paid: 1 },
  ];

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">勤怠履歴</h1>
          <p className="page-subtitle">所属組織の勤怠管理サービスからの履歴サマリー。詳細は各組織のサービスで確認できます。</p>
        </div>
      </header>

      <div className="ds-stats" style={{ marginBottom: 24 }}>
        <KPICard icon={I.clock(18)} label="今月 勤務日数" value="12 日" foot="所定 20 日中" />
        <KPICard icon={I.clock(18)} label="今月 勤務時間" value="96.5 h" foot="残業 4.2 h" />
        <KPICard icon={I.calendar(18)} label="残有給" value="14 日" foot="付与 20 日中" accent="info" />
        <KPICard icon={I.briefcase(18)} label="所属サービス" value={String(active.length)} foot="勤怠管理を利用中" />
      </div>

      <div className="ds-section-label">月次サマリー (Famgia 本社)</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>対象月</th>
            <th className="num">勤務日数</th>
            <th className="num">勤務時間</th>
            <th className="num">残業</th>
            <th className="num">遅刻</th>
            <th className="num">有給</th>
            <th></th>
          </tr></thead>
          <tbody>
            {monthData.map(d => (
              <tr key={d.period}>
                <td><strong>{d.period}</strong></td>
                <td className="num tnum">{d.days}</td>
                <td className="num tnum">{d.hours.toFixed(1)} h</td>
                <td className="num tnum"><span style={{ color: d.overtime > 10 ? "var(--attention)" : undefined }}>{d.overtime.toFixed(1)} h</span></td>
                <td className="num tnum">{d.late > 0 ? <span style={{ color: "var(--attention)" }}>{d.late}</span> : "—"}</td>
                <td className="num tnum">{d.paid}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost btn-sm">{I.external(12)} 勤怠管理で開く</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, foot, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-head">
        <div className="stat-label">{label}</div>
        <div className="stat-icon" style={accent === "info" ? { background: "color-mix(in oklch, var(--info) 14%, transparent)", color: "var(--info)" } : undefined}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}

Object.assign(window, { MeOrgs, MeInvitations, MePayslips, MeTax, MeAttendance });
