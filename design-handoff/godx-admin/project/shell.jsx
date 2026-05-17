/* global React, I, Icon, cx, Badge, Avatar, Sparkline, Donut */
/* eslint-disable react/prop-types */

const { useState } = React;

// Translations
const T = {
  ja: {
    products: "プロダクト", projects: "プロジェクト", devs: "開発者",
    dashboard: "ダッシュボード", overview: "概要",
    productHome: "プロダクトホーム", projectHome: "プロジェクトホーム",
    workspace: "ワークスペース", devPanel: "開発者パネル",
    agents: "AIエージェント", codeBrowser: "コード", domains: "ドメイン",
    designSystem: "デザインシステム",
    sandbox: "サンドボックス", deploys: "デプロイ", branches: "ブランチ", prs: "プルリクエスト",
    members: "メンバー", roadmap: "ロードマップ",
    activity: "アクティビティ", search: "検索", new: "新規",
    wiki: "Wiki", issues: "課題", plans: "PDCA計画", ideas: "アイデア (Shape Up)", gantt: "ガント",
    settings: "設定", logout: "ログアウト", login: "ログイン",
    activeDevs: "アクティブな開発者", openIssues: "未解決の課題", deployments: "デプロイ", uptime: "稼働率",
    recentActivity: "最近のアクティビティ", quickActions: "クイック操作",
    backToProduct: "プロダクトに戻る",
    files: "ファイル", commits: "コミット",
    rules: "ルール", tokens: "トークン", components: "コンポーネント", typography: "タイポグラフィ", color: "カラー",
  },
  en: {
    products: "Products", projects: "Projects", devs: "Developers",
    dashboard: "Dashboard", overview: "Overview",
    productHome: "Product home", projectHome: "Project home",
    workspace: "Workspace", devPanel: "Dev panel",
    agents: "AI agents", codeBrowser: "Code", domains: "Domains",
    designSystem: "Design system",
    sandbox: "Sandbox", deploys: "Deploys", branches: "Branches", prs: "Pull requests",
    members: "Members", roadmap: "Roadmap",
    activity: "Activity", search: "Search", new: "New",
    wiki: "Wiki", issues: "Issues", plans: "PDCA plans", ideas: "Ideas (Shape Up)", gantt: "Gantt",
    settings: "Settings", logout: "Sign out", login: "Sign in",
    activeDevs: "Active developers", openIssues: "Open issues", deployments: "Deploys today", uptime: "Uptime",
    recentActivity: "Recent activity", quickActions: "Quick actions",
    backToProduct: "Back to product",
    files: "Files", commits: "Commits",
    rules: "Rules", tokens: "Tokens", components: "Components", typography: "Typography", color: "Color",
  },
  vi: {
    products: "Sản phẩm", projects: "Dự án", devs: "Lập trình viên",
    dashboard: "Bảng điều khiển", overview: "Tổng quan",
    productHome: "Trang chủ sản phẩm", projectHome: "Trang chủ dự án",
    workspace: "Workspace", devPanel: "Bảng dev",
    agents: "AI agent", codeBrowser: "Code", domains: "Tên miền",
    designSystem: "Design system",
    sandbox: "Sandbox", deploys: "Deploy", branches: "Branch", prs: "Pull request",
    members: "Thành viên", roadmap: "Lộ trình",
    activity: "Hoạt động", search: "Tìm kiếm", new: "Mới",
    wiki: "Wiki", issues: "Issue", plans: "Kế hoạch PDCA", ideas: "Ý tưởng", gantt: "Gantt",
    settings: "Cài đặt", logout: "Đăng xuất", login: "Đăng nhập",
    activeDevs: "Dev đang hoạt động", openIssues: "Issue mở", deployments: "Deploy hôm nay", uptime: "Uptime",
    recentActivity: "Hoạt động gần đây", quickActions: "Thao tác nhanh",
    backToProduct: "Quay về sản phẩm",
    files: "File", commits: "Commit",
    rules: "Quy tắc", tokens: "Token", components: "Component", typography: "Kiểu chữ", color: "Màu sắc",
  },
};
window.T = T;

// ── Product / Project registry — Product = Org (GitHub), Project = Repo
const PRODUCTS = [
  {
    id: "restaurant",
    name: "godx-restaurant",
    tenant: "restaurant",
    role: "レストラン管理",
    desc: "店舗向け統合管理プラットフォーム",
    color: "oklch(58% 0.18 25)", // shu / akane
    owner: "Satoshi F",
    devs: 6,
    projects: [
      { id: "api",     name: "restaurant-api",        stack: "NestJS · PostgreSQL", kind: "service",     devs: 3, status: "active",   branch: "main",            lastCommit: "12分前", openIssues: 8,  prs: 2, sandbox: true },
      { id: "admin",   name: "restaurant-admin",      stack: "Next.js 14 · React",  kind: "web",         devs: 2, status: "active",   branch: "main",            lastCommit: "1時間前", openIssues: 5,  prs: 1, sandbox: true },
      { id: "pos",     name: "restaurant-pos",        stack: "Tauri · Vue 3",       kind: "desktop",     devs: 1, status: "active",   branch: "feature/print",   lastCommit: "30分前", openIssues: 3,  prs: 1, sandbox: true },
      { id: "kds",     name: "restaurant-kds",        stack: "React · Electron",    kind: "workstation", devs: 1, status: "review",   branch: "main",            lastCommit: "昨日",   openIssues: 2,  prs: 1, sandbox: true },
      { id: "kintai",  name: "restaurant-kintai",     stack: "Vue 3 · Laravel",     kind: "service",     devs: 2, status: "active",   branch: "main",            lastCommit: "5分前",  openIssues: 4,  prs: 0, sandbox: true },
      { id: "mobile",  name: "restaurant-mobile",     stack: "React Native",         kind: "mobile",      devs: 1, status: "planning", branch: "develop",         lastCommit: "3日前",  openIssues: 1,  prs: 0, sandbox: false },
    ],
  },
  {
    id: "godx",
    name: "godx-admin",
    tenant: "godx",
    role: "Platform admin",
    desc: "Famgia developer workspace",
    color: "oklch(60% 0.137 163)",
    owner: "Satoshi F",
    devs: 4,
    projects: [
      { id: "frontend", name: "godx-admin-frontend", stack: "React · Vite",       kind: "web",     devs: 2, status: "active", branch: "master", lastCommit: "2時間前", openIssues: 6, prs: 2, sandbox: true },
      { id: "api",      name: "godx-admin-api",      stack: "Go · Gin",           kind: "service", devs: 1, status: "active", branch: "master", lastCommit: "4時間前", openIssues: 3, prs: 1, sandbox: true },
      { id: "ui",       name: "@godxjp/ui",          stack: "TypeScript · React", kind: "library", devs: 2, status: "active", branch: "master", lastCommit: "1時間前", openIssues: 2, prs: 0, sandbox: false },
    ],
  },
  {
    id: "kintai",
    name: "dxs-kintai",
    tenant: "kintai",
    role: "HR / Attendance",
    desc: "勤怠管理プラットフォーム",
    color: "oklch(56% 0.15 240)",
    owner: "Naoki N",
    devs: 3,
    projects: [
      { id: "frontend", name: "kintai-web",   stack: "Vue 3 · Vite",  kind: "web",     devs: 2, status: "active", branch: "main", lastCommit: "20分前", openIssues: 7, prs: 1, sandbox: true },
      { id: "backend",  name: "kintai-api",   stack: "Laravel 11",     kind: "service", devs: 1, status: "active", branch: "main", lastCommit: "1日前",  openIssues: 4, prs: 0, sandbox: true },
    ],
  },
  {
    id: "tempo",
    name: "dxs-tempo",
    tenant: "tempo",
    role: "Shop / Inventory",
    desc: "店舗・在庫バックエンド",
    color: "oklch(48% 0.16 285)",
    owner: "Naoki N",
    devs: 2,
    projects: [
      { id: "api",      name: "tempo-api",     stack: "Go · Echo",      kind: "service", devs: 2, status: "active",   branch: "main", lastCommit: "5時間前", openIssues: 9, prs: 1, sandbox: true },
      { id: "ops",      name: "tempo-ops",     stack: "Terraform",      kind: "infra",   devs: 1, status: "planning", branch: "main", lastCommit: "1週間前", openIssues: 1, prs: 0, sandbox: false },
    ],
  },
  {
    id: "betoya",
    name: "betoya",
    tenant: "betoya",
    role: "Vietnamese restaurant",
    desc: "ベト屋 Tenant",
    color: "oklch(58% 0.159 150)",
    owner: "Anh K",
    devs: 1,
    projects: [
      { id: "site", name: "betoya-site", stack: "Astro", kind: "web", devs: 1, status: "active", branch: "main", lastCommit: "昨日", openIssues: 2, prs: 0, sandbox: false },
    ],
  },
];
window.PRODUCTS = PRODUCTS;

// Project kind icon + semantic color
window.PROJECT_KIND = {
  service:     { icon: I.database, color: "oklch(60% 0.137 163)", label: "API" },
  web:         { icon: I.globe,    color: "oklch(56% 0.15 240)",  label: "Web" },
  desktop:     { icon: I.layers,   color: "oklch(48% 0.16 285)",  label: "Desktop" },
  workstation: { icon: I.terminal, color: "oklch(50% 0.16 30)",   label: "Workstation" },
  mobile:      { icon: I.zap,      color: "oklch(58% 0.18 25)",   label: "Mobile" },
  library:     { icon: I.code,     color: "oklch(50% 0.05 250)",  label: "Library" },
  infra:       { icon: I.shield,   color: "oklch(45% 0.05 260)",  label: "Infra" },
};

// ── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ route, setRoute, collapsed, product, setProduct, project, setProject, locale, openProductMenu, setOpenProductMenu }) {
  const t = T[locale];

  const PRODUCT_NAV = [
    { id: "p-dashboard", label: t.dashboard, icon: I.home },
    { id: "p-projects",  label: t.projects,  icon: I.folder, badge: String(product.projects.length) },
    { id: "p-issues",    label: t.issues,    icon: I.kanban, badge: String(product.projects.reduce((s,p)=>s+p.openIssues,0)) },
    { id: "p-plans",     label: t.plans,     icon: I.shield },
    { id: "p-ideas",     label: t.ideas,     icon: I.lightbulb },
    { id: "p-gantt",     label: t.gantt,     icon: I.layers },
    { id: "p-wiki",      label: t.wiki,      icon: I.book },
  ];
  const PRODUCT_NAV_INFRA = [
    { id: "p-members", label: t.members, icon: I.users },
    { id: "p-domains", label: t.domains, icon: I.globe },
  ];

  const PROJECT_NAV = [
    { id: "j-overview", label: t.overview,    icon: I.home },
    { id: "j-code",     label: t.codeBrowser, icon: I.code },
    { id: "j-branches", label: t.branches,    icon: I.branch },
    { id: "j-prs",      label: t.prs,         icon: I.pr, badge: project ? String(project.prs) : "" },
    { id: "j-issues",   label: t.issues,      icon: I.kanban, badge: project ? String(project.openIssues) : "" },
  ];
  const PROJECT_NAV_RUN = [
    { id: "j-sandbox", label: t.sandbox, icon: I.terminal, disabled: project && !project.sandbox },
    { id: "j-agents",  label: t.agents,  icon: I.bot },
    { id: "j-deploys", label: t.deploys, icon: I.rocket || I.zap },
  ];

  const NAV_META = [{ id: "system", label: t.designSystem, icon: I.layers }];

  const inProject = !!project;

  return (
    <aside className="app-sidebar dev-shell-sidebar">
      {/* Product picker — always at top */}
      <div className="sb-product" onClick={() => setOpenProductMenu(!openProductMenu)} style={{ position: "relative" }}>
        <span className="sb-logo-mark" style={{ background: product.color }}>{product.name[0].toUpperCase()}</span>
        <div className="sb-product-meta col" style={{ minWidth: 0, flex: 1, display: collapsed ? "none" : "flex" }}>
          <span className="sb-product-name">{product.name}</span>
          <span className="sb-product-tenant">{product.role}</span>
        </div>
        <span className="sb-product-tenant" style={{ display: collapsed ? "none" : "inline-flex", alignItems: "center", flexShrink: 0, width: 14, height: 14 }}>
          <I.chevronDown size={14} />
        </span>
        {openProductMenu && !collapsed && (
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "100%", left: 8, right: 8, zIndex: 50, background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: 4, marginTop: 4, maxHeight: 380, overflow: "auto" }}>
            <div style={{ padding: "6px 10px 4px", fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.products} · {PRODUCTS.length}</div>
            {PRODUCTS.map(p => (
              <div key={p.id} onClick={() => { setProduct(p); setProject(null); setRoute("p-dashboard"); setOpenProductMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--radius-md)", cursor: "pointer", background: p.id === product.id ? "var(--surface-3)" : undefined }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"} onMouseLeave={(e) => e.currentTarget.style.background = p.id === product.id ? "var(--surface-3)" : ""}>
                <span className="sb-logo-mark" style={{ background: p.color }}>
                  {p.name[0].toUpperCase()}
                </span>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{p.role} · {p.projects.length} projects</span>
                </div>
                {p.id === product.id && <I.check size={14} />}
              </div>
            ))}
            <hr className="divider" style={{ margin: "4px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "var(--text-xs)" }}>
              <I.plus size={14} /> プロダクトを追加
            </div>
          </div>
        )}
      </div>

      {/* Project sub-bar — only shown when inside a project */}
      {inProject && !collapsed && (
        <div className="sb-project" style={{ padding: "8px 8px 6px", borderBottom: "1px solid var(--sidebar-border)" }}>
          <div onClick={() => { setProject(null); setRoute("p-projects"); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", fontSize: 11, color: "var(--muted-foreground)", cursor: "pointer", borderRadius: "var(--radius-sm)" }}>
            <I.chevronLeft size={12}/> {t.backToProduct}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 2px" }}>
            {(() => {
              const k = window.PROJECT_KIND[project.kind] || window.PROJECT_KIND.service;
              return (
                <span style={{ width: 22, height: 22, borderRadius: 6, background: "color-mix(in oklch, " + k.color + " 18%, transparent)", color: k.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <k.icon size={12}/>
                </span>
              );
            })()}
            <div className="col" style={{ minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{project.stack}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav sections — change based on scope */}
      {!inProject ? (
        <>
          <div className="sb-section">
            {!collapsed && <div className="sb-section-label">{t.productHome}</div>}
            <nav className="sb-nav">
              {PRODUCT_NAV.map(n => (
                <div key={n.id} className="sb-nav-item" data-active={route === n.id} onClick={() => setRoute(n.id)} title={n.label}>
                  <span className="sb-icon">{n.icon(16)}</span>
                  <span className="sb-label">{n.label}</span>
                  {n.badge && <span className="sb-badge">{n.badge}</span>}
                </div>
              ))}
            </nav>
          </div>
          <div className="sb-section">
            {!collapsed && <div className="sb-section-label">運用</div>}
            <nav className="sb-nav">
              {PRODUCT_NAV_INFRA.map(n => (
                <div key={n.id} className="sb-nav-item" data-active={route === n.id} onClick={() => setRoute(n.id)} title={n.label}>
                  <span className="sb-icon">{n.icon(16)}</span>
                  <span className="sb-label">{n.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </>
      ) : (
        <>
          <div className="sb-section">
            {!collapsed && <div className="sb-section-label">{t.projectHome}</div>}
            <nav className="sb-nav">
              {PROJECT_NAV.map(n => (
                <div key={n.id} className="sb-nav-item" data-active={route === n.id} onClick={() => setRoute(n.id)} title={n.label}>
                  <span className="sb-icon">{n.icon(16)}</span>
                  <span className="sb-label">{n.label}</span>
                  {n.badge && <span className="sb-badge">{n.badge}</span>}
                </div>
              ))}
            </nav>
          </div>
          <div className="sb-section">
            {!collapsed && <div className="sb-section-label">実行環境</div>}
            <nav className="sb-nav">
              {PROJECT_NAV_RUN.map(n => (
                <div key={n.id} className="sb-nav-item" data-active={route === n.id} onClick={() => !n.disabled && setRoute(n.id)} title={n.label} style={{ opacity: n.disabled ? 0.4 : 1, cursor: n.disabled ? "not-allowed" : "pointer" }}>
                  <span className="sb-icon">{n.icon(16)}</span>
                  <span className="sb-label">{n.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}

      <div className="sb-section">
        {!collapsed && <div className="sb-section-label">ガイド</div>}
        <nav className="sb-nav">
          {NAV_META.map(n => (
            <div key={n.id} className="sb-nav-item" data-active={route === n.id} onClick={() => setRoute(n.id)} title={n.label}>
              <span className="sb-icon">{n.icon(16)}</span>
              <span className="sb-label">{n.label}</span>
              <span className="sb-badge" style={{ background: "color-mix(in oklch, var(--brand) 18%, transparent)", color: "var(--brand)" }}>v1</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="sb-footer">
        <div className="sb-nav">
          <div className="sb-nav-item" onClick={() => { window.location.href = "signin.html"; }} title={t.logout}>
            <span className="sb-icon"><I.power size={16} /></span>
            <span className="sb-label">{t.logout}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;

// ── Topbar ──────────────────────────────────────────────────────────
function Topbar({ route, product, setProduct, project, setProject, setRoute, locale, collapsed, setCollapsed, theme, setTheme, openCommand, setOpenCommand, recentProjects }) {
  const t = T[locale];
  const labels = {
    "p-dashboard": t.dashboard, "p-projects": t.projects, "p-issues": t.issues, "p-plans": t.plans, "p-ideas": t.ideas, "p-gantt": t.gantt, "p-wiki": t.wiki, "p-members": t.members, "p-domains": t.domains,
    "j-overview": t.overview, "j-code": t.codeBrowser, "j-branches": t.branches, "j-prs": t.prs, "j-issues": t.issues, "j-sandbox": t.sandbox, "j-agents": t.agents, "j-deploys": t.deploys,
    "system": t.designSystem,
  };
  return (
    <header className="app-topbar">
      <button className="tb-icon-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
        {collapsed ? <I.chevronRight size={16}/> : <I.chevronLeft size={16}/>}
      </button>
      <TopbarSwitcher
        product={product}
        setProduct={setProduct}
        project={project}
        setProject={setProject}
        setRoute={setRoute}
        locale={locale}
        recentProjects={recentProjects}
        routeLabel={labels[route] || route}
      />
      <button className="tb-search" onClick={() => setOpenCommand(true)}>
        <I.search size={14} />
        <span>{t.search}…</span>
        <span className="kbd">⌘K</span>
      </button>
      <button className="tb-icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
        {theme === "dark"
          ? <Icon size={16} d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 9-9c-5 0-9-4-9-9z" />
          : <Icon size={16} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>} />}
      </button>
      <button className="tb-icon-btn" title="Notifications">
        <I.bell size={16}/>
        <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: "var(--attention)", borderRadius: 99 }}/>
      </button>
      <Avatar name="Satoshi F" brand />
    </header>
  );
}
window.Topbar = Topbar;

// ── Topbar product+project switcher (Linear-style breadcrumb dropdowns)
function TopbarSwitcher({ product, setProduct, project, setProject, setRoute, locale, recentProjects, routeLabel }) {
  const t = T[locale];
  const [open, setOpen] = useState(null); // 'product' | 'project' | null
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="tb-switcher" ref={wrapRef}>
      {/* Product chip */}
      <div style={{ position: "relative" }}>
        <button className="tb-chip" data-open={open === "product"} onClick={() => setOpen(open === "product" ? null : "product")}>
          <span className="tb-chip-icon" style={{ background: product.color }}>{product.name[0].toUpperCase()}</span>
          <span className="tb-chip-label">{product.name}</span>
          <I.chevronDown size={12} className="tb-chip-caret"/>
        </button>
        {open === "product" && (
          <ProductSwitcherPop
            current={product}
            onPick={(p) => { setProduct(p); setOpen(null); }}
            onClose={() => setOpen(null)}
            t={t}
          />
        )}
      </div>

      <span className="tb-chip-sep">/</span>

      {/* Project chip — even when no project, shows "Pick project ▾" */}
      <div style={{ position: "relative" }}>
        {project ? (
          <button className="tb-chip" data-open={open === "project"} onClick={() => setOpen(open === "project" ? null : "project")}>
            {(() => {
              const k = window.PROJECT_KIND[project.kind] || window.PROJECT_KIND.service;
              const Ico = k.icon;
              return <span className="tb-chip-icon" style={{ background: k.color }}><Ico size={11}/></span>;
            })()}
            <span className="tb-chip-label" style={{ fontFamily: "var(--font-mono)" }}>{project.name}</span>
            <I.chevronDown size={12} className="tb-chip-caret"/>
          </button>
        ) : (
          <button className="tb-chip empty" data-open={open === "project"} onClick={() => setOpen(open === "project" ? null : "project")}>
            <I.folder size={13}/>
            <span className="tb-chip-label">{t.pickProject || "プロジェクトを選択"}</span>
            <I.chevronDown size={12} className="tb-chip-caret"/>
          </button>
        )}
        {open === "project" && (
          <ProjectSwitcherPop
            currentProduct={product}
            currentProject={project}
            allProducts={window.PRODUCTS}
            recent={recentProjects || []}
            onPick={(prod, proj) => {
              if (prod.id !== product.id) setProduct(prod);
              setProject(proj);
              setRoute("j-overview");
              setOpen(null);
            }}
            onClose={() => setOpen(null)}
            t={t}
          />
        )}
      </div>

      {/* Route label — shown only inside a project or product page */}
      {routeLabel && (
        <>
          <span className="tb-chip-sep">/</span>
          <span className="tb-chip-route">{routeLabel}</span>
        </>
      )}
    </div>
  );
}

function ProductSwitcherPop({ current, onPick, onClose, t }) {
  const [q, setQ] = useState("");
  const items = window.PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="sw-pop" style={{ left: 0 }} onClick={(e) => e.stopPropagation()}>
      <div className="sw-pop-search">
        <I.search size={14}/>
        <input autoFocus placeholder={(t.searchProducts || "プロダクトを検索") + "..."} value={q} onChange={(e) => setQ(e.target.value)}/>
        <span className="kbd">esc</span>
      </div>
      <div className="sw-pop-list">
        <div className="sw-pop-section">{t.products || "プロダクト"}<span>{items.length}</span></div>
        {items.length === 0 && <div className="sw-pop-empty">該当なし</div>}
        {items.map(p => (
          <div key={p.id} className="sw-pop-item" data-active={p.id === current.id} onClick={() => onPick(p)}>
            <span className="tb-chip-icon" style={{ background: p.color, width: 22, height: 22, fontSize: 11 }}>{p.name[0].toUpperCase()}</span>
            <div className="col" style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>{p.role}</span>
            </div>
            <span className="sw-pop-item-meta">{p.projects.length} projects</span>
            {p.id === current.id && <I.check size={14} style={{ color: "var(--primary)" }}/>}
          </div>
        ))}
      </div>
      <div className="sw-pop-foot">
        <span><span className="kbd">↑↓</span> 移動</span>
        <span><span className="kbd">↵</span> 切替</span>
        <span style={{ marginLeft: "auto" }}>{window.PRODUCTS.reduce((s,p) => s + p.projects.length, 0)} projects total</span>
      </div>
    </div>
  );
}

function ProjectSwitcherPop({ currentProduct, currentProject, allProducts, recent, onPick, onClose, t }) {
  const [q, setQ] = useState("");
  const ql = q.toLowerCase();
  const matches = (proj, prod) => !q || proj.name.toLowerCase().includes(ql) || (proj.stack || "").toLowerCase().includes(ql) || prod.name.toLowerCase().includes(ql);
  const recentItems = recent
    .map(({ productId, projectId }) => {
      const prod = allProducts.find(p => p.id === productId);
      const proj = prod && prod.projects.find(j => j.id === projectId);
      return prod && proj ? { prod, proj } : null;
    })
    .filter(Boolean)
    .filter(({ prod, proj }) => matches(proj, prod))
    .slice(0, 3);

  const allItems = allProducts.flatMap(prod =>
    prod.projects.filter(proj => matches(proj, prod)).map(proj => ({ prod, proj }))
  );

  const totalCount = allProducts.reduce((s, p) => s + p.projects.length, 0);

  return (
    <div className="sw-pop" style={{ left: 0, width: 420 }} onClick={(e) => e.stopPropagation()}>
      <div className="sw-pop-search">
        <I.search size={14}/>
        <input autoFocus placeholder={(t.searchAllProjects || "全プロダクトのプロジェクトを検索") + "..."} value={q} onChange={(e) => setQ(e.target.value)}/>
        <span className="kbd">esc</span>
      </div>
      <div className="sw-pop-list">
        {recentItems.length > 0 && !q && (
          <>
            <div className="sw-pop-section">{t.recent || "最近"}<span>{recentItems.length}</span></div>
            {recentItems.map(({ prod, proj }) => (
              <ProjectSwitchRow key={prod.id + ":" + proj.id} prod={prod} proj={proj} active={currentProject && currentProject.id === proj.id && currentProduct.id === prod.id} onPick={() => onPick(prod, proj)}/>
            ))}
          </>
        )}

        {allProducts.map(prod => {
          const items = prod.projects.filter(proj => matches(proj, prod));
          if (items.length === 0) return null;
          return (
            <React.Fragment key={prod.id}>
              <div className="sw-pop-section">
                <span className="row gap-1" style={{ alignItems: "center" }}>
                  <span className="tb-chip-icon" style={{ background: prod.color, width: 12, height: 12, fontSize: 8 }}>{prod.name[0].toUpperCase()}</span>
                  {prod.name}
                </span>
                <span>{items.length}</span>
              </div>
              {items.map(proj => (
                <ProjectSwitchRow key={prod.id + ":" + proj.id} prod={prod} proj={proj} active={currentProject && currentProject.id === proj.id && currentProduct.id === prod.id} onPick={() => onPick(prod, proj)}/>
              ))}
            </React.Fragment>
          );
        })}

        {allItems.length === 0 && <div className="sw-pop-empty">該当なし · 「{q}」</div>}
      </div>
      <div className="sw-pop-foot">
        <span><span className="kbd">↑↓</span> 移動</span>
        <span><span className="kbd">↵</span> 開く</span>
        <span><span className="kbd">⌘K</span> コマンド</span>
        <span style={{ marginLeft: "auto" }}>{totalCount} projects · {allProducts.length} products</span>
      </div>
    </div>
  );
}

function ProjectSwitchRow({ prod, proj, active, onPick }) {
  const k = window.PROJECT_KIND[proj.kind] || window.PROJECT_KIND.service;
  const Ico = k.icon;
  return (
    <div className="sw-pop-item" data-active={active} onClick={onPick}>
      <span className="tb-chip-icon" style={{ background: k.color, width: 22, height: 22 }}><Ico size={12}/></span>
      <div className="col" style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-1" style={{ alignItems: "baseline" }}>
          <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{proj.name}</span>
          <span className="sw-kind-chip">{k.label}</span>
          {proj.status === "planning" && <span className="sw-kind-chip" style={{ borderColor: "color-mix(in oklch, var(--warning) 50%, transparent)", color: "var(--warning)" }}>planning</span>}
        </div>
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj.stack} · {proj.devs} devs · {proj.lastCommit}</span>
      </div>
      {(proj.openIssues > 0 || proj.prs > 0) && (
        <span className="sw-pop-item-meta row gap-2" style={{ fontFeatureSettings: "'tnum'" }}>
          {proj.openIssues > 0 && <span><I.kanban size={10}/> {proj.openIssues}</span>}
          {proj.prs > 0 && <span><I.pr size={10}/> {proj.prs}</span>}
        </span>
      )}
      {active && <I.check size={14} style={{ color: "var(--primary)" }}/>}
    </div>
  );
}

window.TopbarSwitcher = TopbarSwitcher;

// Command palette overlay
function CommandPalette({ open, onClose, setRoute, product, setProject }) {
  if (!open) return null;
  const items = [
    { icon: I.home, label: "プロダクトホーム", route: "p-dashboard", scope: () => setProject(null), kind: "Navigate" },
    { icon: I.folder, label: "プロジェクト一覧", route: "p-projects", scope: () => setProject(null), kind: "Navigate" },
    ...product.projects.slice(0, 4).map(p => ({
      icon: (window.PROJECT_KIND[p.kind] || window.PROJECT_KIND.service).icon,
      label: `${p.name} を開く`,
      route: "j-overview",
      scope: () => setProject(p),
      kind: "Project"
    })),
    { icon: I.terminal, label: "新しいサンドボックスセッション", route: "j-sandbox", scope: () => setProject(product.projects[0]), kind: "Action" },
    { icon: I.bot, label: "AI エージェントを起動", route: "j-agents", scope: () => setProject(product.projects[0]), kind: "Action" },
    { icon: I.layers, label: "デザインシステムガイド", route: "system", scope: () => {}, kind: "Docs" },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "grid", placeItems: "start center", paddingTop: 80 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-2xl)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
          <I.search size={16} />
          <input className="input" autoFocus placeholder="コマンド、プロジェクト、Wiki... を検索" style={{ border: 0, padding: 0, background: "transparent", height: "auto" }} />
          <span className="kbd">esc</span>
        </div>
        <div style={{ maxHeight: 400, overflow: "auto", padding: 4 }}>
          {items.map((it, i) => (
            <div key={i} onClick={() => { it.scope(); setRoute(it.route); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
              <it.icon size={16} />
              <span style={{ flex: 1, fontSize: "var(--text-sm)" }}>{it.label}</span>
              <Badge kind="neutral" dot={false}>{it.kind}</Badge>
            </div>
          ))}
        </div>
        <div style={{ padding: "6px 12px", borderTop: "1px solid var(--border)", fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", display: "flex", gap: 12 }}>
          <span><span className="kbd">↑</span> <span className="kbd">↓</span> 移動</span>
          <span><span className="kbd">↵</span> 選択</span>
          <span style={{ marginLeft: "auto" }}>Famgia Command</span>
        </div>
      </div>
    </div>
  );
}
window.CommandPalette = CommandPalette;
