/* global React, I, Icon, Badge, Avatar, cx, U, CHAT_USERS, CHAT_WORKSPACES, CHAT_CHANNELS, CHAT_DMS, CHAT_MESSAGES, CHAT_THREAD */
/* Chat — full workspace page. Original design (NOT Slack). */

const { useState: useStateChat, useMemo: useMemoChat } = React;

// ── Chat-specific icons ─────────────────────────────────────────────
const CI = {
  send:        (s=16) => <Icon size={s} d={<><path d="M3 12l18-9-7 19-3-8z"/><path d="M3 12l8 3"/></>} />,
  hash:        (s=16) => I.hash(s),
  lock:        (s=16) => <Icon size={s} d={<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>} />,
  bell:        (s=16) => I.bell(s),
  bellOff:     (s=16) => <Icon size={s} d={<><path d="M6 8a6 6 0 0 1 9.7-4.7"/><path d="M18 8c0 5 2 6 2 6H8"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M3 3l18 18"/></>} />,
  reply:       (s=16) => <Icon size={s} d={<><path d="M9 17l-5-5 5-5"/><path d="M4 12h10a6 6 0 0 1 6 6v2"/></>} />,
  smile:       (s=16) => <Icon size={s} d={<><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="0.6" fill="currentColor"/><circle cx="15" cy="10" r="0.6" fill="currentColor"/></>} />,
  plus:        (s=16) => I.plus(s),
  paperclip:   (s=16) => <Icon size={s} d="M21 12.6l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8.5-8.5" />,
  at:          (s=16) => <Icon size={s} d={<><circle cx="12" cy="12" r="4"/><path d="M16 8v5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5 8"/></>} />,
  bold:        (s=16) => <Icon size={s} d={<><path d="M6 4h7a4 4 0 0 1 0 8H6z"/><path d="M6 12h8a4 4 0 0 1 0 8H6z"/></>} />,
  italic:      (s=16) => <Icon size={s} d="M10 4h8M6 20h8M14 4l-4 16" />,
  link:        (s=16) => I.link(s),
  list:        (s=16) => <Icon size={s} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  code:        (s=16) => I.code(s),
  more:        (s=16) => I.more(s),
  pin:         (s=16) => I.pin(s),
  bookmark:    (s=16) => <Icon size={s} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  phone:       (s=16) => <Icon size={s} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" />,
  video:       (s=16) => <Icon size={s} d={<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></>} />,
  thread:      (s=16) => <Icon size={s} d={<><path d="M5 5h14v10H8l-3 3z"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="12" cy="10" r="0.8" fill="currentColor"/><circle cx="15" cy="10" r="0.8" fill="currentColor"/></>} />,
  star:        (s=16) => <Icon size={s} d="M12 3l2.6 5.5 6 .9-4.3 4.2 1 6L12 17l-5.3 2.6 1-6L3.4 9.4l6-.9z" />,
  download:    (s=16) => I.download(s),
  chevronDown: (s=16) => I.chevronDown(s),
  inbox:       (s=16) => <Icon size={s} d={<><path d="M3 14h5l2 3h4l2-3h5"/><path d="M3 14L6 4h12l3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>} />,
  zap:         (s=16) => I.zap(s),
  x:           (s=16) => I.x(s),
};
window.CI = CI;

// ── User avatar (colored monogram) ──────────────────────────────────
function UserAvatar({ id, size = 32, status }) {
  const u = (typeof id === "string" ? U[id] : id) || U.me;
  const initials = u.short ? u.short.slice(0, 2).toUpperCase() : (u.name || "?").slice(0, 2);
  const STATUS_COLOR = { active: "var(--success)", away: "var(--warning)", dnd: "var(--error)", offline: "var(--muted-foreground)" };
  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <span style={{
        width: size, height: size, borderRadius: 8,
        background: u.color, color: "#fff",
        display: "grid", placeItems: "center",
        fontWeight: 600, fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: 0.2,
      }}>{initials}</span>
      {(status || u.status) && (
        <span style={{
          position: "absolute", right: -2, bottom: -2,
          width: Math.max(8, size * 0.3), height: Math.max(8, size * 0.3),
          borderRadius: 99, background: STATUS_COLOR[status || u.status],
          boxShadow: "0 0 0 2px var(--background)",
        }}/>
      )}
    </span>
  );
}
window.UserAvatar = UserAvatar;

// ── Workspace rail (left, 60px) ─────────────────────────────────────
function WorkspaceRail({ activeId, onPick }) {
  return (
    <aside style={{
      width: 60, background: "var(--surface-2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "10px 0", gap: 4,
      flexShrink: 0,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "var(--foreground)", color: "var(--background)",
        display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14,
        marginBottom: 6, letterSpacing: 0.5,
      }} title="Godx Chat">gx</div>
      <hr style={{ width: 24, border: 0, borderTop: "1px solid var(--border)", margin: "2px 0 6px" }}/>
      {CHAT_WORKSPACES.map(w => (
        <button key={w.id}
          onClick={() => onPick && onPick(w.id)}
          title={w.label}
          style={{
            width: 40, height: 40, position: "relative",
            border: 0, padding: 0, background: "transparent",
            display: "grid", placeItems: "center",
            cursor: "pointer", borderRadius: 10,
          }}>
          <span style={{
            position: "absolute", left: -10, top: 6, bottom: 6, width: 3,
            borderRadius: 99,
            background: activeId === w.id ? "var(--foreground)" : "transparent",
            transition: "background 120ms",
          }}/>
          <span style={{
            width: 36, height: 36, borderRadius: activeId === w.id ? 10 : 18,
            background: w.color, color: "#fff",
            display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13,
            transition: "border-radius 180ms cubic-bezier(.2,.7,.3,1)",
            letterSpacing: 0.3,
          }}>{w.name.slice(0, 2).toUpperCase()}</span>
          {w.unread > 0 && (
            <span style={{
              position: "absolute", top: -2, right: -2,
              minWidth: 16, height: 16, padding: "0 4px",
              background: "var(--error)", color: "#fff",
              borderRadius: 99, fontSize: 9, fontWeight: 700,
              display: "grid", placeItems: "center",
              boxShadow: "0 0 0 2px var(--surface-2)",
            }}>{w.unread > 99 ? "99+" : w.unread}</span>
          )}
        </button>
      ))}
      <button title="Add workspace" style={{
        marginTop: 4, width: 40, height: 40, borderRadius: 10,
        border: "1px dashed var(--border)", background: "transparent",
        color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer",
      }}>{I.plus(16)}</button>
      <div style={{ flex: 1 }}/>
      <button title="Settings" style={{
        width: 36, height: 36, borderRadius: 10, border: 0,
        background: "transparent", color: "var(--muted-foreground)",
        display: "grid", placeItems: "center", cursor: "pointer",
      }}>{I.settings(18)}</button>
    </aside>
  );
}
window.WorkspaceRail = WorkspaceRail;

// ── Channel sidebar (280px) ─────────────────────────────────────────
function ChannelSidebar({ workspaceId, activeChannelId, onPick, density }) {
  const channels = CHAT_CHANNELS[workspaceId] || [];
  const dms      = CHAT_DMS[workspaceId] || [];
  const ws       = CHAT_WORKSPACES.find(w => w.id === workspaceId);
  const [openSec, setOpenSec] = useStateChat({ channels: true, dms: true, apps: true });
  const itemH = density === "compact" ? 26 : density === "comfortable" ? 36 : 30;

  const totalUnread = channels.reduce((s,c)=>s+c.unread,0) + dms.reduce((s,d)=>s+d.unread,0);

  return (
    <aside style={{
      width: 280, background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
    }}>
      {/* Workspace header */}
      <div style={{
        padding: "12px 14px", borderBottom: "1px solid var(--sidebar-border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
            <span>{ws ? ws.label : "Workspace"}</span>
            <I.chevronDown size={12}/>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--success)" }}/>
            8 đang hoạt động · {totalUnread} chưa đọc
          </div>
        </div>
        <button title="New message" style={{
          width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
          background: "var(--card)", color: "var(--foreground)", display: "grid", placeItems: "center", cursor: "pointer",
        }}>{I.pencil(14)}</button>
      </div>

      {/* Quick filters */}
      <nav style={{ padding: "8px 8px 4px", display: "flex", flexDirection: "column", gap: 1 }}>
        {[
          { id: "f-unread",   icon: CI.inbox,    label: "Chưa đọc",    badge: totalUnread || null },
          { id: "f-mention",  icon: CI.at,       label: "Mention",     badge: 3 },
          { id: "f-thread",   icon: CI.thread,   label: "Threads",     badge: 2 },
          { id: "f-saved",    icon: CI.bookmark, label: "Đã lưu",      badge: null },
          { id: "f-drafts",   icon: I.pencil,    label: "Drafts · 下書き", badge: 1 },
        ].map(f => (
          <button key={f.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            height: itemH, padding: "0 10px",
            border: 0, background: "transparent",
            color: "var(--sidebar-fg)", fontSize: 13, cursor: "pointer",
            borderRadius: 6, textAlign: "left",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
          onMouseLeave={e => e.currentTarget.style.background = ""}>
            <span style={{ color: "var(--muted-foreground)" }}>{f.icon(15)}</span>
            <span style={{ flex: 1 }}>{f.label}</span>
            {f.badge && <span style={{
              fontSize: 10, fontWeight: 600,
              padding: "1px 6px", borderRadius: 99,
              background: "var(--surface-3)", color: "var(--muted-foreground)",
            }}>{f.badge}</span>}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid var(--sidebar-border)", margin: "6px 8px 0" }}/>

      {/* Scrollable channels list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
        <SidebarSection
          label="Kênh"
          jp="チャンネル"
          count={channels.length}
          open={openSec.channels}
          onToggle={() => setOpenSec({ ...openSec, channels: !openSec.channels })}
          onAdd={() => {}}>
          {openSec.channels && channels.map(ch => (
            <ChannelRow key={ch.id} ch={ch} active={ch.id === activeChannelId} onClick={() => onPick && onPick(ch.id)} itemH={itemH}/>
          ))}
        </SidebarSection>

        <SidebarSection
          label="Tin nhắn trực tiếp"
          jp="ダイレクト"
          count={dms.length}
          open={openSec.dms}
          onToggle={() => setOpenSec({ ...openSec, dms: !openSec.dms })}
          onAdd={() => {}}>
          {openSec.dms && dms.map(dm => <DMRow key={dm.id} dm={dm} active={false} itemH={itemH}/>)}
        </SidebarSection>

        <SidebarSection
          label="Apps & bots"
          jp="アプリ"
          count={2}
          open={openSec.apps}
          onToggle={() => setOpenSec({ ...openSec, apps: !openSec.apps })}>
          {openSec.apps && (
            <>
              <AppRow icon="📅" name="kintai-bot" itemH={itemH}/>
              <AppRow icon="🚀" name="deploy-bot" itemH={itemH}/>
            </>
          )}
        </SidebarSection>
      </div>

      {/* User footer */}
      <div style={{
        borderTop: "1px solid var(--sidebar-border)",
        padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <UserAvatar id="me" size={32}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Bạn</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--success)" }}/>
            Active · Admin
          </div>
        </div>
        <button title="Status" style={{
          width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent",
          color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer",
        }}>{CI.smile(14)}</button>
      </div>
    </aside>
  );
}
window.ChannelSidebar = ChannelSidebar;

function SidebarSection({ label, jp, count, open, onToggle, onAdd, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 10px 4px",
        fontSize: 10, color: "var(--muted-foreground)",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        <button onClick={onToggle} style={{
          width: 14, height: 14, border: 0, background: "transparent",
          color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer",
          transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 120ms",
        }}>{I.chevronDown(10)}</button>
        <span>{label}</span>
        <span style={{ opacity: 0.5, fontFamily: "var(--font-sans-jp)" }}>· {jp}</span>
        <span style={{ marginLeft: "auto", opacity: 0.6 }}>{count}</span>
        {onAdd && (
          <button onClick={onAdd} title="Add" style={{
            width: 16, height: 16, border: 0, background: "transparent",
            color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer",
          }}>{I.plus(12)}</button>
        )}
      </div>
      {children}
    </div>
  );
}

function ChannelRow({ ch, active, onClick, itemH }) {
  const Icon2 = ch.priv ? CI.lock : CI.hash;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      width: "100%", height: itemH, padding: "0 10px",
      border: 0, background: active ? "var(--sidebar-active-bg)" : "transparent",
      color: active ? "var(--sidebar-active-fg)" : ch.unread > 0 ? "var(--sidebar-fg)" : "var(--muted-foreground)",
      fontSize: 13, fontWeight: active || ch.unread > 0 ? 500 : 400,
      cursor: "pointer", borderRadius: 6, textAlign: "left",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-3)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}>
      <span style={{ flexShrink: 0, color: "currentColor", opacity: ch.muted ? 0.5 : 1 }}>{Icon2(13)}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: ch.muted ? 0.5 : 1 }}>{ch.name}</span>
      {ch.muted && <span style={{ color: "var(--muted-foreground)" }}>{CI.bellOff(11)}</span>}
      {ch.unread > 0 && (
        <span style={{
          minWidth: 18, height: 16, padding: "0 5px",
          background: ch.unread >= 5 ? "var(--error)" : "var(--surface-3)",
          color: ch.unread >= 5 ? "#fff" : "var(--foreground)",
          borderRadius: 99, fontSize: 10, fontWeight: 600,
          display: "grid", placeItems: "center",
        }}>{ch.unread}</span>
      )}
    </button>
  );
}

function DMRow({ dm, active, itemH }) {
  if (dm.kind === "dm") {
    const u = U[dm.users[0]];
    return (
      <button style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", height: itemH, padding: "0 8px",
        border: 0, background: active ? "var(--sidebar-active-bg)" : "transparent",
        color: dm.unread > 0 ? "var(--sidebar-fg)" : "var(--muted-foreground)",
        fontSize: 13, fontWeight: dm.unread > 0 ? 500 : 400,
        cursor: "pointer", borderRadius: 6, textAlign: "left",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-3)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}>
        <UserAvatar id={u.id} size={20}/>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
        {dm.unread > 0 && (
          <span style={{
            minWidth: 18, height: 16, padding: "0 5px",
            background: "var(--error)", color: "#fff",
            borderRadius: 99, fontSize: 10, fontWeight: 700,
            display: "grid", placeItems: "center",
          }}>{dm.unread}</span>
        )}
      </button>
    );
  }
  // group
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 8,
      width: "100%", height: itemH, padding: "0 8px",
      border: 0, background: "transparent",
      color: dm.unread > 0 ? "var(--sidebar-fg)" : "var(--muted-foreground)",
      fontSize: 13, fontWeight: dm.unread > 0 ? 500 : 400,
      cursor: "pointer", borderRadius: 6, textAlign: "left",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
    onMouseLeave={e => e.currentTarget.style.background = ""}>
      <span style={{ display: "inline-flex", marginRight: 2 }}>
        {dm.users.slice(0, 3).map((uid, i) => (
          <span key={uid} style={{ marginLeft: i === 0 ? 0 : -6, border: "1.5px solid var(--sidebar-bg)", borderRadius: 6, lineHeight: 0 }}>
            <UserAvatar id={uid} size={16}/>
          </span>
        ))}
      </span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dm.name}</span>
      {dm.unread > 0 && (
        <span style={{
          minWidth: 18, height: 16, padding: "0 5px",
          background: "var(--error)", color: "#fff",
          borderRadius: 99, fontSize: 10, fontWeight: 700,
          display: "grid", placeItems: "center",
        }}>{dm.unread}</span>
      )}
    </button>
  );
}

function AppRow({ icon, name, itemH }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 8,
      width: "100%", height: itemH, padding: "0 10px",
      border: 0, background: "transparent",
      color: "var(--muted-foreground)", fontSize: 13,
      cursor: "pointer", borderRadius: 6, textAlign: "left",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
    onMouseLeave={e => e.currentTarget.style.background = ""}>
      <span style={{ width: 16, height: 16, display: "grid", placeItems: "center", fontSize: 12 }}>{icon}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>APP</span>
    </button>
  );
}
