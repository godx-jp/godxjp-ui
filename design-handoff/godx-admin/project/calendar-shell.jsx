/* global React, window, I */
/* eslint-disable react/prop-types */
/* ============================================================================
 * 暦 Koyomi — shell (sidebar + topbar) for the Calendar service.
 * ========================================================================= */

const { useState: useS_sh } = React;

// ── Mini-month component used inside the sidebar ──────────────────────────
function MiniMonth({ y, m, today, selected, onPick, eventDots }) {
  // Build 6×7 grid for month (y, m) — Monday-first.
  const first = new Date(y, m - 1, 1);
  const dow0 = (first.getDay() + 6) % 7; // shift Sun=0 → Mon=0
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = [];
  // Lead-in from prev month
  const prevDays = new Date(y, m - 1, 0).getDate();
  for (let i = dow0 - 1; i >= 0; i--) cells.push({ d: prevDays - i, dim: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, dim: false });
  while (cells.length < 42) cells.push({ d: cells.length - dow0 - daysInMonth + 1, dim: true });

  const isToday = (c) => !c.dim && today.y === y && today.m === m && today.d === c.d;
  const isSel = (c) => !c.dim && selected.y === y && selected.m === m && selected.d === c.d;
  const hasDot = (c) => !c.dim && eventDots && eventDots[`${y}-${String(m).padStart(2,"0")}-${String(c.d).padStart(2,"0")}`];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, fontSize: 11 }}>
      {["月","火","水","木","金","土","日"].map((w, i) => (
        <div key={i} style={{ textAlign: "center", color: i >= 5 ? "var(--muted-foreground)" : "var(--muted-foreground)", fontWeight: 500, padding: "3px 0", letterSpacing: ".02em" }}>{w}</div>
      ))}
      {cells.map((c, i) => {
        const today_ = isToday(c);
        const sel_ = isSel(c);
        return (
          <button
            key={i}
            onClick={() => !c.dim && onPick && onPick({ y, m, d: c.d })}
            style={{
              position: "relative",
              all: "unset", cursor: c.dim ? "default" : "pointer",
              height: 22, display: "grid", placeItems: "center",
              borderRadius: 99,
              color: c.dim ? "color-mix(in oklch, var(--muted-foreground) 50%, transparent)" : (i % 7 >= 5 ? "var(--muted-foreground)" : "var(--foreground)"),
              background: today_ ? "var(--cal-accent)" : (sel_ ? "color-mix(in oklch, var(--cal-accent) 18%, transparent)" : "transparent"),
              fontWeight: today_ ? 700 : (sel_ ? 600 : 400),
            }}
          >
            <span style={{ color: today_ ? "white" : "inherit", fontVariantNumeric: "tabular-nums" }}>{c.d}</span>
            {hasDot(c) && !today_ && (
              <span style={{ position: "absolute", bottom: 1, width: 3, height: 3, borderRadius: 99, background: "var(--cal-accent)" }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Calendar list row ─────────────────────────────────────────────────────
function CalRow({ cal, onToggle }) {
  return (
    <label className="row gap-2" style={{ padding: "4px 6px", borderRadius: 6, cursor: "pointer", userSelect: "none" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <span style={{
        width: 14, height: 14, borderRadius: 4,
        border: `2px solid ${cal.color}`,
        background: cal.shown ? cal.color : "transparent",
        display: "grid", placeItems: "center",
        flexShrink: 0,
      }}>
        {cal.shown && <svg width="10" height="10" viewBox="0 0 24 24" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
      </span>
      <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {cal.name}
      </span>
      {cal.readonly && <span title="read-only" style={{ fontSize: 9, color: "var(--muted-foreground)" }}>R</span>}
      <input type="checkbox" checked={cal.shown} onChange={() => onToggle && onToggle(cal.id)} style={{ display: "none" }}/>
    </label>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function CalSidebar({ today, selected, onPick, calendars, onToggleCal, onCreate, eventDots }) {
  const mine   = calendars.filter(c => c.group === "mine");
  const orgs   = calendars.filter(c => c.group === "org");
  const shared = calendars.filter(c => c.group === "shared");

  return (
    <aside style={{
      width: 264, flexShrink: 0,
      borderRight: "1px solid var(--border)",
      background: "var(--background)",
      display: "flex", flexDirection: "column",
      overflow: "auto",
    }}>
      <div style={{ padding: 14 }}>
        <button onClick={onCreate} style={{
          all: "unset", boxSizing: "border-box",
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "10px 14px",
          background: "var(--card)", border: "1px solid var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)",
          borderRadius: 99, cursor: "pointer",
          fontSize: 13, fontWeight: 500,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--card)"}
        >
          <span style={{
            width: 26, height: 26, borderRadius: 99,
            background: "var(--cal-accent)", color: "white",
            display: "grid", placeItems: "center",
          }}>{I.plus(15)}</span>
          <span>Tạo sự kiện</span>
        </button>
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        <div className="row gap-1" style={{ marginBottom: 6, padding: "0 4px" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>5月 2026</span>
          <span className="ml-auto" style={{ display: "flex", gap: 2 }}>
            <button className="btn btn-ghost btn-sm" style={{ width: 22, height: 22, padding: 0 }}>{I.chevronLeft(13)}</button>
            <button className="btn btn-ghost btn-sm" style={{ width: 22, height: 22, padding: 0 }}>{I.chevronRight(13)}</button>
          </span>
        </div>
        <MiniMonth y={2026} m={5} today={today} selected={selected} onPick={onPick} eventDots={eventDots}/>
      </div>

      {/* Search people */}
      <div style={{ padding: "4px 14px 8px" }}>
        <div className="row gap-2" style={{
          height: 32, padding: "0 10px",
          background: "var(--surface-2)", borderRadius: 8,
        }}>
          <span style={{ color: "var(--muted-foreground)" }}>{I.search(13)}</span>
          <input placeholder="Tìm người để xem lịch" style={{
            border: 0, background: "transparent", flex: 1, outline: "none",
            fontSize: 12, color: "var(--foreground)",
          }}/>
        </div>
      </div>

      {/* My calendars */}
      <div style={{ padding: "4px 14px 8px" }}>
        <div className="row gap-1" style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".05em", padding: "6px 4px" }}>
          Lịch của tôi
          <span className="ml-auto">{I.chevronDown(12)}</span>
        </div>
        <div className="col" style={{ gap: 1 }}>
          {mine.map(c => <CalRow key={c.id} cal={c} onToggle={onToggleCal}/>)}
        </div>
      </div>

      {/* Org calendars */}
      <div style={{ padding: "4px 14px 8px" }}>
        <div className="row gap-1" style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".05em", padding: "6px 4px" }}>
          Tổ chức
          <span className="ml-auto">{I.chevronDown(12)}</span>
        </div>
        <div className="col" style={{ gap: 1 }}>
          {orgs.map(c => <CalRow key={c.id} cal={c} onToggle={onToggleCal}/>)}
        </div>
      </div>

      {/* Shared + holidays */}
      <div style={{ padding: "4px 14px 16px" }}>
        <div className="row gap-1" style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".05em", padding: "6px 4px" }}>
          Chia sẻ & ngày lễ
          <span className="ml-auto">{I.chevronDown(12)}</span>
        </div>
        <div className="col" style={{ gap: 1 }}>
          {shared.map(c => <CalRow key={c.id} cal={c} onToggle={onToggleCal}/>)}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 6, padding: "0 6px", color: "var(--muted-foreground)", fontSize: 11 }}>
          {I.plus(12)} Thêm lịch của người khác
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────
const VIEW_LABELS = {
  vi: { month: "Tháng", week: "Tuần", day: "Ngày", agenda: "Lịch trình" },
  ja: { month: "月",   week: "週",   day: "日",    agenda: "予定" },
  en: { month: "Month", week: "Week", day: "Day",  agenda: "Agenda" },
};
const TODAY_LABELS = { vi: "Hôm nay", ja: "今日", en: "Today" };

function CalTopbar({ titleMain, titleSub, view, setView, locale = "vi", onPrev, onNext, onToday, dense = false }) {
  const V = VIEW_LABELS[locale] || VIEW_LABELS.vi;
  return (
    <header style={{
      height: 60,
      padding: "0 16px 0 20px",
      borderBottom: "1px solid var(--border)",
      background: "var(--background)",
      display: "flex", alignItems: "center", gap: 12,
      flexShrink: 0,
    }}>
      <div className="row gap-2" style={{ marginRight: 4 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--cal-accent)", color: "white",
          display: "grid", placeItems: "center",
          fontWeight: 700, fontSize: 14, letterSpacing: "-.02em",
        }}>暦</span>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-.005em" }}>Koyomi</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>Famgia</span>
      </div>

      <button className="btn btn-secondary btn-sm" onClick={onToday}>{TODAY_LABELS[locale] || "Today"}</button>
      <div className="row" style={{ marginLeft: 2 }}>
        <button className="btn btn-ghost btn-sm" style={{ width: 28, padding: 0 }} onClick={onPrev}>{I.chevronLeft(15)}</button>
        <button className="btn btn-ghost btn-sm" style={{ width: 28, padding: 0 }} onClick={onNext}>{I.chevronRight(15)}</button>
      </div>

      <h1 style={{ margin: "0 0 0 6px", fontSize: 19, fontWeight: 500, letterSpacing: "-.01em" }}>
        {titleMain}
        {titleSub && <span style={{ color: "var(--muted-foreground)", fontWeight: 400, marginLeft: 8, fontSize: 14 }}>{titleSub}</span>}
      </h1>

      <div style={{ marginLeft: "auto" }} className="row gap-2">
        <div className="row gap-2" style={{
          height: 30, padding: "0 10px",
          background: "var(--surface-2)", borderRadius: 8,
          width: 220, color: "var(--muted-foreground)",
        }}>
          {I.search(13)}
          <span style={{ fontSize: 12 }}>Tìm sự kiện…</span>
          <span className="ml-auto" style={{ fontSize: 10, padding: "1px 5px", border: "1px solid var(--border)", borderRadius: 4 }}>⌘K</span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: 30, padding: 0 }} title="Notifications">{I.bell(15)}</button>
        <button className="btn btn-ghost btn-sm" style={{ width: 30, padding: 0 }} title="Settings">{I.settings(15)}</button>

        {/* View switcher — segmented */}
        <div style={{
          display: "inline-flex", height: 30, padding: 2, gap: 1,
          background: "var(--surface-2)", borderRadius: 8,
        }}>
          {["month","week","day","agenda"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              all: "unset",
              padding: "0 10px", height: 26,
              display: "grid", placeItems: "center",
              fontSize: 12, fontWeight: view === v ? 600 : 500,
              color: view === v ? "var(--foreground)" : "var(--muted-foreground)",
              background: view === v ? "var(--background)" : "transparent",
              border: view === v ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: 6, cursor: "pointer",
            }}>{V[v]}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 2px" }}/>
        <div style={{
          width: 32, height: 32, borderRadius: 99,
          background: "var(--wa-ruri)", color: "white",
          display: "grid", placeItems: "center",
          fontSize: 12, fontWeight: 600,
        }}>YT</div>
      </div>
    </header>
  );
}

window.CalSidebar = CalSidebar;
window.CalTopbar = CalTopbar;
window.MiniMonth = MiniMonth;
