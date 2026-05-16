/* global React, I, Icon, CI, UserAvatar, Sparkline, Donut */
/* Fake tenant page backgrounds — used to demo the float chat plugin in context */

// Generic top chrome (sidebar + topbar) for tenant pages
function TenantShell({ tenant, children }) {
  const conf = {
    kintai: {
      name: "dxs-kintai", role: "勤怠管理", color: "oklch(56% 0.15 240)",
      nav: [
        { icon: I.home, label: "ダッシュボード", active: true },
        { icon: I.users, label: "メンバー" },
        { icon: I.layers, label: "シフト" },
        { icon: I.doc, label: "勤怠記録" },
        { icon: I.shield, label: "承認" },
        { icon: I.kanban, label: "レポート" },
        { icon: I.settings, label: "設定" },
      ],
    },
    betoya: {
      name: "Betoya", role: "Vietnamese restaurant", color: "oklch(58% 0.159 150)",
      nav: [
        { icon: I.home, label: "Tổng quan", active: true },
        { icon: I.doc, label: "Đơn hàng" },
        { icon: I.layers, label: "Menu" },
        { icon: I.users, label: "Nhân viên" },
        { icon: I.database, label: "Kho hàng" },
        { icon: I.kanban, label: "Báo cáo" },
        { icon: I.settings, label: "Cài đặt" },
      ],
    },
    godx: {
      name: "godx-admin", role: "Platform admin", color: "oklch(60% 0.137 163)",
      nav: [
        { icon: I.home, label: "Dashboard", active: true },
        { icon: I.folder, label: "Products" },
        { icon: I.kanban, label: "Issues" },
        { icon: I.users, label: "Members" },
        { icon: I.globe, label: "Domains" },
        { icon: I.settings, label: "Settings" },
      ],
    },
  }[tenant] || {};

  return (
    <div data-tenant={tenant} style={{
      width: "100%", height: "100%",
      display: "grid",
      gridTemplateColumns: "240px 1fr",
      gridTemplateRows: "48px 1fr",
      gridTemplateAreas: '"sidebar topbar" "sidebar main"',
      background: "var(--surface-2)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Sidebar */}
      <aside style={{
        gridArea: "sidebar",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          height: 48, padding: "0 14px",
          display: "flex", alignItems: "center", gap: 8,
          borderBottom: "1px solid var(--sidebar-border)",
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6,
            background: conf.color, color: "#fff",
            display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12,
          }}>{conf.name && conf.name[0].toUpperCase()}</span>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{conf.name}</span>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{conf.role}</span>
          </div>
        </div>
        <nav style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          {conf.nav && conf.nav.map((n, i) => (
            <button key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              height: 28, padding: "0 10px",
              border: 0, background: n.active ? "var(--sidebar-active-bg)" : "transparent",
              color: n.active ? "var(--sidebar-active-fg)" : "var(--sidebar-fg)",
              fontSize: 12.5, fontWeight: n.active ? 500 : 400,
              cursor: "pointer", borderRadius: 6, textAlign: "left",
            }}>
              <n.icon size={14}/>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Topbar */}
      <header style={{
        gridArea: "topbar",
        background: "var(--background)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "var(--muted-foreground)",
        }}>
          <span>{conf.name}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{conf.nav && conf.nav[0].label}</span>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          width: 280, height: 28,
          border: "1px solid var(--border)", borderRadius: 6,
          background: "var(--input-background)",
          display: "flex", alignItems: "center", gap: 8, padding: "0 10px",
          color: "var(--muted-foreground)", fontSize: 12,
        }}>
          {I.search(13)} <span style={{ flex: 1 }}>Tìm kiếm…</span>
          <span className="kbd" style={{ fontSize: 9 }}>⌘K</span>
        </div>
        <button style={{ width: 28, height: 28, border: 0, background: "transparent", color: "var(--muted-foreground)", borderRadius: 6, display: "grid", placeItems: "center", cursor: "pointer" }}>{I.bell(15)}</button>
        <UserAvatar id="me" size={28}/>
      </header>

      {/* Main */}
      <main style={{ gridArea: "main", overflow: "auto", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
window.TenantShell = TenantShell;

// Kintai dashboard mock body
function KintaiDashboard() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>ダッシュボード</h1>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>2026年5月 第2週</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "今日の出勤", value: "42 / 48", delta: "+3", color: "var(--success)" },
          { label: "遅刻", value: "2", delta: "-1", color: "var(--success)" },
          { label: "残業時間 (今週)", value: "147h", delta: "+8h", color: "var(--warning)" },
          { label: "未申請", value: "5", delta: "+2", color: "var(--error)" },
        ].map((k, i) => (
          <div key={i} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{k.delta} vs 昨日</div>
          </div>
        ))}
      </div>

      {/* Chart + Activity row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 18 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>出勤推移</h3>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>過去14日</span>
          </div>
          <div style={{ height: 160, position: "relative" }}>
            <Sparkline data={[38,40,42,39,41,44,42,45,43,46,44,42,45,42]} height={160}/>
          </div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>承認待ち</h3>
          <div style={{ display: "grid", placeItems: "center", height: 120 }}>
            <Donut value={68} size={120} stroke={10}/>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", textAlign: "center" }}>17 / 25 件 完了</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>最近の打刻</h3>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>·  最新42件</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["メンバー","部署","出勤","退勤","休憩","残業","状態"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500, color: "var(--muted-foreground)", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["田中 美咲", "デザイン", "09:02", "—", "0h", "—", "勤務中"],
              ["佐藤 健", "QA", "08:55", "—", "1h", "—", "勤務中"],
              ["Naoki N", "Backend", "09:15", "—", "0h", "—", "勤務中"],
              ["Anh Khoa", "Frontend", "09:48", "—", "0h", "—", "遅刻"],
              ["Mai Linh", "PM", "09:00", "18:32", "1h", "0.5h", "完了"],
              ["Quang Hùng", "Ops", "08:30", "19:10", "1h", "1.6h", "完了"],
              ["Phương Anh", "HR", "09:00", "18:00", "1h", "—", "完了"],
            ].map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                {row.map((c, j) => (
                  <td key={j} style={{ padding: "8px 12px", fontFamily: j >= 2 && j <= 5 ? "ui-monospace, monospace" : "inherit" }}>
                    {j === 6
                      ? <span style={{
                          fontSize: 10.5, padding: "2px 8px", borderRadius: 99,
                          background: c === "完了" ? "color-mix(in oklch, var(--success) 14%, transparent)" : c === "遅刻" ? "color-mix(in oklch, var(--error) 14%, transparent)" : "color-mix(in oklch, var(--info) 14%, transparent)",
                          color: c === "完了" ? "var(--success)" : c === "遅刻" ? "var(--error)" : "var(--info)",
                        }}>{c}</span>
                      : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.KintaiDashboard = KintaiDashboard;

// Betoya restaurant dashboard
function BetoyaDashboard() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Tổng quan cửa hàng</h1>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Hôm nay · 13/05</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Doanh thu hôm nay", value: "12.480.000₫", delta: "+8.4%", color: "var(--success)" },
          { label: "Đơn hoàn thành", value: "142", delta: "+12", color: "var(--success)" },
          { label: "Khách trung bình", value: "87.890₫", delta: "+2.1%", color: "var(--success)" },
          { label: "Đơn huỷ", value: "4", delta: "+1", color: "var(--warning)" },
        ].map((k, i) => (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{k.delta} vs hôm qua</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 18 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>Doanh thu 7 ngày</h3>
          <div style={{ height: 160 }}>
            <Sparkline data={[8,9,10,11,9,13,12]} height={160}/>
          </div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>Top món hôm nay</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            {[
              ["Phở bò tái", 32, "var(--brand)"],
              ["Bún chả Hà Nội", 28, "var(--brand)"],
              ["Bánh mì pate", 24, "var(--brand)"],
              ["Cơm tấm sườn", 19, "var(--brand)"],
            ].map(([name, n, c], i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span>{name}</span><span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted-foreground)" }}>{n}</span>
                </div>
                <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${n*2.8}%`, height: "100%", background: c }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Đơn hàng gần đây</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Mã","Bàn","Món","Tổng","Thanh toán","Phục vụ","Trạng thái"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500, color: "var(--muted-foreground)", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["B-2641","12","Phở bò + Trà đá","85.000₫","Tiền mặt","Mai L.","Hoàn thành"],
              ["B-2640","08","Bún chả + Nước","120.000₫","QR","Mai L.","Phục vụ"],
              ["B-2639","T-A","2× Bánh mì","60.000₫","QR","—","Take-away"],
              ["B-2638","04","Cơm tấm + Trà","75.000₫","Thẻ","Phương","Hoàn thành"],
              ["B-2637","05","Phở gà","65.000₫","Tiền mặt","Mai L.","Đang nấu"],
            ].map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                {row.map((c, j) => (
                  <td key={j} style={{ padding: "8px 12px", fontFamily: j === 0 || j === 3 ? "ui-monospace, monospace" : "inherit" }}>
                    {j === 6
                      ? <span style={{
                          fontSize: 10.5, padding: "2px 8px", borderRadius: 99,
                          background: c === "Hoàn thành" ? "color-mix(in oklch, var(--success) 14%, transparent)" : c === "Đang nấu" ? "color-mix(in oklch, var(--warning) 18%, transparent)" : "color-mix(in oklch, var(--info) 14%, transparent)",
                          color: c === "Hoàn thành" ? "var(--success)" : c === "Đang nấu" ? "var(--warning)" : "var(--info)",
                        }}>{c}</span>
                      : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.BetoyaDashboard = BetoyaDashboard;
