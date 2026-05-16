/* global React, window, I */
/* eslint-disable react/prop-types */
/* ============================================================================
 * 暦 Koyomi — Month / Week / Day / Agenda views.
 * ========================================================================= */

const { useState: useS_v, useMemo: useM_v } = React;

// ── Time helpers ──────────────────────────────────────────────────────────
const PX_PER_MIN = 0.9;            // 1 hour = 54 px in week view
const DAY_START_H = 6;             // 06:00
const DAY_END_H = 22;              // 22:00
const minToY = (h, m = 0) => (h - DAY_START_H) * 60 * PX_PER_MIN + m * PX_PER_MIN;
const parseHM = (s) => { const [h, m] = s.split(":").map(Number); return { h, m }; };

// Format e.g. "10:00" → "10時" / "10:00 AM" / "10:00"
const fmtHour = (h, locale) => locale === "ja" ? `${h}時` : `${String(h).padStart(2,"0")}:00`;

// ── Resolve event color from its calendar ─────────────────────────────────
function eventColor(ev, calendars) {
  const c = calendars.find(c => c.id === ev.calId);
  return c ? c.color : "#4c6cb3";
}

// ── Event chip (timed, inside a column) ───────────────────────────────────
function EventBlock({ ev, calendars, onClick, lane = 0, lanes = 1, selected }) {
  const { h: sh, m: sm } = parseHM(ev.start);
  const { h: eh, m: em } = parseHM(ev.end);
  const top = minToY(sh, sm);
  const height = Math.max(20, minToY(eh, em) - top - 1);
  const color = eventColor(ev, calendars);
  const isShort = (eh * 60 + em) - (sh * 60 + sm) < 45;
  const isCustomer = ev.type === "customer";
  const isFocus = ev.type === "focus";
  const isPersonal = ev.type === "personal";
  const isTentative = ev.status === "tentative";

  // Two visual treatments: solid (organizer/accepted) vs subtle tint (others).
  const bg = isFocus
    ? `repeating-linear-gradient(135deg, ${color}24 0 6px, ${color}10 6px 12px)`
    : isTentative
    ? `repeating-linear-gradient(135deg, ${color}38 0 5px, transparent 5px 10px), color-mix(in oklch, ${color} 16%, var(--background))`
    : isCustomer
    ? color
    : `color-mix(in oklch, ${color} 18%, var(--background))`;

  const textColor = isCustomer ? "white" : color;
  const borderL = isCustomer ? color : color;

  // multi-lane horizontal split
  const widthPct = `calc(${100 / lanes}% - 4px)`;
  const leftPct = `calc(${(100 * lane) / lanes}% + 2px)`;

  return (
    <button onClick={() => onClick && onClick(ev)} style={{
      all: "unset", cursor: "pointer",
      position: "absolute",
      top, height, left: leftPct, width: widthPct,
      background: bg,
      borderLeft: `3px solid ${borderL}`,
      borderRadius: 4,
      padding: isShort ? "1px 6px" : "4px 6px",
      color: textColor,
      fontSize: 11.5, lineHeight: 1.25,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: selected ? `0 0 0 2px var(--background), 0 0 0 4px ${color}` : "none",
      transition: "box-shadow 120ms",
    }}
    onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(0.96)"}
    onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
    >
      <div style={{ display: "flex", gap: 4, alignItems: "baseline", minWidth: 0 }}>
        <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{ev.title}</span>
      </div>
      {!isShort && (
        <div style={{ fontSize: 10.5, opacity: isCustomer ? .92 : .85, fontVariantNumeric: "tabular-nums" }}>
          {ev.start}–{ev.end}
          {ev.location && <span style={{ marginLeft: 6, opacity: .75 }}>· {ev.location}</span>}
        </div>
      )}
      {isPersonal && !isShort && (
        <div style={{ marginTop: "auto", fontSize: 10, opacity: .7 }}>cá nhân</div>
      )}
    </button>
  );
}

// ── Naïve lane allocator for overlapping events on a single day ───────────
function layoutEvents(dayEvents) {
  // sort by start
  const evs = [...dayEvents].sort((a, b) => a.start.localeCompare(b.start));
  const lanes = []; // each lane is an array of events
  for (const e of evs) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (last.end <= e.start) { lanes[i].push(e); e._lane = i; placed = true; break; }
    }
    if (!placed) { e._lane = lanes.length; lanes.push([e]); }
  }
  const laneCount = Math.max(1, lanes.length);
  for (const e of evs) e._lanes = laneCount;
  return evs;
}

// ── Day column grid lines ─────────────────────────────────────────────────
function GridColumn({ children, isToday }) {
  const rows = [];
  for (let h = DAY_START_H; h < DAY_END_H; h++) {
    rows.push(<div key={h} style={{ height: 60 * PX_PER_MIN, borderBottom: "1px solid color-mix(in oklch, var(--border) 60%, transparent)" }}/>);
  }
  return (
    <div style={{
      position: "relative",
      borderRight: "1px solid var(--border)",
      background: isToday ? "color-mix(in oklch, var(--cal-accent) 4%, var(--background))" : "var(--background)",
      flex: 1, minWidth: 0,
    }}>
      {rows}
      {children}
    </div>
  );
}

// ── WEEK VIEW ─────────────────────────────────────────────────────────────
function WeekView({ today, selected, events, calendars, onPickEvent, selectedEventId, locale = "vi" }) {
  // Compute the Mon-Sun window around `selected`.
  const sel = new Date(selected.y, selected.m - 1, selected.d);
  const dow0 = (sel.getDay() + 6) % 7;
  const monday = new Date(sel); monday.setDate(sel.getDate() - dow0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), dow: i };
  });
  const dowLabel = locale === "ja" ? ["月","火","水","木","金","土","日"] : locale === "vi" ? ["T2","T3","T4","T5","T6","T7","CN"] : ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  const ymd = (d) => `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
  const visible = events.filter(e => calendars.find(c => c.id === e.calId && c.shown));
  const allDayByDay = days.map(d => visible.filter(e => e.allDay && e.date === ymd(d)));
  const timedByDay = days.map(d => layoutEvents(visible.filter(e => !e.allDay && e.date === ymd(d))));

  // "now" line on today
  const nowH = 16, nowM = 7;
  const nowY = minToY(nowH, nowM);

  // GMT label
  const tzLabel = locale === "vi" ? "GMT+09 · Tokyo" : "GMT+09";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--background)" }}>
      {/* Day header */}
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ borderRight: "1px solid var(--border)", padding: "10px 6px", fontSize: 9, color: "var(--muted-foreground)", textAlign: "right", lineHeight: 1.2 }}>
          {tzLabel}
        </div>
        {days.map((d, i) => {
          const isToday_ = today.y === d.y && today.m === d.m && today.d === d.d;
          const isSel = selected.y === d.y && selected.m === d.m && selected.d === d.d;
          return (
            <div key={i} style={{
              padding: "8px 8px 10px",
              borderRight: i === 6 ? "none" : "1px solid var(--border)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              background: isToday_ ? "color-mix(in oklch, var(--cal-accent) 5%, var(--background))" : "transparent",
            }}>
              <span style={{ fontSize: 10.5, fontWeight: 500, color: isToday_ ? "var(--cal-accent)" : (i >= 5 ? "var(--muted-foreground)" : "var(--muted-foreground)"), letterSpacing: ".05em" }}>{dowLabel[i]}</span>
              <span style={{
                fontSize: 18, fontWeight: 500,
                width: 32, height: 32, borderRadius: 99,
                display: "grid", placeItems: "center",
                color: isToday_ ? "white" : (isSel ? "var(--cal-accent)" : "var(--foreground)"),
                background: isToday_ ? "var(--cal-accent)" : (isSel ? "color-mix(in oklch, var(--cal-accent) 14%, transparent)" : "transparent"),
                fontVariantNumeric: "tabular-nums",
              }}>{d.d}</span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid var(--border)", flexShrink: 0, minHeight: 32 }}>
        <div style={{ borderRight: "1px solid var(--border)", padding: "6px 6px", fontSize: 9.5, color: "var(--muted-foreground)", textAlign: "right" }}>
          {locale === "ja" ? "終日" : "Cả ngày"}
        </div>
        {days.map((d, i) => (
          <div key={i} style={{
            borderRight: i === 6 ? "none" : "1px solid var(--border)",
            padding: 4, display: "flex", flexDirection: "column", gap: 2,
          }}>
            {allDayByDay[i].map(ev => {
              const color = eventColor(ev, calendars);
              return (
                <button key={ev.id} onClick={() => onPickEvent && onPickEvent(ev)} style={{
                  all: "unset", cursor: "pointer",
                  background: color, color: "white",
                  padding: "2px 6px", borderRadius: 4,
                  fontSize: 11, fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{ev.title}</button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", position: "relative" }}>
          {/* Hour gutter */}
          <div style={{ borderRight: "1px solid var(--border)", position: "relative" }}>
            {Array.from({ length: DAY_END_H - DAY_START_H }, (_, i) => (
              <div key={i} style={{ height: 60 * PX_PER_MIN, position: "relative" }}>
                <span style={{
                  position: "absolute", top: -7, right: 6,
                  fontSize: 10, color: "var(--muted-foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}>{i === 0 ? "" : fmtHour(DAY_START_H + i, locale)}</span>
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map((d, i) => {
            const isToday_ = today.y === d.y && today.m === d.m && today.d === d.d;
            return (
              <GridColumn key={i} isToday={isToday_}>
                {timedByDay[i].map(ev => (
                  <EventBlock
                    key={ev.id}
                    ev={ev}
                    calendars={calendars}
                    lane={ev._lane}
                    lanes={ev._lanes}
                    selected={selectedEventId === ev.id}
                    onClick={onPickEvent}
                  />
                ))}
                {isToday_ && nowY >= 0 && (
                  <>
                    <div style={{ position: "absolute", left: -5, top: nowY - 5, width: 10, height: 10, borderRadius: 99, background: "var(--cal-accent)", zIndex: 2 }}/>
                    <div style={{ position: "absolute", left: 0, right: 0, top: nowY, height: 2, background: "var(--cal-accent)", zIndex: 1 }}/>
                  </>
                )}
              </GridColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MONTH VIEW ────────────────────────────────────────────────────────────
function MonthView({ today, selected, events, calendars, onPickEvent, locale = "vi" }) {
  const y = selected.y, m = selected.m;
  // Build 6×7 grid (Mon-first) of {y,m,d,dim}
  const first = new Date(y, m - 1, 1);
  const dow0 = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const prevDays = new Date(y, m - 1, 0).getDate();

  const cells = [];
  for (let i = dow0 - 1; i >= 0; i--) cells.push({ y, m: m - 1, d: prevDays - i, dim: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y, m, d, dim: false });
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    cells.push({ y, m: m + 1, d: cells.length - dow0 - daysInMonth + 1, dim: true });
  }

  const dowLabel = locale === "ja" ? ["月","火","水","木","金","土","日"] : locale === "vi" ? ["THỨ HAI","THỨ BA","THỨ TƯ","THỨ NĂM","THỨ SÁU","THỨ BẢY","CHỦ NHẬT"] : ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  const ymd = (c) => `${c.y}-${String(c.m).padStart(2,"0")}-${String(c.d).padStart(2,"0")}`;
  const visible = events.filter(e => calendars.find(c => c.id === e.calId && c.shown));
  const byDay = (c) => visible.filter(e => e.date === ymd({ y: c.y, m: c.m, d: c.d }));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--background)" }}>
      {/* Day-of-week header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {dowLabel.map((w, i) => (
          <div key={i} style={{
            padding: "8px 10px", fontSize: 10.5, fontWeight: 500,
            color: "var(--muted-foreground)", letterSpacing: ".06em",
            borderRight: i === 6 ? "none" : "1px solid var(--border)",
          }}>{w}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gridTemplateRows: "repeat(6, 1fr)",
      }}>
        {cells.map((c, i) => {
          const isToday = !c.dim && today.y === c.y && today.m === c.m && today.d === c.d;
          const evs = byDay(c).slice(0, 4);
          const more = byDay(c).length - evs.length;
          const isWeekend = i % 7 >= 5;
          return (
            <div key={i} style={{
              borderRight: (i % 7) === 6 ? "none" : "1px solid var(--border)",
              borderBottom: i >= 35 ? "none" : "1px solid var(--border)",
              padding: 5,
              background: c.dim ? "color-mix(in oklch, var(--surface-2) 50%, transparent)"
                       : isWeekend ? "color-mix(in oklch, var(--surface-2) 25%, transparent)"
                       : "var(--background)",
              display: "flex", flexDirection: "column", gap: 2,
              overflow: "hidden",
              minHeight: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  display: "inline-grid", placeItems: "center",
                  width: 22, height: 22, borderRadius: 99,
                  fontSize: 12, fontWeight: isToday ? 700 : 500,
                  fontVariantNumeric: "tabular-nums",
                  color: isToday ? "white" : (c.dim ? "color-mix(in oklch, var(--muted-foreground) 70%, transparent)" : "var(--foreground)"),
                  background: isToday ? "var(--cal-accent)" : "transparent",
                }}>{c.d}</span>
                {c.d === 1 && !c.dim && <span style={{ fontSize: 9, color: "var(--muted-foreground)" }}>{locale === "ja" ? `${c.m}月` : (locale === "vi" ? `Th. ${c.m}` : `${c.m}`)}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1.5, overflow: "hidden" }}>
                {evs.map(ev => {
                  const color = eventColor(ev, calendars);
                  if (ev.allDay) {
                    return (
                      <button key={ev.id} onClick={() => onPickEvent && onPickEvent(ev)} style={{
                        all: "unset", cursor: "pointer",
                        background: color, color: "white",
                        padding: "1px 5px", borderRadius: 3,
                        fontSize: 10.5, lineHeight: 1.3, fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{ev.title}</button>
                    );
                  }
                  return (
                    <button key={ev.id} onClick={() => onPickEvent && onPickEvent(ev)} style={{
                      all: "unset", cursor: "pointer",
                      padding: "0 4px",
                      fontSize: 10.5, lineHeight: 1.4,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      display: "flex", gap: 4, alignItems: "center",
                      color: c.dim ? "color-mix(in oklch, var(--foreground) 50%, transparent)" : "var(--foreground)",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: color, flexShrink: 0 }}/>
                      <span style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", fontSize: 10 }}>{ev.start}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</span>
                    </button>
                  );
                })}
                {more > 0 && (
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)", padding: "0 4px" }}>+ {more} {locale === "vi" ? "khác" : (locale === "ja" ? "件" : "more")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DAY VIEW (single column + agenda sidebar) ─────────────────────────────
function DayView({ today, selected, events, calendars, onPickEvent, selectedEventId, locale = "vi" }) {
  const y = selected.y, m = selected.m, d = selected.d;
  const ymd = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const visible = events.filter(e => calendars.find(c => c.id === e.calId && c.shown));
  const dayEvs = visible.filter(e => e.date === ymd);
  const allDay = dayEvs.filter(e => e.allDay);
  const timed = layoutEvents(dayEvs.filter(e => !e.allDay));
  const isToday_ = today.y === y && today.m === m && today.d === d;

  const dowLabel = locale === "ja" ? ["月曜日","火曜日","水曜日","木曜日","金曜日","土曜日","日曜日"]
                  : locale === "vi" ? ["Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy","Chủ nhật"]
                  : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;

  // "now" line: 16:07
  const nowY = minToY(16, 7);

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, background: "var(--background)" }}>
      {/* Time column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "baseline", gap: 10,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 32, fontWeight: 500, lineHeight: 1,
            color: isToday_ ? "var(--cal-accent)" : "var(--foreground)",
            fontVariantNumeric: "tabular-nums",
          }}>{d}</span>
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{dowLabel[dow]}</span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{locale === "ja" ? `${y}年${m}月` : `${m}/${y}`}</span>
          </div>
          {isToday_ && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: "color-mix(in oklch, var(--cal-accent) 14%, transparent)", color: "var(--cal-accent)", fontWeight: 600 }}>{locale === "ja" ? "今日" : "Hôm nay"}</span>}
          <span className="ml-auto" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{timed.length + allDay.length} sự kiện</span>
        </div>

        {allDay.length > 0 && (
          <div style={{
            padding: "6px 16px 8px 60px", borderBottom: "1px solid var(--border)",
            display: "flex", gap: 6, flexWrap: "wrap",
            flexShrink: 0,
          }}>
            {allDay.map(ev => {
              const color = eventColor(ev, calendars);
              return (
                <button key={ev.id} onClick={() => onPickEvent && onPickEvent(ev)} style={{
                  all: "unset", cursor: "pointer",
                  background: color, color: "white",
                  padding: "3px 9px", borderRadius: 99,
                  fontSize: 11.5, fontWeight: 500,
                }}>{ev.title}</button>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", position: "relative" }}>
            <div style={{ borderRight: "1px solid var(--border)" }}>
              {Array.from({ length: DAY_END_H - DAY_START_H }, (_, i) => (
                <div key={i} style={{ height: 60 * PX_PER_MIN, position: "relative" }}>
                  <span style={{
                    position: "absolute", top: -7, right: 8,
                    fontSize: 10.5, color: "var(--muted-foreground)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{i === 0 ? "" : fmtHour(DAY_START_H + i, locale)}</span>
                </div>
              ))}
            </div>
            <GridColumn isToday={isToday_}>
              {timed.map(ev => (
                <EventBlock
                  key={ev.id}
                  ev={ev}
                  calendars={calendars}
                  lane={ev._lane}
                  lanes={ev._lanes}
                  selected={selectedEventId === ev.id}
                  onClick={onPickEvent}
                />
              ))}
              {isToday_ && (
                <>
                  <div style={{ position: "absolute", left: -5, top: nowY - 5, width: 10, height: 10, borderRadius: 99, background: "var(--cal-accent)", zIndex: 2 }}/>
                  <div style={{ position: "absolute", left: 0, right: 0, top: nowY, height: 2, background: "var(--cal-accent)", zIndex: 1 }}/>
                </>
              )}
            </GridColumn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AGENDA VIEW (compact list, grouped by date) ───────────────────────────
function AgendaView({ today, selected, events, calendars, onPickEvent, locale = "vi" }) {
  const visible = events.filter(e => calendars.find(c => c.id === e.calId && c.shown));
  // Cluster the next 14 days starting at week monday
  const sel = new Date(selected.y, selected.m - 1, selected.d);
  const dow0 = (sel.getDay() + 6) % 7;
  const monday = new Date(sel); monday.setDate(sel.getDate() - dow0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d;
  });

  const dowLabel = locale === "ja" ? ["月","火","水","木","金","土","日"] : locale === "vi" ? ["T2","T3","T4","T5","T6","T7","CN"] : ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  return (
    <div style={{ flex: 1, overflow: "auto", background: "var(--background)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 24px 60px" }}>
        {days.map((d, i) => {
          const key = ymd(d);
          const dayEvs = visible.filter(e => e.date === key).sort((a, b) => (a.allDay ? "00:00" : a.start).localeCompare(b.allDay ? "00:00" : b.start));
          const isToday_ = today.y === d.getFullYear() && today.m === d.getMonth() + 1 && today.d === d.getDate();
          const dow = (d.getDay() + 6) % 7;
          if (dayEvs.length === 0) return null;
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 24, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingTop: 2 }}>
                <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", letterSpacing: ".05em" }}>{dowLabel[dow]}</span>
                <span style={{
                  fontSize: 24, fontWeight: 500, lineHeight: 1.1,
                  color: isToday_ ? "var(--cal-accent)" : "var(--foreground)",
                  fontVariantNumeric: "tabular-nums",
                }}>{d.getDate()}</span>
                <span style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>{locale === "ja" ? `${d.getMonth()+1}月` : (locale === "vi" ? `Th. ${d.getMonth()+1}` : `${d.getMonth()+1}`)}</span>
                {isToday_ && <span style={{ marginTop: 4, fontSize: 9.5, padding: "1px 6px", borderRadius: 99, background: "var(--cal-accent)", color: "white", fontWeight: 600 }}>NOW</span>}
              </div>
              <div className="col" style={{ gap: 6 }}>
                {dayEvs.map(ev => {
                  const color = eventColor(ev, calendars);
                  return (
                    <button key={ev.id} onClick={() => onPickEvent && onPickEvent(ev)} style={{
                      all: "unset", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "108px 1fr auto",
                      gap: 12, alignItems: "center",
                      padding: "6px 10px", borderRadius: 6,
                      borderLeft: `3px solid ${color}`,
                      background: "var(--surface-2)",
                    }}>
                      <span style={{ fontSize: 11.5, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                        {ev.allDay ? (locale === "ja" ? "終日" : "Cả ngày") : `${ev.start} – ${ev.end}`}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {ev.title}
                        {ev.location && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--muted-foreground)", fontWeight: 400 }}>· {ev.location}</span>}
                      </span>
                      <span style={{ display: "flex", gap: -4 }}>
                        {ev.attendees.slice(0, 3).map((pid, j) => {
                          const p = window.CAL_DATA.PEOPLE.find(x => x.id === pid);
                          if (!p) return null;
                          return (
                            <span key={pid} title={p.name} style={{
                              width: 22, height: 22, borderRadius: 99,
                              background: p.color, color: "white",
                              display: "inline-grid", placeItems: "center",
                              fontSize: 9.5, fontWeight: 600,
                              border: "2px solid var(--background)",
                              marginLeft: j === 0 ? 0 : -8,
                            }}>{p.short}</span>
                          );
                        })}
                        {ev.attendees.length > 3 && (
                          <span style={{
                            width: 22, height: 22, borderRadius: 99,
                            background: "var(--surface-3)", color: "var(--muted-foreground)",
                            display: "inline-grid", placeItems: "center",
                            fontSize: 9.5, fontWeight: 600,
                            border: "2px solid var(--background)",
                            marginLeft: -8,
                          }}>+{ev.attendees.length - 3}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { WeekView, MonthView, DayView, AgendaView, eventColor });
