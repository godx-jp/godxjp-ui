/* global React, window, I */
/* eslint-disable react/prop-types */
/* ============================================================================
 * 暦 Koyomi — Detail panel, create-event modal, find-a-time scheduler.
 * ========================================================================= */

const { useState: useS_x } = React;

// ── Right-side event detail panel ─────────────────────────────────────────
function EventDetail({ ev, calendars, onClose, locale = "vi" }) {
  if (!ev) return null;
  const cal = calendars.find(c => c.id === ev.calId);
  const people = window.CAL_DATA.PEOPLE;
  const orgnId = ev.attendees[0];
  const organizer = people.find(p => p.id === orgnId) || people[0];
  const color = cal ? cal.color : "#4c6cb3";

  const STATUS_LABEL = { accepted: "Đã nhận", tentative: "Tạm thời", declined: "Từ chối", organizer: "Người tổ chức" };
  const STATUS_BADGE = { accepted: "badge-success", tentative: "badge-warning", declined: "badge-error", organizer: "badge-info" };

  return (
    <aside style={{
      width: 360, flexShrink: 0,
      borderLeft: "1px solid var(--border)",
      background: "var(--background)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, marginTop: 8, flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: 1.3 }}>{ev.title}</h2>
          <div style={{ marginTop: 2, fontSize: 11.5, color: "var(--muted-foreground)" }}>
            {cal ? cal.name : "—"} · {STATUS_LABEL[ev.status] || ev.status}
          </div>
        </div>
        <div className="row gap-1">
          <button className="btn btn-ghost btn-sm" style={{ width: 26, padding: 0 }} title="Edit">{I.pencil(13)}</button>
          <button className="btn btn-ghost btn-sm" style={{ width: 26, padding: 0 }} title="Delete">{I.trash(13)}</button>
          <button className="btn btn-ghost btn-sm" style={{ width: 26, padding: 0 }} onClick={onClose} title="Close">{I.x(13)}</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        {/* When */}
        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--muted-foreground)", marginTop: 2 }}>{I.refresh(15)}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {ev.allDay
                ? "Cả ngày"
                : `${ev.start} – ${ev.end}`}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>
              Thứ tư, 20 tháng 5, 2026 · GMT+09
            </div>
          </div>
        </div>

        {/* Where */}
        {ev.location && (
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 14 }}>
            <span style={{ color: "var(--muted-foreground)", marginTop: 2 }}>{I.globe(15)}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.location}</div>
              <a style={{ fontSize: 11.5, color: "var(--cal-accent)", textDecoration: "none" }}>Tham gia cuộc họp</a>
            </div>
          </div>
        )}

        {/* Attendees */}
        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--muted-foreground)", marginTop: 2 }}>{I.users(15)}</span>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>{ev.attendees.length} người tham dự · {ev.attendees.length} đã xác nhận</div>
            <div className="col" style={{ gap: 4 }}>
              {ev.attendees.map(pid => {
                const p = people.find(x => x.id === pid);
                if (!p) return null;
                const isMe = p.self;
                const isOrg = organizer.id === pid;
                return (
                  <div key={pid} className="row gap-2" style={{ padding: "2px 0" }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 99,
                      background: p.color, color: "white",
                      display: "grid", placeItems: "center",
                      fontSize: 10.5, fontWeight: 600,
                    }}>{p.short}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                        {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--muted-foreground)" }}>(bạn)</span>}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>
                        {isOrg ? "Người tổ chức · " : ""}{p.org}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: 10 }}><span className="dot"/>OK</span>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 6, padding: "0 6px", color: "var(--muted-foreground)", fontSize: 11 }}>
              {I.plus(12)} Thêm người
            </button>
          </div>
        </div>

        {/* Description */}
        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--muted-foreground)", marginTop: 2 }}>{I.doc(15)}</span>
          <div style={{ fontSize: 12.5, color: "var(--foreground)", lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>Demo onboarding flow mới cho Tempo VN — bao gồm:</p>
            <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
              <li>SSO setup &amp; SAML cert handover</li>
              <li>勤怠 import từ Misoca CSV</li>
              <li>Multi-tenant billing — câu hỏi của Kenji</li>
            </ul>
            <p style={{ margin: "10px 0 0", color: "var(--muted-foreground)", fontSize: 11.5 }}>📎 onboarding-tempo-v3.pdf · 1.2 MB</p>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--muted-foreground)", marginTop: 2 }}>{I.bell(15)}</span>
          <div className="col" style={{ gap: 4, fontSize: 12.5 }}>
            <div>30 phút trước · Push + Email</div>
            <div>10 phút trước · Push</div>
          </div>
        </div>
      </div>

      {/* Footer — RSVP */}
      <div style={{ padding: 14, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 6 }}>Bạn sẽ tham dự?</div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1, background: "var(--cal-accent)" }}>{I.check(13)} Có</button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Có thể</button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Không</button>
        </div>
      </div>
    </aside>
  );
}
window.EventDetail = EventDetail;

// ── Create-event modal ────────────────────────────────────────────────────
function CreateEventModal({ calendars }) {
  const [tab, setTab] = useS_x("event");
  const [title, setTitle] = useS_x("Demo onboarding · Tempo Vietnam");
  const [calId, setCalId] = useS_x("godx-prod");
  const [allDay, setAllDay] = useS_x(false);
  const cal = calendars.find(c => c.id === calId);

  return (
    <div style={{
      width: 880, maxWidth: "100%",
      background: "var(--card)",
      borderRadius: 12,
      border: "1px solid var(--border)",
      boxShadow: "0 24px 60px -20px rgba(0,0,0,.25), 0 8px 20px -10px rgba(0,0,0,.2)",
      overflow: "hidden",
      display: "grid", gridTemplateColumns: "1fr 280px",
      maxHeight: 640,
    }}>
      {/* Main column */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", minHeight: 0 }}>
        {/* Header */}
        <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: cal ? cal.color : "#1e50a2", flexShrink: 0 }}/>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              border: 0, outline: 0, background: "transparent",
              fontSize: 20, fontWeight: 500, padding: "0 0 14px",
              flex: 1, color: "var(--foreground)",
            }}
          />
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ padding: "0 20px" }}>
          {[
            { id: "event", label: "Sự kiện" },
            { id: "task", label: "Việc cần làm" },
            { id: "focus", label: "Focus time" },
            { id: "ooo", label: "Vắng mặt" },
          ].map(x => (
            <div key={x.id} className="tab" data-active={tab === x.id} onClick={() => setTab(x.id)}>{x.label}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {/* When */}
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--muted-foreground)" }}>{I.refresh(15)}</span>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <div className="input" style={{ width: 152 }}>Thứ tư, 20/5/2026</div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>từ</span>
              <div className="input" style={{ width: 92 }}>15:00</div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>đến</span>
              <div className="input" style={{ width: 92 }}>16:00</div>
              <label className="row gap-1" style={{ fontSize: 12, marginLeft: 6, color: "var(--muted-foreground)", cursor: "pointer" }}>
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}/>
                Cả ngày
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--muted-foreground)" }}>{I.refresh(14)}</span>
            <select className="input" style={{ width: 260 }} defaultValue="weekly">
              <option value="none">Không lặp lại</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần · thứ 4</option>
              <option value="biweekly">Mỗi 2 tuần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </div>

          {/* Where */}
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--muted-foreground)" }}>{I.globe(15)}</span>
            <div className="row gap-2" style={{ width: "100%" }}>
              <input className="input" placeholder="Thêm địa điểm hoặc URL" defaultValue="Zoom · 東京⇄HCM" style={{ flex: 1 }}/>
              <button className="btn btn-secondary btn-sm">{I.zap(13)} Tạo Meet</button>
            </div>
          </div>

          {/* Attendees */}
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 12 }}>
            <span style={{ color: "var(--muted-foreground)", marginTop: 6 }}>{I.users(15)}</span>
            <div>
              <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                {["yuki","kenji","satoshi"].map(pid => {
                  const p = window.CAL_DATA.PEOPLE.find(x => x.id === pid);
                  return (
                    <span key={pid} className="row gap-1" style={{
                      height: 26, padding: "0 4px 0 4px",
                      background: "var(--surface-2)",
                      borderRadius: 99, fontSize: 12,
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 99,
                        background: p.color, color: "white",
                        display: "grid", placeItems: "center",
                        fontSize: 9, fontWeight: 600,
                      }}>{p.short}</span>
                      <span style={{ paddingRight: 4 }}>{p.name}</span>
                      <button className="btn btn-ghost btn-sm" style={{ width: 16, height: 16, padding: 0 }}>{I.x(11)}</button>
                    </span>
                  );
                })}
                <input className="input" style={{ flex: 1, minWidth: 200, border: 0, background: "transparent" }} placeholder="Thêm người, tài nguyên…"/>
              </div>
              <div className="row gap-2" style={{ marginTop: 6, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: "auto", color: "var(--cal-accent)" }}>Tìm khung giờ</button>
                <span>·</span>
                <span>3 người · tất cả đều rảnh</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, marginBottom: 12 }}>
            <span style={{ color: "var(--muted-foreground)", marginTop: 6 }}>{I.doc(15)}</span>
            <textarea className="input" style={{ height: 92, padding: 10, resize: "none", fontFamily: "var(--font-sans-jp)" }}
              defaultValue="Onboarding kick-off cho Tempo Vietnam — SSO + 勤怠 import + billing setup."/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Chi tiết khác…</button>
          <div className="ml-auto row gap-2">
            <button className="btn btn-secondary btn-sm">Huỷ</button>
            <button className="btn btn-primary btn-sm" style={{ background: "var(--cal-accent)" }}>Lưu sự kiện</button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, background: "var(--surface-2)" }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Lưu vào lịch</div>
          <select className="input" style={{ width: "100%" }} value={calId} onChange={(e) => setCalId(e.target.value)}>
            {calendars.filter(c => !c.readonly).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Hiển thị là</div>
          <div className="row gap-1">
            {[
              { v: "busy", label: "Bận", color: "var(--cal-accent)" },
              { v: "free", label: "Rảnh", color: "var(--surface-3)" },
            ].map(x => (
              <button key={x.v} className="btn btn-secondary btn-sm" style={{
                flex: 1,
                background: x.v === "busy" ? "color-mix(in oklch, var(--cal-accent) 14%, transparent)" : "var(--surface-3)",
                borderColor: x.v === "busy" ? "var(--cal-accent)" : "var(--border)",
                color: x.v === "busy" ? "var(--cal-accent)" : "var(--foreground)",
              }}>{x.label}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Thông báo</div>
          <div className="col" style={{ gap: 4, fontSize: 12 }}>
            <div className="row gap-2"><span className="badge badge-info"><span className="dot"/>10p</span><span>Push + Email</span></div>
            <div className="row gap-2"><span className="badge badge-info"><span className="dot"/>1h</span><span>Push</span></div>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 22, fontSize: 11, color: "var(--cal-accent)", justifyContent: "flex-start" }}>{I.plus(11)} Thêm thông báo</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Quyền của khách mời</div>
          <div className="col" style={{ gap: 6, fontSize: 12 }}>
            <label className="row gap-2"><input type="checkbox" defaultChecked/> Sửa sự kiện</label>
            <label className="row gap-2"><input type="checkbox" defaultChecked/> Mời người khác</label>
            <label className="row gap-2"><input type="checkbox" defaultChecked/> Xem danh sách khách</label>
          </div>
        </div>

        <div style={{ marginTop: "auto", padding: 10, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: cal ? cal.color : "#1e50a2" }}/>
            <span style={{ fontSize: 11.5, fontWeight: 500 }}>{cal ? cal.name : "—"}</span>
          </div>
          <p style={{ margin: 0, fontSize: 10.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            Sự kiện này sẽ hiển thị cho tất cả thành viên trong <b>{cal ? cal.name : ""}</b>. Đặt lịch ở "Cá nhân" nếu bạn muốn riêng tư.
          </p>
        </div>
      </div>
    </div>
  );
}
window.CreateEventModal = CreateEventModal;

// ── Find-a-time / scheduling grid ─────────────────────────────────────────
function FindATime() {
  const slots = 18; // 9:00 → 18:00 in 30-min slots
  const people = ["yuki","ha","minh","satoshi","linh","kenji","amy"];
  const avail = window.CAL_DATA.AVAILABILITY;
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  const [chosen, setChosen] = useS_x([10, 12]); // slot range — 14:00 to 15:00

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--card)",
      display: "flex", flexDirection: "column",
      borderRadius: 12, overflow: "hidden",
      border: "1px solid var(--border)",
    }}>
      <header style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Tìm khung giờ</h2>
          <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>Thứ tư · 20/5/2026 · GMT+09</div>
        </div>
        <div className="row gap-1" style={{ marginLeft: 6 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 26, padding: 0 }}>{I.chevronLeft(14)}</button>
          <button className="btn btn-ghost btn-sm" style={{ width: 26, padding: 0 }}>{I.chevronRight(14)}</button>
        </div>
        <span className="badge badge-info" style={{ marginLeft: 4 }}><span className="dot"/>{people.length} người</span>
        <span className="badge badge-neutral"><span className="dot"/>30 phút</span>
        <div className="ml-auto row gap-2">
          <button className="btn btn-secondary btn-sm">Mở rộng giờ làm việc</button>
          <button className="btn btn-primary btn-sm" style={{ background: "var(--cal-accent)" }}>Áp dụng khung giờ</button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", minWidth: 800 }}>
          {/* Hour header */}
          <div style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "8px 12px", fontSize: 11, color: "var(--muted-foreground)" }}>
            Người tham dự
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${slots}, 1fr)`, borderBottom: "1px solid var(--border)", position: "relative" }}>
            {hours.map((h, i) => (
              <div key={h} style={{
                gridColumn: `span 2`,
                padding: "8px 0 6px", paddingLeft: 6,
                fontSize: 10.5, color: "var(--muted-foreground)",
                borderRight: i === hours.length - 1 ? "none" : "1px solid color-mix(in oklch, var(--border) 70%, transparent)",
                fontVariantNumeric: "tabular-nums",
              }}>{String(h).padStart(2,"0")}:00</div>
            ))}
          </div>

          {/* Person rows */}
          {people.map(pid => {
            const p = window.CAL_DATA.PEOPLE.find(x => x.id === pid);
            const row = avail[pid] || Array(slots).fill(0);
            return (
              <React.Fragment key={pid}>
                <div style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 99,
                    background: p.color, color: "white",
                    display: "grid", placeItems: "center",
                    fontSize: 10, fontWeight: 600,
                  }}>{p.short}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}
                      {p.self && <span style={{ marginLeft: 4, color: "var(--muted-foreground)", fontSize: 10 }}>(bạn)</span>}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{p.org} · {p.role}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${slots}, 1fr)`, position: "relative", borderBottom: "1px solid var(--border)", minHeight: 42 }}>
                  {row.map((v, i) => (
                    <div key={i} style={{
                      borderRight: i === slots - 1 ? "none" : "1px solid color-mix(in oklch, var(--border) 60%, transparent)",
                      background: v === 2
                        ? "color-mix(in oklch, var(--wa-akane) 22%, transparent)"
                        : v === 1
                        ? "repeating-linear-gradient(135deg, color-mix(in oklch, var(--wa-yamabuki) 35%, transparent) 0 4px, transparent 4px 8px)"
                        : "transparent",
                    }}/>
                  ))}
                  {/* Chosen-time overlay */}
                  <div style={{
                    position: "absolute",
                    top: 2, bottom: 2,
                    left: `${(chosen[0] / slots) * 100}%`,
                    width: `${((chosen[1] - chosen[0]) / slots) * 100}%`,
                    border: "2px solid var(--cal-accent)",
                    background: "color-mix(in oklch, var(--cal-accent) 8%, transparent)",
                    borderRadius: 4,
                    pointerEvents: "none",
                  }}/>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Suggested slots */}
        <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            ☆ Gợi ý — khung giờ tất cả đều rảnh
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "14:00 – 14:30", who: "7 người" },
              { label: "14:00 – 15:00", who: "7 người", best: true },
              { label: "16:30 – 17:00", who: "7 người" },
              { label: "Mai · 10:00", who: "6 người" },
              { label: "Mai · 13:00", who: "7 người" },
              { label: "Thứ 6 · 15:00", who: "7 người" },
            ].map((s, i) => (
              <button key={i} onClick={() => setChosen(i === 1 ? [10, 12] : [10, 11])} style={{
                all: "unset", cursor: "pointer",
                padding: "8px 12px",
                background: s.best ? "color-mix(in oklch, var(--cal-accent) 12%, var(--background))" : "var(--background)",
                border: `1px solid ${s.best ? "var(--cal-accent)" : "var(--border)"}`,
                borderRadius: 8,
                display: "flex", flexDirection: "column", gap: 2,
                minWidth: 130,
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: s.best ? "var(--cal-accent)" : "var(--foreground)" }}>{s.label}</span>
                <span style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>{s.who}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <footer style={{ padding: "8px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center", fontSize: 11, color: "var(--muted-foreground)" }}>
        <div className="row gap-2"><span style={{ width: 12, height: 12, borderRadius: 3, background: "color-mix(in oklch, var(--wa-akane) 22%, transparent)" }}/> Bận</div>
        <div className="row gap-2"><span style={{ width: 12, height: 12, borderRadius: 3, background: "repeating-linear-gradient(135deg, color-mix(in oklch, var(--wa-yamabuki) 35%, transparent) 0 3px, transparent 3px 6px)" }}/> Tạm thời</div>
        <div className="row gap-2"><span style={{ width: 12, height: 12, borderRadius: 3, background: "transparent", border: "1px dashed var(--border)" }}/> Rảnh</div>
        <span className="ml-auto">9:00 → 18:00 · giờ làm việc</span>
      </footer>
    </div>
  );
}
window.FindATime = FindATime;
