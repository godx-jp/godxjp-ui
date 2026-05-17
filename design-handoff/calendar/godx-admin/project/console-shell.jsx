/* global React, window */
/* eslint-disable react/prop-types */
const { useState, useRef, useEffect } = React;

// ── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ route, setRoute, collapsed, setCollapsed, openGroups, setOpenGroups }) {
  const I = window.I;
  const isOpen = (k) => !!openGroups[k];
  const toggle = (k) => setOpenGroups({ ...openGroups, [k]: !openGroups[k] });

  const Group = ({ k, label, icon, children }) => (
    <>
      <div className="sb-nav-item" data-active={route.startsWith(k + "-") || route === k} onClick={() => toggle(k)}>
        <span className="sb-icon">{icon}</span>
        <span className="sb-label">{label}</span>
        <span className="sb-caret" style={{ transform: isOpen(k) ? "rotate(180deg)" : "none", transition: "transform .15s", color: "var(--muted-foreground)" }}>
          {I.chevronDown(14)}
        </span>
      </div>
      {isOpen(k) && !collapsed && <div className="sb-sub">{children}</div>}
    </>
  );

  const Item = ({ id, icon, label }) => (
    <div className={`sb-nav-item ${icon ? "" : "sb-sub-item"}`} data-active={route === id} onClick={() => setRoute(id)}>
      <span className="sb-icon">{icon}</span>
      <span className="sb-label">{label}</span>
    </div>
  );

  return (
    <aside className="app-sidebar console-sidebar">
      <div className="sb-brand">
        <div className="sb-brand-mark">D</div>
        {!collapsed && (
          <>
            <span className="sb-brand-name">DXS</span>
            <span className="sb-brand-version">v1.0</span>
          </>
        )}
      </div>

      <nav className="sb-section sb-nav">
        <Item id="dashboard"     icon={I.layoutGrid ? I.layoutGrid(16) : I.home(16)} label="Dashboard" />

        <Group k="org" label="Organization" icon={I.building(16)}>
          <Item id="org-overview"  label="Overview" icon={I.building(16)} />
          <Item id="org-branches"  label="Branches" icon={I.stethoscope ? I.stethoscope(16) : I.branch(16)} />
          <Item id="org-brands"    label="Brands"   icon={I.tag(16)} />
          <Item id="org-members"   label="Members"  icon={I.users(16)} />
          <Item id="org-teams"     label="Teams"    icon={I.users(16)} />
          <Item id="org-access"    label="Service Access" icon={I.shield(16)} />
          <Item id="org-settings"  label="Settings" icon={I.settings(16)} />
        </Group>

        <Item id="services" icon={I.cube ? I.cube(16) : I.layers(16)} label="Services" />

        <Group k="billing" label="Billing" icon={I.card ? I.card(16) : I.copy(16)}>
          <Item id="billing-manage"   label="Manage"   icon={I.card ? I.card(16) : I.copy(16)} />
          <Item id="billing-invoices" label="Invoices" icon={I.doc(16)} />
        </Group>
      </nav>

      <div className="sb-footer">
        <div className="sb-nav-item" onClick={() => setCollapsed(!collapsed)}>
          <span className="sb-icon">{collapsed ? I.chevronRight(16) : <span style={{ display: "inline-flex" }}>{I.chevronLeft(16)}</span>}</span>
          <span className="sb-label">Collapse</span>
        </div>
      </div>
    </aside>
  );
}

// ── Topbar with org switcher ────────────────────────────────────────
function Topbar({ user, org, locale, theme, setTheme }) {
  const I = window.I;
  const [open, setOpen] = useState(false);
  const popRef = useRef();
  useEffect(() => {
    const fn = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="app-topbar console-topbar">
      <div className="tb-org" ref={popRef}>
        <button className="tb-org-btn" data-open={open} onClick={() => setOpen(!open)}>
          <span className="tb-org-icon">{I.building(14)}</span>
          <span className="tb-org-name">{org.name}</span>
          <span className="tb-org-caret">{I.chevronDown(14)}</span>
        </button>
        {open && (
          <div className="sw-pop" style={{ left: 0, width: 280 }}>
            <div className="sw-pop-search">
              {I.search(14)}
              <input placeholder="Switch organization…" autoFocus />
            </div>
            <div className="sw-pop-list">
              <div className="sw-pop-section">Organizations</div>
              <div className="sw-pop-item" data-active>
                <span className="tb-org-icon" style={{ background: "var(--surface-3)", color: "var(--foreground)" }}>{I.building(14)}</span>
                <span>{org.name}</span>
                <span className="sw-pop-item-meta">{I.check(12)}</span>
              </div>
              <div className="sw-pop-item">
                <span className="tb-org-icon" style={{ background: "var(--surface-3)", color: "var(--foreground)" }}>{I.building(14)}</span>
                <span>Betoya F&amp;B</span>
                <span className="sw-pop-item-meta muted">{locale === "vi" ? "Quản lý" : "Manager"}</span>
              </div>
              <div className="sw-pop-section">Other</div>
              <div className="sw-pop-item">
                <span className="sb-icon" style={{ color: "var(--muted-foreground)" }}>{I.plus(14)}</span>
                <span className="muted">Create organization…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tb-search-wrap">
        <span className="tb-search-icon">{I.search(14)}</span>
        <input className="tb-search-input" placeholder="Search…" />
      </div>

      <div className="grow" />

      <button className="tb-icon-btn" title="Language">
        {/* translate icon — globe + 文 */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h10M7 4v2c0 4-2 7-4 8" />
          <path d="M5 9c0 3 3 6 7 7" />
          <path d="M13 21l4-10 4 10M14.5 17h5" />
        </svg>
      </button>
      <button className="tb-icon-btn" title="Preview"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {/* monitor icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="13" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      </button>

      <div className="tb-user">
        <div className="avatar brand">{user.initials}</div>
        <div className="tb-user-meta">
          <div className="tb-user-name">{user.name}</div>
          <div className="tb-user-email">{user.email}</div>
        </div>
      </div>
    </header>
  );
}

window.ConsoleSidebar = Sidebar;
window.ConsoleTopbar  = Topbar;
