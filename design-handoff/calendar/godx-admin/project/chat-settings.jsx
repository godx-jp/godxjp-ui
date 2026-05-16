/* global React, I, Icon, CI, UserAvatar, CHAT_CHANNELS */
/* Chat notification settings page */

const { useState: useStateSet } = React;

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange && onChange(!checked)} style={{
      width: 36, height: 20, borderRadius: 99,
      border: 0, padding: 2,
      background: checked ? "var(--primary)" : "var(--surface-3)",
      cursor: "pointer", display: "flex",
      transition: "background 120ms",
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: 99,
        background: "#fff",
        transform: `translateX(${checked ? 16 : 0}px)`,
        transition: "transform 120ms cubic-bezier(.2,.7,.3,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}/>
    </button>
  );
}

function Row({ label, hint, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--foreground)" }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 2, lineHeight: 1.55 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>{children}</div>
    </div>
  );
}

function SegRadio({ value, onChange, options }) {
  return (
    <div style={{
      display: "inline-flex", padding: 2,
      background: "var(--surface-3)", borderRadius: 6,
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: "4px 10px", border: 0, borderRadius: 4,
          background: value === o.value ? "var(--background)" : "transparent",
          color: value === o.value ? "var(--foreground)" : "var(--muted-foreground)",
          fontSize: 11.5, fontWeight: 500, cursor: "pointer",
          boxShadow: value === o.value ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function ChatSettings() {
  const [s, setS] = useStateSet({
    notify: "mention",          // all | mention | nothing
    dnd: false,
    sound: true,
    desktop: true,
    mobilePush: true,
    email: false,
    badge: true,
    keywords: ["godx", "release"],
    threadFollow: "starts",
    schedule: "9-18",
  });
  const upd = (k, v) => setS({ ...s, [k]: v });

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      background: "var(--surface-2)",
    }}>
      <div style={{
        maxWidth: 760, margin: "0 auto",
        padding: "28px 24px 40px",
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Godx Chat · Settings</div>
          <h1 style={{ margin: "4px 0 6px", fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>Thông báo · 通知</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
            Điều chỉnh khi nào và bằng cách nào bạn nhận được tin nhắn. Cài đặt này áp dụng cho workspace hiện tại.
          </p>
        </div>

        {/* Quick DND banner */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 16px", marginBottom: 20,
          border: "1px solid var(--border)", borderRadius: 10,
          background: s.dnd ? "color-mix(in oklch, var(--warning) 10%, var(--card))" : "var(--card)",
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: s.dnd ? "color-mix(in oklch, var(--warning) 20%, transparent)" : "var(--surface-3)",
            color: s.dnd ? "var(--warning)" : "var(--muted-foreground)",
            display: "grid", placeItems: "center",
          }}>{s.dnd ? CI.bellOff(17) : CI.bell(17)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {s.dnd ? "Đang bật Không làm phiền" : "Trạng thái: Đang nhận thông báo"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {s.dnd ? "Sẽ tự tắt lúc 8:00 sáng mai" : "Bấm để tạm dừng 30 phút, 1 giờ, hoặc đến sáng mai"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "30 phút", val: false },
              { label: "1 giờ", val: false },
              { label: "Đến sáng", val: true },
            ].map((b, i) => (
              <button key={i} onClick={() => upd("dnd", b.val)} style={{
                padding: "5px 10px", border: "1px solid var(--border)", borderRadius: 6,
                background: "var(--card)", color: "var(--foreground)",
                fontSize: 11.5, fontWeight: 500, cursor: "pointer",
              }}>{b.label}</button>
            ))}
          </div>
        </div>

        {/* Section: who can notify */}
        <SettingsCard title="Khi nào báo tin nhắn mới" jp="新着の通知">
          <Row label="Mức độ thông báo" hint="Bạn muốn được báo cho tin nhắn nào?">
            <SegRadio value={s.notify} onChange={v => upd("notify", v)} options={[
              { value: "all", label: "Tất cả" },
              { value: "mention", label: "Mention" },
              { value: "nothing", label: "Không" },
            ]}/>
          </Row>
          <Row label="Theo dõi thread tự động"
               hint="Thread nào sẽ tự xuất hiện ở Threads inbox?">
            <SegRadio value={s.threadFollow} onChange={v => upd("threadFollow", v)} options={[
              { value: "starts", label: "Tôi bắt đầu" },
              { value: "reply",  label: "Tôi reply" },
              { value: "all",    label: "Mọi thread" },
            ]}/>
          </Row>
          <Row label="Từ khoá quan tâm" hint="Nhận thông báo khi tin nhắn chứa các từ này (không phân biệt hoa thường).">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 280, justifyContent: "flex-end" }}>
              {s.keywords.map(k => (
                <span key={k} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 4px 2px 8px",
                  background: "var(--surface-3)", borderRadius: 4,
                  fontSize: 11.5, fontWeight: 500,
                }}>
                  {k}
                  <button style={{
                    width: 18, height: 18, border: 0, borderRadius: 3,
                    background: "transparent", color: "var(--muted-foreground)", cursor: "pointer",
                    display: "grid", placeItems: "center",
                  }}>{CI.x(11)}</button>
                </span>
              ))}
              <button style={{
                padding: "2px 6px", border: "1px dashed var(--border)", borderRadius: 4,
                background: "transparent", color: "var(--muted-foreground)",
                fontSize: 11, cursor: "pointer",
              }}>+ thêm</button>
            </div>
          </Row>
        </SettingsCard>

        {/* Section: channels */}
        <SettingsCard title="Kênh & DM" jp="チャンネル別">
          <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", paddingBottom: 6 }}>
            Override mặc định cho từng kênh.
          </div>
          {CHAT_CHANNELS.godx.slice(0, 5).map(c => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 6,
                background: "var(--surface-3)", color: "var(--foreground)",
                display: "grid", placeItems: "center",
              }}>{c.priv ? CI.lock(12) : CI.hash(12)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.priv ? "" : "#"}{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{c.topic}</div>
              </div>
              <SegRadio
                value={c.muted ? "nothing" : (c.unread > 0 ? "all" : "mention")}
                onChange={() => {}}
                options={[
                  { value: "all", label: "All" },
                  { value: "mention", label: "@" },
                  { value: "nothing", label: "Off" },
                ]}
              />
            </div>
          ))}
        </SettingsCard>

        {/* Section: channels */}
        <SettingsCard title="Phương thức nhận" jp="配信方法">
          <Row label="Desktop / Web" hint="Hiện thông báo bật lên trên trình duyệt khi đang đăng nhập.">
            <Toggle checked={s.desktop} onChange={v => upd("desktop", v)}/>
          </Row>
          <Row label="Mobile push" hint="Gửi thông báo đến app di động — yêu cầu đã cài Godx app.">
            <Toggle checked={s.mobilePush} onChange={v => upd("mobilePush", v)}/>
          </Row>
          <Row label="Âm thanh" hint="Phát âm thanh khi có tin nhắn cần chú ý.">
            <Toggle checked={s.sound} onChange={v => upd("sound", v)}/>
          </Row>
          <Row label="Badge đếm số chưa đọc" hint="Hiển thị số tin chưa đọc trên float button & favicon.">
            <Toggle checked={s.badge} onChange={v => upd("badge", v)}/>
          </Row>
          <Row label="Email tóm tắt" hint="Gửi email mỗi sáng các mention bạn bỏ lỡ ngày hôm trước.">
            <Toggle checked={s.email} onChange={v => upd("email", v)}/>
          </Row>
        </SettingsCard>

        {/* Section: schedule */}
        <SettingsCard title="Lịch nhận thông báo" jp="通知スケジュール">
          <Row label="Khung giờ" hint="Ngoài khung này, push & desktop sẽ tự im lặng.">
            <SegRadio value={s.schedule} onChange={v => upd("schedule", v)} options={[
              { value: "always", label: "24/7" },
              { value: "9-18",   label: "9:00–18:00" },
              { value: "custom", label: "Tuỳ chỉnh" },
            ]}/>
          </Row>
          <Row label="Múi giờ" hint="Lịch trên dựa theo múi giờ này.">
            <select style={{
              height: 28, padding: "0 10px",
              border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--card)", color: "var(--foreground)",
              fontSize: 12, fontFamily: "inherit",
            }}>
              <option>Asia/Tokyo (UTC+9)</option>
              <option>Asia/Ho_Chi_Minh (UTC+7)</option>
            </select>
          </Row>
          <Row label="Lặp lại" hint="Áp dụng giờ làm việc cho các ngày nào.">
            <div style={{ display: "flex", gap: 4 }}>
              {["T2","T3","T4","T5","T6","T7","CN"].map((d, i) => (
                <button key={i} style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: i < 5 ? "var(--primary)" : "var(--card)",
                  color: i < 5 ? "var(--primary-foreground)" : "var(--foreground)",
                  fontSize: 11, fontWeight: 500, cursor: "pointer",
                }}>{d}</button>
              ))}
            </div>
          </Row>
        </SettingsCard>

        {/* Bottom actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button style={{
            height: 32, padding: "0 14px",
            border: "1px solid var(--border)", borderRadius: 6,
            background: "var(--card)", color: "var(--foreground)",
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          }}>Đặt lại mặc định</button>
          <button style={{
            height: 32, padding: "0 14px",
            border: 0, borderRadius: 6,
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          }}>Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}
window.ChatSettings = ChatSettings;

function SettingsCard({ title, jp, children }) {
  return (
    <section style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "4px 18px 6px",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 8,
        padding: "14px 0 8px",
        borderBottom: "1px solid var(--border)",
      }}>
        <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{title}</h3>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>· {jp}</span>
      </div>
      {children}
    </section>
  );
}
