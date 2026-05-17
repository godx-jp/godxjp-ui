/* global React, window */
/* eslint-disable react/prop-types */
const { useMemo: useMemoA, useState: useStateA } = React;

// ── Dashboard (matches reference) ───────────────────────────────────
function DashboardScreen({ org, user, services, setRoute, locale }) {
  const I = window.I;
  const today = new Date(2026, 4, 14);
  const greet = locale === "ja" ? "おはようございます" : locale === "vi" ? "Xin chào" : "Good morning";
  const subtitle = locale === "ja"
    ? `${today.getMonth()+1}月${today.getDate()}日${["日","月","火","水","木","金","土"][today.getDay()]}曜日`
    : today.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { weekday: "long", month: "short", day: "numeric" });

  const subscribed = services.filter(s => s.status === "registered");
  const tryable    = services.filter(s => s.status === "try");

  return (
    <div className="page console-page">
      <header className="ds-hero">
        <h1 className="ds-hero-title">{greet}、{user.name}</h1>
        <p className="ds-hero-sub">{subtitle}</p>
      </header>

      <section className="ds-section">
        <div className="ds-section-label">YOUR PRODUCTS</div>
        <div className="ds-cards">
          {subscribed.map(s => <ProductCard key={s.id} s={s} mode="open" setRoute={setRoute} />)}
        </div>
      </section>

      <section className="ds-section">
        <div className="ds-section-label">PRODUCTS TO TRY</div>
        <div className="ds-cards">
          {tryable.map(s => <ProductCard key={s.id} s={s} mode="try" setRoute={setRoute} />)}
        </div>
      </section>

      <section className="ds-section">
        <div className="ds-section-label">YOUR STATISTICS</div>
        <div className="ds-stats">
          <StatCard icon={<I.users size={18}/>} label="Active Users" value={`${org.seats.used}`} foot={`of ${org.seats.total} total`} />
          <StatCard icon={<I.building size={18}/>} label="Locations" value="22" foot="11 branches · 11 locations · 3 roles" />
          <StatCard icon={<I.cube size={18}/>} label="Active Products" value={String(subscribed.length)} foot={`${tryable.length} more available`} />
          <StatCard icon={<I.receipt size={18}/>} label="Plan" value={org.plan} foot={`Next invoice 6/1`} />
        </div>
      </section>
    </div>
  );
}

function ProductCard({ s, mode, setRoute }) {
  const I = window.I;
  return (
    <article className="prod-card">
      <div className="prod-sticker" style={{ background: s.accent }}>{s.sticker}</div>
      <div className="prod-body">
        <div className="prod-title">
          {s.name}
          <span className="prod-title-long">({s.long})</span>
        </div>
        <div className="prod-desc">{s.desc}</div>
      </div>
      <div className="prod-meta">
        {mode === "open" ? (
          <>
            <span className="badge badge-success"><span className="dot"/>Registered</span>
            <span className="prod-plan">{s.plan}</span>
            <button className="btn btn-primary btn-sm">Open {I.external(14)}</button>
          </>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setRoute && setRoute("services")}>
            View Details {I.arrowRight ? I.arrowRight(14) : I.chevronRight(14)}
          </button>
        )}
      </div>
    </article>
  );
}

function StatCard({ icon, label, value, foot }) {
  return (
    <div className="stat-card">
      <div className="stat-head">
        <div className="stat-label">{label}</div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}

// ── Org → Overview ──────────────────────────────────────────────────
function OrgOverviewScreen({ org, services, branches, brands, members, teams, setRoute }) {
  const I = window.I;
  const subscribed = services.filter(s => s.status === "registered");
  const active = members.filter(m => m.status === "active").length;
  const invited = members.filter(m => m.status === "invited").length;

  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{org.name}</h1>
          <p className="page-subtitle">{org.legalName} · {org.country} · 設立 {org.founded}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setRoute("org-settings")}>{I.pencil(14)} Edit organization</button>
        </div>
      </header>

      <div className="ov-grid">
        <div className="card ov-summary">
          <div className="card-header">
            <h3 className="card-title">Organization details</h3>
          </div>
          <dl className="ov-dl">
            <dt>Legal name</dt><dd>{org.legalName}</dd>
            <dt>Domain</dt><dd className="mono">{org.domain}</dd>
            <dt>Tax ID</dt><dd className="mono">{org.taxId}</dd>
            <dt>Address</dt><dd>{org.address}</dd>
            <dt>Contact</dt><dd className="mono">{org.contactEmail}</dd>
            <dt>Plan</dt><dd><span className="badge badge-info"><span className="dot"/>{org.plan}</span></dd>
          </dl>
        </div>

        <div className="ov-tiles">
          <Tile icon={<I.branchSign size={18}/>} label="Branches" value={branches.length} onClick={() => setRoute("org-branches")} />
          <Tile icon={<I.tag size={18}/>}        label="Brands"   value={brands.length}   onClick={() => setRoute("org-brands")} />
          <Tile icon={<I.users size={18}/>}      label="Members"  value={`${active}`}    foot={`+${invited} invited`} onClick={() => setRoute("org-members")} />
          <Tile icon={<I.users size={18}/>}      label="Teams"    value={teams.length}    onClick={() => setRoute("org-teams")} />
          <Tile icon={<I.cube size={18}/>}       label="Services" value={subscribed.length} foot={`${services.length-subscribed.length} more`} onClick={() => setRoute("services")} />
          <Tile icon={<I.shield size={18}/>}     label="Roles"    value="3" foot="Owner · Admin · Manager · Member" onClick={() => setRoute("org-access")} />
        </div>
      </div>

      <section className="ds-section">
        <div className="ds-section-label">SUBSCRIBED SERVICES</div>
        <div className="ov-services">
          {subscribed.map(s => (
            <div key={s.id} className="ov-service">
              <div className="prod-sticker sm" style={{ background: s.accent }}>{s.sticker}</div>
              <div className="grow">
                <div className="ov-service-name">{s.name}</div>
                <div className="ov-service-meta muted">{s.activeUsers} users · {s.branches} branches</div>
              </div>
              <span className="prod-plan">{s.plan}</span>
              <button className="btn btn-ghost btn-sm">Open {I.external(12)}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Tile({ icon, label, value, foot, onClick }) {
  return (
    <button className="ov-tile" onClick={onClick}>
      <div className="ov-tile-icon">{icon}</div>
      <div className="ov-tile-val">{value}</div>
      <div className="ov-tile-label">{label}</div>
      {foot && <div className="ov-tile-foot">{foot}</div>}
    </button>
  );
}

// ── Org → Branches ──────────────────────────────────────────────────
function OrgBranchesScreen({ branches, brands, locale }) {
  const I = window.I;
  const [q, setQ] = useStateA("");
  const [brand, setBrand] = useStateA("all");
  const rows = useMemoA(() => branches.filter(b =>
    (brand === "all" || b.brand === brand) &&
    (!q || (b.name + b.code + b.city).toLowerCase().includes(q.toLowerCase()))
  ), [branches, q, brand]);

  const flag = (c) => c === "JP" ? "🇯🇵" : c === "VN" ? "🇻🇳" : "🌐";

  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Branches</h1>
          <p className="page-subtitle">物理拠点・支社・スタジオの管理</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.download(14)} Export</button>
          <button className="btn btn-primary btn-sm">{I.plus(14)} New branch</button>
        </div>
      </header>

      <div className="toolbar">
        <div className="tb-search-wrap" style={{ width: 320 }}>
          <span className="tb-search-icon">{I.search(14)}</span>
          <input className="tb-search-input" placeholder="Search branches…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={brand==="all"?"on":""}    onClick={() => setBrand("all")}>All</button>
          {brands.map(b => (
            <button key={b.id} className={brand===b.id?"on":""} onClick={() => setBrand(b.id)}>
              <span className="seg-swatch" style={{ background: b.primary }} />{b.name}
            </button>
          ))}
        </div>
        <span className="muted ml-auto" style={{ fontSize: "var(--text-xs)" }}>{rows.length} / {branches.length}</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>Branch</th><th>Code</th><th>Brand</th><th>Location</th><th>Members</th><th>Opened</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(b => {
              const br = brands.find(x => x.id === b.brand);
              return (
                <tr key={b.id}>
                  <td><div className="row gap-2"><span className="cell-icon">{I.mapPin(14)}</span><strong>{b.name}</strong></div></td>
                  <td className="mono">{b.code}</td>
                  <td><span className="chip"><span className="dot" style={{ background: br?.primary }} />{br?.name}</span></td>
                  <td>{flag(b.country)} <span className="muted">·</span> {b.city}</td>
                  <td className="num">{b.members}</td>
                  <td className="mono">{b.openedAt}</td>
                  <td>
                    {b.status === "active"     && <span className="badge badge-success"><span className="dot"/>Active</span>}
                    {b.status === "paused"     && <span className="badge badge-warning"><span className="dot"/>Paused</span>}
                    {b.status === "prelaunch"  && <span className="badge badge-info"><span className="dot"/>Pre-launch</span>}
                  </td>
                  <td style={{ width: 32 }}><button className="tb-icon-btn">{I.moreV(14)}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Org → Brands ────────────────────────────────────────────────────
function OrgBrandsScreen({ brands }) {
  const I = window.I;
  return (
    <div className="page console-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Brands</h1>
          <p className="page-subtitle">組織配下のブランド・事業体</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm">{I.plus(14)} New brand</button>
        </div>
      </header>

      <div className="brand-grid">
        {brands.map(b => (
          <article key={b.id} className="brand-card">
            <div className="brand-swatch" style={{ background: b.primary }}>
              <span className="brand-init">{b.name[0]}</span>
            </div>
            <div className="brand-body">
              <div className="brand-name">{b.name}</div>
              <div className="brand-code mono muted">{b.code}</div>
              <p className="brand-desc">{b.desc}</p>
              <div className="row gap-3" style={{ alignItems: "center" }}>
                <span className="muted" style={{ fontSize: "var(--text-xs)" }}>{b.branches} branches</span>
                {b.status === "active"   && <span className="badge badge-success"><span className="dot"/>Active</span>}
                {b.status === "internal" && <span className="badge badge-neutral"><span className="dot"/>Internal</span>}
                <button className="btn btn-ghost btn-sm ml-auto">{I.pencil(12)} Edit</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, OrgOverviewScreen, OrgBranchesScreen, OrgBrandsScreen, ProductCard, StatCard });
