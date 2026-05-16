/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateMS, useRef: useRefMS, useEffect: useEffectMS } = React;

// ── Sidebar ─────────────────────────────────────────────────────────
function MeSidebar({ route, setRoute, collapsed, setCollapsed, user, invitations }) {
  const I = window.I;

  const Section = ({ label, children }) => (
    <div className="sb-section">
      {!collapsed && <div className="sb-section-label">{label}</div>}
      <nav className="sb-nav">{children}</nav>
    </div>
  );

  const Item = ({ id, icon, label, badge }) => (
    <div className="sb-nav-item" data-active={route === id} onClick={() => setRoute(id)}>
      <span className="sb-icon">{icon}</span>
      {!collapsed && <span className="sb-label">{label}</span>}
      {!collapsed && badge ? <span className="sb-badge">{badge}</span> : null}
    </div>
  );

  return (
    <aside className="app-sidebar me-sidebar">
      <div className="sb-brand">
        <div className="sb-brand-avatar">{user.initials}</div>
        {!collapsed && (
          <div className="sb-brand-text">
            <div className="sb-brand-name">{user.name}</div>
            <div className="sb-brand-sub">{user.email}</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <Section label="MY PAGE">
          <Item id="dashboard" icon={I.layoutGrid(16)} label="マイページ" />
        </Section>

        <Section label="ACCOUNT">
          <Item id="profile"  icon={I.user(16)}        label="プロフィール" />
          <Item id="contact"  icon={I.mail(16)}        label="連絡先" />
          <Item id="identity" icon={I.shieldCheck(16)} label="本人確認" />
        </Section>

        <Section label="MEMBERSHIPS">
          <Item id="orgs"         icon={I.briefcase(16)} label="所属組織" />
          <Item id="invitations"  icon={I.handshake(16)} label="招待" badge={invitations.length || null} />
        </Section>

        <Section label="RECORDS">
          <Item id="payslips"   icon={I.wallet(16)}   label="給与明細" />
          <Item id="tax"        icon={I.receipt(16)}  label="源泉徴収票" />
          <Item id="attendance" icon={I.calendar(16)} label="勤怠履歴" />
        </Section>

        <Section label="CONNECTIONS">
          <Item id="services"  icon={I.cube(16)} label="連携サービス" />
          <Item id="externals" icon={I.plug(16)} label="外部アカウント" />
        </Section>

        <Section label="SETTINGS">
          <Item id="privacy"       icon={I.lock(16)}     label="プライバシー" />
          <Item id="security"      icon={I.shield(16)}   label="セキュリティ" />
          <Item id="notifications" icon={I.bell(16)}     label="通知" />
          <Item id="preferences"   icon={I.settings(16)} label="環境設定" />
        </Section>
      </div>

      <div className="sb-footer">
        <div className="sb-nav-item" onClick={() => setCollapsed(!collapsed)}>
          <span className="sb-icon">{collapsed ? I.chevronRight(16) : I.chevronLeft(16)}</span>
          {!collapsed && <span className="sb-label">折りたたむ</span>}
        </div>
      </div>
    </aside>
  );
}

// ── Topbar ──────────────────────────────────────────────────────────
function MeTopbar({ user, locale, theme, setTheme, invitations, setRoute }) {
  const I = window.I;
  const [menuOpen, setMenuOpen] = useStateMS(false);
  const menuRef = useRefMS();

  useEffectMS(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="app-topbar me-topbar">
      <div className="me-context">
        <span className="me-context-pill">{I.user(13)}</span>
        <span className="me-context-label">パーソナルアカウント</span>
        <span className="me-context-divider"/>
        <span className="me-context-meta">{user.email}</span>
      </div>

      <div className="me-search">
        <span className="icon-left">{I.search(14)}</span>
        <input placeholder="給与明細・組織・設定を検索…" />
      </div>

      <div className="grow"/>

      <button className="me-icon-btn" title="通知" onClick={() => setRoute && setRoute("invitations")}>
        {I.bell(16)}
        {invitations.length > 0 && <span className="ind"/>}
      </button>

      <button className="me-icon-btn" title={theme === "dark" ? "ライトモード" : "ダークモード"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? I.sun(16) : I.moon(16)}
      </button>

      <div className="me-user" ref={menuRef} onClick={() => setMenuOpen(!menuOpen)} style={{ position: "relative" }}>
        <div className="avatar brand">{user.initials}</div>
        <div className="me-user-meta">
          <div className="me-user-name">{user.name}</div>
          <div className="me-user-email">{user.email}</div>
        </div>
        <span className="me-user-caret">{I.chevronDown(14)}</span>

        {menuOpen && (
          <div className="sw-pop" style={{ right: 0, left: "auto", width: 260, top: "calc(100% + 4px)" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
              <div className="muted mono" style={{ fontSize: 11 }}>{user.email}</div>
            </div>
            <div className="sw-pop-list" style={{ padding: 4 }}>
              <div className="sw-pop-item" onClick={() => { setMenuOpen(false); setRoute("profile"); }}>
                <span className="sb-icon" style={{ color: "var(--muted-foreground)" }}>{I.user(14)}</span>
                <span>プロフィール</span>
              </div>
              <div className="sw-pop-item" onClick={() => { setMenuOpen(false); setRoute("preferences"); }}>
                <span className="sb-icon" style={{ color: "var(--muted-foreground)" }}>{I.settings(14)}</span>
                <span>環境設定</span>
              </div>
              <div className="sw-pop-item" onClick={() => { setMenuOpen(false); setRoute("security"); }}>
                <span className="sb-icon" style={{ color: "var(--muted-foreground)" }}>{I.shield(14)}</span>
                <span>セキュリティ</span>
              </div>
              <div className="sw-pop-section" style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 8 }}>
                <span>{locale === "vi" ? "Khác" : "Other"}</span>
              </div>
              <div className="sw-pop-item">
                <span className="sb-icon" style={{ color: "var(--muted-foreground)" }}>{I.helpCircle(14)}</span>
                <span>ヘルプセンター</span>
                <span className="sw-pop-item-meta">{I.external(11)}</span>
              </div>
              <div className="sw-pop-item" style={{ color: "var(--destructive)" }}>
                <span className="sb-icon" style={{ color: "var(--destructive)" }}>{I.logout(14)}</span>
                <span>サインアウト</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

window.MeSidebar = MeSidebar;
window.MeTopbar = MeTopbar;
