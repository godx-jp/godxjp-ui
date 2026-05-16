/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateB, useMemo: useMemoB } = React;

// ── Org → Members ───────────────────────────────────────────────────
function OrgMembersScreen({ members, branches, teams, services, openInvite }) {
  const I = window.I;
  const [q, setQ] = useStateB("");
  const [tab, setTab] = useStateB("all");
  const rows = useMemoB(() => members.filter(m =>
    (tab === "all" || m.status === tab) &&
    (!q || (m.name + m.email).toLowerCase().includes(q.toLowerCase()))
  ), [members, q, tab]);

  const counts = {
    all: members.length,
    active: members.filter(m => m.status === "active").length,
    invited: members.filter(m => m.status === "invited").length,
    suspended: members.filter(m => m.status === "suspended").length,
  };

  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">組織に所属するユーザーの管理</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.download(14)} CSV</button>
          <button className="btn btn-primary btn-sm" onClick={openInvite}>{I.send(14)} Invite members</button>
        </div>
      </header>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[["all","All"],["active","Active"],["invited","Invited"],["suspended","Suspended"]].map(([k,l]) => (
          <div key={k} className="tab" data-active={tab===k} onClick={() => setTab(k)}>
            {l} <span className="muted" style={{ marginLeft: 6 }}>{counts[k]}</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="tb-search-wrap" style={{ width: 320 }}>
          <span className="tb-search-icon">{I.search(14)}</span>
          <input className="tb-search-input" placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="btn btn-secondary btn-sm">{I.filter(14)} Filter</button>
        <span className="muted ml-auto" style={{ fontSize: "var(--text-xs)" }}>{rows.length} members</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>Member</th><th>Role</th><th>Branches</th><th>Teams</th><th>Services</th><th>Joined</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="row gap-3">
                    <div className="avatar" style={{ background: pickAvatar(m.id) }}>{m.name.split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div className="mono muted" style={{ fontSize: "var(--text-xs)" }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td><RoleBadge role={m.role} /></td>
                <td>
                  {m.branches.length === 0 ? <span className="muted">—</span> :
                    <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                      {m.branches.slice(0,2).map(id => <span key={id} className="chip">{branches.find(b=>b.id===id)?.code}</span>)}
                      {m.branches.length > 2 && <span className="chip muted">+{m.branches.length-2}</span>}
                    </div>}
                </td>
                <td>
                  {m.teams.length === 0 ? <span className="muted">—</span> :
                    <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                      {m.teams.slice(0,2).map(id => {
                        const t = teams.find(x=>x.id===id);
                        return <span key={id} className="chip"><span className="dot" style={{background:t?.color}}/>{t?.name}</span>;
                      })}
                      {m.teams.length > 2 && <span className="chip muted">+{m.teams.length-2}</span>}
                    </div>}
                </td>
                <td>
                  {m.services.length === 0 ? <span className="muted">—</span> :
                    <div className="row gap-1">
                      {m.services.map(id => {
                        const s = services.find(x=>x.id===id);
                        return <span key={id} className="prod-sticker xs" style={{ background: s?.accent }} title={s?.name}>{s?.sticker}</span>;
                      })}
                    </div>}
                </td>
                <td className="mono muted" style={{ fontSize: "var(--text-xs)" }}>{m.joined}</td>
                <td><StatusBadge status={m.status} /></td>
                <td style={{ width: 32 }}><button className="tb-icon-btn">{I.moreV(14)}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const kind = role === "Owner" ? "attention" : role === "Admin" ? "info" : role === "Manager" ? "warning" : "neutral";
  return <span className={`badge badge-${kind}`}><span className="dot"/>{role}</span>;
}
function StatusBadge({ status }) {
  if (status === "active")    return <span className="badge badge-success"><span className="dot"/>Active</span>;
  if (status === "invited")   return <span className="badge badge-info"><span className="dot pulse"/>Invited</span>;
  if (status === "suspended") return <span className="badge badge-error"><span className="dot"/>Suspended</span>;
  return <span className="badge badge-neutral">{status}</span>;
}
function pickAvatar(id) {
  const palette = ["#0077c7","#009444","#eb6101","#4c6cb3","#b94047","#006e54","#f8b500","#165e83","#b7282e","#223a70"];
  let h = 0; for (let i = 0; i < id.length; i++) h = (h*31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

// ── Org → Teams ─────────────────────────────────────────────────────
function OrgTeamsScreen({ teams, members, services }) {
  const I = window.I;
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">役割・職務単位のグループ</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm">{I.plus(14)} New team</button>
        </div>
      </header>

      <div className="team-grid">
        {teams.map(t => {
          const teamMembers = members.filter(m => m.teams.includes(t.id));
          return (
            <article key={t.id} className="team-card">
              <div className="team-card-head">
                <div className="team-dot" style={{ background: t.color }}/>
                <div className="grow">
                  <div className="team-name">{t.name}</div>
                  <div className="muted" style={{ fontSize: "var(--text-xs)" }}>{t.desc}</div>
                </div>
                <button className="tb-icon-btn">{I.moreV(14)}</button>
              </div>
              <div className="team-card-stats">
                <div><span className="tnum" style={{ fontSize: "var(--text-xl)", fontWeight: 500 }}>{teamMembers.length}</span><div className="muted" style={{ fontSize: "var(--text-2xs)" }}>members</div></div>
                <div><span className="tnum" style={{ fontSize: "var(--text-xl)", fontWeight: 500 }}>{t.services.length}</span><div className="muted" style={{ fontSize: "var(--text-2xs)" }}>services</div></div>
              </div>
              <div className="team-services">
                {t.services.length === 0 ? (
                  <span className="muted" style={{ fontSize: "var(--text-xs)" }}>サービス未割当</span>
                ) : t.services.map(id => {
                  const s = services.find(x => x.id === id);
                  return <span key={id} className="chip"><span className="prod-sticker xs" style={{ background: s?.accent }}>{s?.sticker}</span>{s?.name}</span>;
                })}
              </div>
              <div className="team-avatars">
                {teamMembers.slice(0,6).map(m => (
                  <div key={m.id} className="avatar avatar-sm" style={{ background: pickAvatar(m.id) }} title={m.name}>
                    {m.name.split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                ))}
                {teamMembers.length > 6 && <div className="avatar avatar-sm">+{teamMembers.length-6}</div>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── Org → Service Access ────────────────────────────────────────────
function OrgServiceAccessScreen({ teams, services }) {
  const I = window.I;
  const subscribed = services.filter(s => s.status === "registered");
  const roles = ["Owner","Admin","Manager","Member"];
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Service Access</h1>
          <p className="page-subtitle">どのチーム・ロールがどのサービスを利用できるかを設定</p>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table access-table">
          <thead>
            <tr>
              <th style={{ minWidth: 200 }}>Team</th>
              {subscribed.map(s => (
                <th key={s.id} style={{ textAlign: "center" }}>
                  <div className="col" style={{ alignItems: "center", gap: 4 }}>
                    <span className="prod-sticker sm" style={{ background: s.accent }}>{s.sticker}</span>
                    <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{s.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t.id}>
                <td>
                  <div className="row gap-2">
                    <span className="dot" style={{ width: 8, height: 8, background: t.color }}/>
                    <strong>{t.name}</strong>
                  </div>
                </td>
                {subscribed.map(s => {
                  const has = t.services.includes(s.id);
                  return (
                    <td key={s.id} style={{ textAlign: "center" }}>
                      {has ? <span className="badge badge-success" style={{ padding: "1px 6px" }}><I.check size={10}/></span> : <span className="muted">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3 className="card-title">Role permissions</h3></div>
        <div className="role-grid">
          {roles.map(r => (
            <div key={r} className="role-row">
              <div className="role-name">
                <RoleBadge role={r} />
              </div>
              <div className="role-perms">
                {r === "Owner"   && "Full access · billing · ownership transfer"}
                {r === "Admin"   && "Manage members, branches, services · cannot delete org"}
                {r === "Manager" && "Manage own branch/team members · subscribe services"}
                {r === "Member"  && "Use assigned services only"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Org → Settings ──────────────────────────────────────────────────
function OrgSettingsScreen({ org }) {
  const I = window.I;
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">組織の基本設定</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">General</h3></div>
          <Field label="Organization name" value={org.name} />
          <Field label="Legal name" value={org.legalName} />
          <Field label="Primary domain" value={org.domain} mono />
          <Field label="Country" value="🇯🇵 Japan" />
          <Field label="Address" value={org.address} textarea />
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Identity & SSO</h3></div>
          <Field label="Default sign-in domains" value="famgia.com, betoya.vn" mono />
          <div className="form-row">
            <label className="label">SSO provider</label>
            <div className="row gap-2">
              <span className="badge badge-info"><span className="dot"/>Google Workspace</span>
              <button className="btn btn-ghost btn-sm">{I.pencil(12)} Change</button>
            </div>
          </div>
          <div className="form-row">
            <label className="label">2-factor authentication</label>
            <div className="row gap-2">
              <span className="badge badge-success"><span className="dot"/>Required for Owner & Admin</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Locale & defaults</h3></div>
          <Field label="Default language" value="日本語 (ja-JP)" />
          <Field label="Default timezone" value="Asia/Tokyo (UTC+9)" />
          <Field label="Default currency" value="JPY" />
          <Field label="Fiscal year start" value="April" />
        </div>

        <div className="card danger">
          <div className="card-header"><h3 className="card-title" style={{ color: "var(--destructive)" }}>Danger zone</h3></div>
          <div className="danger-row">
            <div>
              <div style={{ fontWeight: 500 }}>Transfer ownership</div>
              <div className="muted" style={{ fontSize: "var(--text-xs)" }}>Hand over Owner role to another member</div>
            </div>
            <button className="btn btn-secondary btn-sm">Transfer</button>
          </div>
          <div className="danger-row">
            <div>
              <div style={{ fontWeight: 500 }}>Delete organization</div>
              <div className="muted" style={{ fontSize: "var(--text-xs)" }}>Permanently delete this organization and all data</div>
            </div>
            <button className="btn btn-danger btn-sm">Delete…</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono, textarea }) {
  return (
    <div className="form-row">
      <label className="label">{label}</label>
      {textarea
        ? <textarea className="input" rows={2} defaultValue={value} />
        : <input className={`input ${mono ? "mono" : ""}`} defaultValue={value} />}
    </div>
  );
}

// ── Services (subscribe page) ───────────────────────────────────────
function ServicesScreen({ services, setRoute }) {
  const I = window.I;
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">組織で利用可能なサービスの一覧と契約状況</p>
        </div>
      </header>

      <div className="ds-cards">
        {services.map(s => (
          <article key={s.id} className="prod-card">
            <div className="prod-sticker" style={{ background: s.accent }}>{s.sticker}</div>
            <div className="prod-body">
              <div className="prod-title">{s.name}<span className="prod-title-long">({s.long})</span></div>
              <div className="prod-desc">{s.desc}</div>
              {s.status === "registered" && (
                <div className="row gap-3" style={{ marginTop: 6, fontSize: "var(--text-xs)" }}>
                  <span className="muted">{s.activeUsers} active users</span>
                  <span className="muted">·</span>
                  <span className="muted">{s.branches} branches</span>
                </div>
              )}
            </div>
            <div className="prod-meta">
              {s.status === "registered"
                ? <>
                    <span className="badge badge-success"><span className="dot"/>Registered</span>
                    <span className="prod-plan">{s.plan}</span>
                    <button className="btn btn-secondary btn-sm">{I.sliders(14)} Configure</button>
                    <button className="btn btn-primary btn-sm">Open {I.external(14)}</button>
                  </>
                : <>
                    <span className="badge badge-outline">Not subscribed</span>
                    <button className="btn btn-secondary btn-sm">Learn more</button>
                    <button className="btn btn-primary btn-sm">{I.plus(14)} Subscribe</button>
                  </>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ── Billing → Manage ────────────────────────────────────────────────
function BillingManageScreen({ org, services }) {
  const I = window.I;
  const subscribed = services.filter(s => s.status === "registered");
  const seatPrice = { Pro: 1200, Standard: 600, Free: 0 };
  const lines = subscribed.map(s => ({
    ...s,
    seats: s.activeUsers,
    unit: seatPrice[s.plan] || 0,
    total: (seatPrice[s.plan] || 0) * s.activeUsers,
  }));
  const subtotal = lines.reduce((a,b) => a + b.total, 0);
  const tax = Math.round(subtotal * 0.1);

  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">プラン・支払い方法・利用量</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.download(14)} Download statement</button>
        </div>
      </header>

      <div className="bill-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Current plan</h3></div>
          <div className="row gap-3" style={{ alignItems: "baseline" }}>
            <div className="tnum" style={{ fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "-0.02em" }}>{org.plan}</div>
            <span className="muted">¥{ (subtotal+tax).toLocaleString() } / month</span>
          </div>
          <div className="muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>Next invoice on 2026/06/01 · auto-renew</div>
          <hr className="divider"/>
          <div className="row gap-2">
            <button className="btn btn-secondary btn-sm">Change plan</button>
            <button className="btn btn-ghost btn-sm">Cancel subscription</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Seats</h3></div>
          <div className="row gap-3" style={{ alignItems: "center" }}>
            <div className="tnum" style={{ fontSize: "var(--text-3xl)", fontWeight: 500 }}>{org.seats.used}<span className="muted" style={{ fontSize: "var(--text-base)", fontWeight: 400 }}>/{org.seats.total}</span></div>
            <div className="seat-bar grow"><div className="seat-bar-fill" style={{ width: `${(org.seats.used/org.seats.total)*100}%` }}/></div>
          </div>
          <div className="muted" style={{ fontSize: "var(--text-xs)", marginTop: 8 }}>{org.seats.total - org.seats.used} seats available</div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Payment method</h3></div>
          <div className="row gap-3" style={{ alignItems: "center" }}>
            <div className="cc-mark">VISA</div>
            <div className="grow">
              <div className="mono">•••• •••• •••• 4242</div>
              <div className="muted" style={{ fontSize: "var(--text-xs)" }}>Expires 12/28 · Famgia Info</div>
            </div>
            <button className="btn btn-ghost btn-sm">{I.pencil(12)} Update</button>
          </div>
        </div>
      </div>

      <section className="ds-section">
        <div className="ds-section-label">CURRENT BILLING — May 2026</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="table">
            <thead><tr><th>Service</th><th>Plan</th><th>Seats</th><th className="num">Unit</th><th className="num">Subtotal</th></tr></thead>
            <tbody>
              {lines.map(s => (
                <tr key={s.id}>
                  <td><div className="row gap-2"><span className="prod-sticker xs" style={{ background: s.accent }}>{s.sticker}</span><strong>{s.name}</strong></div></td>
                  <td>{s.plan}</td>
                  <td className="num">{s.seats}</td>
                  <td className="num mono">¥{s.unit.toLocaleString()}</td>
                  <td className="num mono">¥{s.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan="4" style={{ textAlign: "right" }}>Subtotal</td><td className="num mono">¥{subtotal.toLocaleString()}</td></tr>
              <tr><td colSpan="4" style={{ textAlign: "right" }} className="muted">Tax (10%)</td><td className="num mono muted">¥{tax.toLocaleString()}</td></tr>
              <tr><td colSpan="4" style={{ textAlign: "right", fontWeight: 500 }}>Total</td><td className="num mono" style={{ fontWeight: 500 }}>¥{(subtotal+tax).toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── Billing → Invoices ──────────────────────────────────────────────
function BillingInvoicesScreen({ invoices }) {
  const I = window.I;
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">過去の請求書・領収書</p>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>Invoice</th><th>Period</th><th>Issued</th><th>Items</th><th className="num">Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="mono">{inv.id}</td>
                <td>{inv.period}</td>
                <td className="mono">{inv.date}</td>
                <td className="num">{inv.items}</td>
                <td className="num mono">¥{inv.amount.toLocaleString()}</td>
                <td>{inv.status === "paid" && <span className="badge badge-success"><span className="dot"/>Paid</span>}</td>
                <td style={{ width: 80, textAlign: "right" }}>
                  <button className="tb-icon-btn" title="View">{I.eye(14)}</button>
                  <button className="tb-icon-btn" title="Download">{I.download(14)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, {
  OrgMembersScreen, OrgTeamsScreen, OrgServiceAccessScreen, OrgSettingsScreen,
  ServicesScreen, BillingManageScreen, BillingInvoicesScreen, RoleBadge, StatusBadge, pickAvatar,
});
