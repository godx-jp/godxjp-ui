/* global React, I, Icon, Badge, cx, U, CI, UserAvatar, CHAT_MESSAGES, CHAT_THREAD, CHAT_CHANNELS */
/* Chat main area — channel header + message list + composer + thread panel */

const { useState: useStateMain, useRef: useRefMain } = React;

// ── Channel header bar ──────────────────────────────────────────────
function ChannelHeader({ channel, threadOpen, onToggleThread, density }) {
  if (!channel) return null;
  return (
    <header style={{
      height: 56, padding: "0 16px",
      borderBottom: "1px solid var(--border)",
      background: "var(--background)",
      display: "flex", alignItems: "center", gap: 12,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: "var(--surface-3)", color: "var(--foreground)",
          display: "grid", placeItems: "center",
        }}>{channel.priv ? CI.lock(14) : CI.hash(14)}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" }}>
              {channel.priv ? "" : "#"}{channel.name}
            </h2>
            {channel.muted && (
              <span style={{ color: "var(--muted-foreground)", display: "inline-flex" }}>{CI.bellOff(13)}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {channel.topic}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Member chip stack */}
      <button style={{
        display: "flex", alignItems: "center", gap: 4,
        height: 30, padding: "0 8px 0 4px",
        border: "1px solid var(--border)", borderRadius: 999,
        background: "var(--card)", cursor: "pointer",
      }}>
        <span style={{ display: "inline-flex" }}>
          {["u1","u3","u5","u4"].map((uid, i) => (
            <span key={uid} style={{ marginLeft: i === 0 ? 0 : -6, borderRadius: 99, border: "1.5px solid var(--card)", lineHeight: 0 }}>
              <UserAvatar id={uid} size={18}/>
            </span>
          ))}
        </span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginLeft: 4 }}>+12</span>
      </button>

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {[
          { icon: CI.phone, label: "Huddle", primary: true },
          { icon: CI.video, label: "Video" },
          { icon: CI.pin,   label: "Pin", badge: 2 },
          { icon: CI.bookmark, label: "Saved" },
          { icon: I.users, label: "Members" },
          { icon: CI.more, label: "More" },
        ].map((b, i) => (
          <button key={i} title={b.label} style={{
            position: "relative",
            width: 32, height: 32, border: 0, background: "transparent",
            color: b.primary ? "var(--brand)" : "var(--muted-foreground)",
            display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
          onMouseLeave={e => e.currentTarget.style.background = ""}>
            {b.icon(15)}
            {b.badge && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                minWidth: 13, height: 13, padding: "0 3px",
                background: "var(--error)", color: "#fff",
                borderRadius: 99, fontSize: 8, fontWeight: 700,
                display: "grid", placeItems: "center",
              }}>{b.badge}</span>
            )}
          </button>
        ))}
        <button
          onClick={onToggleThread}
          title="Threads"
          style={{
            marginLeft: 4, height: 30, padding: "0 10px",
            border: "1px solid " + (threadOpen ? "var(--primary)" : "var(--border)"),
            background: threadOpen ? "color-mix(in oklch, var(--primary) 8%, transparent)" : "var(--card)",
            color: threadOpen ? "var(--primary)" : "var(--foreground)",
            display: "flex", alignItems: "center", gap: 6,
            cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: 500,
          }}>
          {CI.thread(13)} Thread
        </button>
      </div>
    </header>
  );
}
window.ChannelHeader = ChannelHeader;

// ── Message item ────────────────────────────────────────────────────
function Message({ msg, dense, onOpenThread, isFirstOfGroup }) {
  const u = U[msg.user];
  const [hover, setHover] = useStateMain(false);

  // Replace mention tokens with chips
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+|`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (/^@/.test(p)) {
        return <span key={i} style={{
          background: "color-mix(in oklch, var(--primary) 10%, transparent)",
          color: "var(--primary)", padding: "0 4px",
          borderRadius: 4, fontWeight: 500,
        }}>{p}</span>;
      }
      if (/^`/.test(p)) {
        return <code key={i} style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          background: "var(--surface-3)", color: "var(--foreground)",
          padding: "1px 6px", borderRadius: 4, fontSize: "0.92em",
        }}>{p.replace(/`/g, "")}</code>;
      }
      if (/^\*\*/.test(p)) {
        return <strong key={i}>{p.replace(/\*\*/g, "")}</strong>;
      }
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        gap: 12,
        padding: dense
          ? (isFirstOfGroup ? "8px 16px 2px" : "1px 16px")
          : (isFirstOfGroup ? "12px 20px 4px" : "2px 20px"),
        background: hover ? "var(--surface-2)" : "transparent",
        transition: "background 80ms",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", paddingTop: isFirstOfGroup ? 2 : 4 }}>
        {isFirstOfGroup ? (
          <UserAvatar id={msg.user} size={36}/>
        ) : (
          <span style={{
            fontSize: 10, color: hover ? "var(--muted-foreground)" : "transparent",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            paddingTop: 2,
          }}>{msg.ts}</span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        {isFirstOfGroup && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</span>
            <span style={{ fontSize: 10, padding: "0 5px", borderRadius: 3, background: "var(--surface-3)", color: "var(--muted-foreground)", fontWeight: 500 }}>{u.role}</span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{msg.ts}</span>
          </div>
        )}
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--foreground)" }}>
          {msg.pinned && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, color: "var(--attention)", marginBottom: 4,
            }}>{CI.pin(11)} Pinned · ピン留め</div>
          )}
          <div>{renderText(msg.text)}</div>
        </div>

        {/* Attachments */}
        {msg.attachments && msg.attachments.map((a, i) => (
          a.kind === "image" ? (
            <div key={i} style={{
              marginTop: 6, width: a.w, height: a.h,
              background: `linear-gradient(135deg, var(--surface-3), color-mix(in oklch, var(--brand) 14%, var(--surface-3)))`,
              border: "1px solid var(--border)", borderRadius: 8,
              display: "grid", placeItems: "center",
              fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--muted-foreground)",
            }}>
              <span style={{ textAlign: "center" }}>
                🌸<br/>
                <span style={{ opacity: 0.7 }}>{a.name}</span>
              </span>
            </div>
          ) : (
            <div key={i} style={{
              marginTop: 6, display: "inline-flex", alignItems: "center", gap: 10,
              padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface-1)", fontSize: 12, maxWidth: 320,
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 6,
                background: "color-mix(in oklch, var(--info) 18%, transparent)",
                color: "var(--info)", display: "grid", placeItems: "center",
              }}>{I.doc(16)}</span>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                <span style={{ color: "var(--muted-foreground)", fontSize: 11 }}>{a.size}</span>
              </div>
              <button style={{ border: 0, background: "transparent", color: "var(--muted-foreground)", cursor: "pointer" }}>{CI.download(14)}</button>
            </div>
          )
        ))}

        {/* Reactions */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {msg.reactions.map((r, i) => (
              <button key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 22, padding: "0 6px",
                background: r.mine ? "color-mix(in oklch, var(--primary) 12%, transparent)" : "var(--surface-3)",
                border: "1px solid " + (r.mine ? "color-mix(in oklch, var(--primary) 40%, transparent)" : "transparent"),
                color: r.mine ? "var(--primary)" : "var(--foreground)",
                borderRadius: 99, cursor: "pointer",
                fontSize: 12, fontWeight: 500,
              }}>
                <span>{r.e}</span>
                <span style={{ fontFeatureSettings: "'tnum'" }}>{r.n}</span>
              </button>
            ))}
            <button style={{
              width: 24, height: 22, borderRadius: 99,
              border: "1px dashed var(--border)", background: "transparent",
              color: "var(--muted-foreground)", display: "grid", placeItems: "center",
              cursor: "pointer",
            }}>{CI.smile(12)}</button>
          </div>
        )}

        {/* Thread indicator */}
        {msg.thread && (
          <button
            onClick={() => onOpenThread && onOpenThread(msg.id)}
            style={{
              marginTop: 6, display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 8px 4px 4px",
              border: "1px solid transparent", borderRadius: 6,
              background: "transparent", cursor: "pointer",
              fontSize: 12, color: "var(--primary)", fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = "transparent"; }}>
            <span style={{ display: "inline-flex" }}>
              {msg.thread.users.slice(0, 3).map((uid, i) => (
                <span key={uid} style={{ marginLeft: i === 0 ? 0 : -4, borderRadius: 4, border: "1.5px solid var(--background)", lineHeight: 0 }}>
                  <UserAvatar id={uid} size={18}/>
                </span>
              ))}
            </span>
            <span>{msg.thread.count} replies</span>
            <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>· last {msg.thread.last}</span>
          </button>
        )}
      </div>

      {/* Hover actions */}
      {hover && (
        <div style={{
          position: "absolute", top: -10, right: 24,
          display: "flex", gap: 1,
          background: "var(--popover)", border: "1px solid var(--border)",
          borderRadius: 8, boxShadow: "var(--shadow-md)",
          padding: 2, zIndex: 5,
        }}>
          {[
            { icon: CI.smile,    title: "React" },
            { icon: CI.reply,    title: "Reply in thread" },
            { icon: CI.bookmark, title: "Save" },
            { icon: CI.at,       title: "Mention" },
            { icon: CI.more,     title: "More" },
          ].map((b, i) => (
            <button key={i} title={b.title} style={{
              width: 26, height: 26, border: 0,
              background: "transparent", color: "var(--muted-foreground)",
              display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--muted-foreground)"; }}>{b.icon(14)}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Message list ────────────────────────────────────────────────────
function MessageList({ messages, onOpenThread, density }) {
  // Group consecutive messages from same user within 5 min
  const grouped = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const first = !prev || prev.user !== m.user || prev.date !== m.date;
    grouped.push({ ...m, _first: first });
  });

  const dense = density === "compact";

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      display: "flex", flexDirection: "column",
      paddingBottom: 8,
    }}>
      {/* Today divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 6px" }}>
        <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--border)" }}/>
        <span style={{
          padding: "2px 10px", borderRadius: 99,
          border: "1px solid var(--border)", background: "var(--background)",
          fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)",
        }}>Hôm nay · 本日 · 13 May</span>
        <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--border)" }}/>
      </div>

      {grouped.map(m => (
        <Message key={m.id} msg={m} isFirstOfGroup={m._first} dense={dense} onOpenThread={onOpenThread}/>
      ))}

      {/* Typing indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 20px 0", fontSize: 11, color: "var(--muted-foreground)",
        height: 24,
      }}>
        <span style={{ display: "inline-flex", gap: 2 }}>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--muted-foreground)", animation: "tdot 1.2s infinite", animationDelay: "0s" }}/>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--muted-foreground)", animation: "tdot 1.2s infinite", animationDelay: "0.15s" }}/>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--muted-foreground)", animation: "tdot 1.2s infinite", animationDelay: "0.3s" }}/>
        </span>
        <strong style={{ fontWeight: 600, color: "var(--foreground)" }}>Anh Khoa</strong>
        <span>đang gõ…</span>
      </div>
    </div>
  );
}
window.MessageList = MessageList;

// ── Composer ────────────────────────────────────────────────────────
function Composer({ channelName, density }) {
  const [text, setText] = useStateMain("");
  const refC = useRefMain(null);
  const hasContent = text.trim().length > 0;
  return (
    <div style={{ padding: "10px 20px 20px" }}>
      <div style={{
        border: "1px solid var(--border)", borderRadius: 10,
        background: "var(--input-background)",
        boxShadow: hasContent ? "0 0 0 1px var(--ring), var(--shadow-sm)" : "var(--shadow-sm)",
        overflow: "hidden", transition: "box-shadow 120ms",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 1,
          padding: "6px 8px",
          borderBottom: "1px solid var(--border)",
        }}>
          {[
            { icon: CI.bold,   t: "Bold" },
            { icon: CI.italic, t: "Italic" },
            { icon: CI.link,   t: "Link" },
            { icon: CI.list,   t: "List" },
            { icon: CI.code,   t: "Code" },
          ].map((b, i) => (
            <button key={i} title={b.t} style={{
              width: 26, height: 26, border: 0,
              background: "transparent", color: "var(--muted-foreground)",
              display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--muted-foreground)"; }}>{b.icon(13)}</button>
          ))}
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }}/>
          <span style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>Markdown · /スラッシュ</span>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            <span className="kbd" style={{ fontSize: 9 }}>⇧</span> + <span className="kbd" style={{ fontSize: 9 }}>↵</span> xuống dòng
          </span>
        </div>
        {/* Input */}
        <textarea
          ref={refC}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Nhắn tới #${channelName}…`}
          rows={2}
          style={{
            width: "100%", border: 0, outline: 0, padding: "10px 12px",
            background: "transparent", color: "var(--foreground)",
            fontSize: 13.5, lineHeight: 1.6,
            resize: "none", fontFamily: "inherit",
          }}
        />
        {/* Action row */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 8px 6px" }}>
          {[
            { icon: CI.plus, t: "Add" },
            { icon: CI.paperclip, t: "Attach" },
            { icon: CI.at, t: "Mention" },
            { icon: CI.smile, t: "Emoji" },
            { icon: CI.zap, t: "Quick action" },
          ].map((b, i) => (
            <button key={i} title={b.t} style={{
              width: 28, height: 28, border: 0,
              background: "transparent", color: "var(--muted-foreground)",
              display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--muted-foreground)"; }}>{b.icon(15)}</button>
          ))}
          <div style={{ flex: 1 }}/>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 30, padding: "0 12px",
            border: 0, borderRadius: 6,
            background: hasContent ? "var(--primary)" : "var(--surface-3)",
            color: hasContent ? "var(--primary-foreground)" : "var(--muted-foreground)",
            fontWeight: 500, fontSize: 12, cursor: hasContent ? "pointer" : "not-allowed",
            transition: "background 120ms",
          }}>
            {CI.send(13)} Gửi
          </button>
        </div>
      </div>
      {/* Footer hint */}
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 10.5, color: "var(--muted-foreground)" }}>
        <span><span className="kbd" style={{ fontSize: 9 }}>↵</span> Gửi</span>
        <span><span className="kbd" style={{ fontSize: 9 }}>/</span> Lệnh</span>
        <span><span className="kbd" style={{ fontSize: 9 }}>@</span> Mention</span>
        <span><span className="kbd" style={{ fontSize: 9 }}>:</span> Emoji</span>
        <span style={{ marginLeft: "auto" }}>End-to-end · Famgia hosted</span>
      </div>
    </div>
  );
}
window.Composer = Composer;

// ── Thread panel (right) ────────────────────────────────────────────
function ThreadPanel({ parentMsg, onClose, density }) {
  if (!parentMsg) return null;
  const [text, setText] = useStateMain("");
  const dense = density === "compact";
  return (
    <aside style={{
      width: 380, background: "var(--background)",
      borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{
        height: 56, padding: "0 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Thread</div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>#eng-platform · {CHAT_THREAD.replies.length} replies</div>
        </div>
        <button title="Open in main" style={{
          width: 30, height: 30, border: 0, background: "transparent",
          color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 6,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
        onMouseLeave={e => e.currentTarget.style.background = ""}>{I.external(14)}</button>
        <button onClick={onClose} title="Close" style={{
          width: 30, height: 30, border: 0, background: "transparent",
          color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 6,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-3)"}
        onMouseLeave={e => e.currentTarget.style.background = ""}>{CI.x(14)}</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {/* Parent message */}
        <div style={{ padding: "8px 16px 12px" }}>
          <Message msg={parentMsg} isFirstOfGroup={true} dense={false} onOpenThread={() => {}}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 6px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)" }}>{CHAT_THREAD.replies.length} replies</span>
          <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--border)" }}/>
        </div>

        {/* Replies */}
        {CHAT_THREAD.replies.map(r => {
          const u = U[r.user];
          return (
            <div key={r.id} style={{
              display: "grid", gridTemplateColumns: "32px 1fr", gap: 10,
              padding: dense ? "4px 16px" : "6px 16px",
            }}>
              <UserAvatar id={u.id} size={28}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{u.short}</span>
                  <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "ui-monospace, monospace" }}>{r.ts}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{r.text}</div>
                {r.reactions && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {r.reactions.map((rr, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        height: 20, padding: "0 6px",
                        background: "var(--surface-3)", borderRadius: 99,
                        fontSize: 11, fontWeight: 500,
                      }}>{rr.e} {rr.n}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thread composer */}
      <div style={{ padding: "8px 14px 14px" }}>
        <div style={{
          border: "1px solid var(--border)", borderRadius: 8,
          background: "var(--input-background)",
        }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Trả lời…"
            rows={2}
            style={{
              width: "100%", border: 0, outline: 0,
              padding: "8px 10px",
              background: "transparent", color: "var(--foreground)",
              fontSize: 13, lineHeight: 1.5, resize: "none", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 6px 6px" }}>
            {[CI.paperclip, CI.at, CI.smile].map((Ic, i) => (
              <button key={i} style={{
                width: 24, height: 24, border: 0, background: "transparent",
                color: "var(--muted-foreground)", display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 5,
              }}>{Ic(13)}</button>
            ))}
            <label style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--muted-foreground)" }}>
              <input type="checkbox" style={{ accentColor: "var(--primary)" }}/> Cũng gửi vào #eng-platform
            </label>
            <div style={{ flex: 1 }}/>
            <button style={{
              height: 24, padding: "0 10px", border: 0, borderRadius: 5,
              background: text.trim() ? "var(--primary)" : "var(--surface-3)",
              color: text.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontWeight: 500, fontSize: 11, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}>{CI.send(11)} Gửi</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.ThreadPanel = ThreadPanel;
