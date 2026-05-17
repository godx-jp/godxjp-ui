/* global React, I, Icon, U, CI, UserAvatar, MINI_RECENT */
/* Floating chat plugin — bubble + mini popup. Lives on tenant pages. */

const { useState: useStatePlugin } = React;

// ── Mini popup row ──────────────────────────────────────────────────
function MiniRow({ item, onClick }) {
  let label, icon, sub;
  if (item.kind === "channel") {
    const Ic = item.priv ? CI.lock : CI.hash;
    icon = (
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: "var(--surface-3)", color: "var(--foreground)",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>{Ic(15)}</span>
    );
    label = item.name;
    sub = item.lastUser ? `${U[item.lastUser].short}: ${item.last}` : item.last;
  } else if (item.kind === "dm") {
    const u = U[item.userId];
    icon = <UserAvatar id={u.id} size={32}/>;
    label = u.name;
    sub = item.last;
  } else {
    icon = (
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: "var(--surface-3)", display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <span style={{ display: "inline-flex" }}>
          {item.userIds.slice(0, 2).map((uid, i) => (
            <span key={uid} style={{ marginLeft: i === 0 ? 0 : -5, borderRadius: 4, border: "1.5px solid var(--surface-3)", lineHeight: 0 }}>
              <UserAvatar id={uid} size={16}/>
            </span>
          ))}
        </span>
      </span>
    );
    label = item.groupName;
    sub = item.last;
  }

  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      width: "100%", padding: "10px 14px",
      border: 0, background: "transparent",
      borderBottom: "1px solid var(--border)",
      cursor: "pointer", textAlign: "left",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
    onMouseLeave={e => e.currentTarget.style.background = ""}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: item.unread > 0 ? 600 : 500,
            color: "var(--foreground)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{label}</span>
          <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", marginLeft: "auto", flexShrink: 0 }}>{item.ts}</span>
        </div>
        <div style={{
          fontSize: 12, color: item.unread > 0 ? "var(--foreground)" : "var(--muted-foreground)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginTop: 1,
        }}>{sub}</div>
      </div>
      {item.unread > 0 && (
        <span style={{
          minWidth: 18, height: 18, padding: "0 6px",
          background: "var(--error)", color: "#fff",
          borderRadius: 99, fontSize: 10.5, fontWeight: 700,
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>{item.unread}</span>
      )}
    </button>
  );
}

// ── Mini popup (window-style) ───────────────────────────────────────
function MiniPopup({ onClose, style, position, density }) {
  const [tab, setTab] = useStatePlugin("recent"); // recent | dm | mention
  const [q, setQ] = useStatePlugin("");
  const items = MINI_RECENT.filter(it => {
    if (q) {
      const s = (it.name || it.groupName || (it.userId && U[it.userId].name) || "").toLowerCase();
      if (!s.includes(q.toLowerCase()) && !it.last.toLowerCase().includes(q.toLowerCase())) return false;
    }
    if (tab === "dm" && it.kind !== "dm" && it.kind !== "group") return false;
    return true;
  });
  const totalUnread = MINI_RECENT.reduce((s,it) => s + (it.unread || 0), 0);

  // Position from float button anchor
  const pos = position || "br";
  const isRight = pos === "br" || pos === "tr";
  const isBottom = pos === "br" || pos === "bl";

  // Variant: window (default), drawer, fullscreen
  let containerStyle;
  if (style === "drawer") {
    containerStyle = {
      position: "absolute",
      top: 0, bottom: 0,
      [isRight ? "right" : "left"]: 0,
      width: 420,
      borderRadius: 0,
      borderLeft: isRight ? "1px solid var(--border)" : 0,
      borderRight: !isRight ? "1px solid var(--border)" : 0,
      boxShadow: isRight ? "-12px 0 32px -8px rgba(0,0,0,0.15)" : "12px 0 32px -8px rgba(0,0,0,0.15)",
    };
  } else if (style === "fullscreen") {
    containerStyle = {
      position: "absolute", inset: 0,
      borderRadius: 0, border: 0,
    };
  } else {
    // window
    containerStyle = {
      position: "absolute",
      [isBottom ? "bottom" : "top"]: 84,
      [isRight ? "right" : "left"]: 24,
      width: 400, height: 560,
      borderRadius: 14,
      boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--border)",
    };
  }

  return (
    <div style={{
      ...containerStyle,
      background: "var(--popover)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      animation: "popIn 180ms cubic-bezier(.2,.7,.3,1)",
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
        flexShrink: 0, background: "var(--background)",
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: "var(--foreground)", color: "var(--background)",
          display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, letterSpacing: 0.3,
        }}>gx</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600 }}>
            Godx Chat
            <span style={{ fontSize: 9, fontWeight: 500, padding: "1px 5px", borderRadius: 3, background: "var(--surface-3)", color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>PLUGIN</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--success)" }}/>
            {totalUnread} chưa đọc · {MINI_RECENT.length} hội thoại
          </div>
        </div>
        <a href="chat.html" title="Mở trang chat" style={{
          width: 28, height: 28, border: "1px solid var(--border)", borderRadius: 6,
          background: "var(--card)", color: "var(--foreground)",
          display: "grid", placeItems: "center", cursor: "pointer",
          textDecoration: "none",
        }}>{I.external(13)}</a>
        <button onClick={onClose} title="Close" style={{
          width: 28, height: 28, border: 0, background: "transparent",
          color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 6,
        }}>{CI.x(14)}</button>
      </div>

      {/* Search + Tabs */}
      <div style={{ padding: "10px 14px 0", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 10px", height: 30,
          border: "1px solid var(--border)", borderRadius: 6,
          background: "var(--input-background)",
        }}>
          <span style={{ color: "var(--muted-foreground)" }}>{I.search(13)}</span>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Tìm người, kênh, tin nhắn…"
            style={{
              flex: 1, border: 0, outline: 0, background: "transparent",
              fontSize: 12.5, color: "var(--foreground)", fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <div style={{
        display: "flex", gap: 1, padding: "10px 14px 0", flexShrink: 0,
      }}>
        {[
          { id: "recent",  label: "Gần đây", count: MINI_RECENT.length },
          { id: "dm",      label: "DM", count: MINI_RECENT.filter(i => i.kind === "dm" || i.kind === "group").length },
          { id: "mention", label: "Mention", count: 3 },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: "5px 10px", border: 0, background: "transparent",
            fontSize: 12, fontWeight: tab === tb.id ? 600 : 500,
            color: tab === tb.id ? "var(--foreground)" : "var(--muted-foreground)",
            borderBottom: "2px solid " + (tab === tb.id ? "var(--primary)" : "transparent"),
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            {tb.label}
            <span style={{
              fontSize: 10, padding: "0 5px", borderRadius: 99,
              background: "var(--surface-3)", color: "var(--muted-foreground)",
            }}>{tb.count}</span>
          </button>
        ))}
        <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}/>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 12 }}>
            Không có kết quả cho "{q}"
          </div>
        ) : items.map(it => <MiniRow key={it.id} item={it}/>)}
      </div>

      {/* Footer — quick compose */}
      <div style={{
        padding: "8px 12px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-2)",
        flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
      }}>
        <button style={{
          height: 28, padding: "0 10px",
          border: "1px solid var(--border)", borderRadius: 6,
          background: "var(--card)", color: "var(--foreground)",
          fontSize: 11.5, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
        }}>{I.pencil(12)} Soạn mới</button>
        <button style={{
          height: 28, padding: "0 10px",
          border: "1px solid var(--border)", borderRadius: 6,
          background: "var(--card)", color: "var(--foreground)",
          fontSize: 11.5, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
        }}>{CI.hash(12)} Kênh mới</button>
        <div style={{ flex: 1 }}/>
        <a href="chat.html" style={{
          fontSize: 11, color: "var(--primary)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>Mở trang đầy đủ {I.external(11)}</a>
      </div>
    </div>
  );
}
window.MiniPopup = MiniPopup;

// ── Float button (with badge) ───────────────────────────────────────
function FloatButton({ unread, onClick, open, position, pulse }) {
  const pos = position || "br";
  const offsetStyle = {
    br: { right: 24, bottom: 24 },
    bl: { left: 24,  bottom: 24 },
    tr: { right: 24, top: 24 },
    tl: { left: 24,  top: 24 },
  }[pos];
  return (
    <button
      onClick={onClick}
      title="Godx Chat"
      style={{
        position: "absolute",
        ...offsetStyle,
        width: 56, height: 56, borderRadius: 16,
        border: 0,
        background: open ? "var(--foreground)" : "var(--brand)",
        color: open ? "var(--background)" : "#fff",
        boxShadow: "0 8px 24px -4px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)",
        display: "grid", placeItems: "center", cursor: "pointer",
        transition: "transform 180ms cubic-bezier(.2,.7,.3,1), background 180ms",
        transform: open ? "scale(0.94)" : "scale(1)",
        zIndex: 51,
      }}
      onMouseEnter={e => { if (!open) e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.transform = "scale(1)"; }}
    >
      {open ? CI.x(22) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-3.6 7c-1.4 1-3.2 1.5-5 1.5-1 0-1.9-.1-2.8-.4l-4.6 1 1.2-3.7A8.4 8.4 0 0 1 3 11.5C3 6.8 7 3 12 3s9 3.8 9 8.5z"/>
          <circle cx="9" cy="11.5" r="0.8" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="11.5" r="0.8" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="11.5" r="0.8" fill="currentColor" stroke="none"/>
        </svg>
      )}
      {!open && unread > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          minWidth: 22, height: 22, padding: "0 6px",
          background: "var(--error)", color: "#fff",
          borderRadius: 99, fontSize: 11, fontWeight: 700,
          display: "grid", placeItems: "center",
          boxShadow: "0 0 0 3px var(--background)",
          animation: pulse ? "badgePulse 1.8s ease-in-out infinite" : "none",
          fontVariantNumeric: "tabular-nums",
        }}>{unread > 99 ? "99+" : unread}</span>
      )}
    </button>
  );
}
window.FloatButton = FloatButton;

// ── Plugin overlay container ───────────────────────────────────────
function ChatPlugin({ unread = 11, position = "br", popupStyle = "window", pulse = true, initialOpen = false }) {
  const [open, setOpen] = useStatePlugin(initialOpen);
  return (
    <>
      <FloatButton unread={unread} open={open} position={position} pulse={pulse} onClick={() => setOpen(!open)}/>
      {open && <MiniPopup onClose={() => setOpen(false)} style={popupStyle} position={position}/>}
    </>
  );
}
window.ChatPlugin = ChatPlugin;
