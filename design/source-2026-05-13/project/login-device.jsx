/* global React, L, LoginShell, GodxMark, PrimaryBtn, GhostBtn, FakeQR */
/* eslint-disable react/prop-types */

// ────────────────────────────────────────────────────────────────────
// Device flow screens.
//
// Two perspectives:
//   (a) DEVICE side — POS, KDS, CLI display the user code & verify URL.
//       Each mimics its native chrome so the design feels native to that
//       surface, not a generic web modal.
//   (b) BROWSER side — user opens verify.famgia.com/device on a laptop
//       or phone to enter the code, review scopes, and approve.
// ────────────────────────────────────────────────────────────────────

const USER_CODE = "ABCD-EFGH";

// ─── Shared device-code block (re-used across POS / KDS / CLI) ───────
function DeviceCodeDisplay({ size = "lg", muted }) {
  const fs = size === "xl" ? 56 : size === "lg" ? 44 : 32;
  const gap = size === "xl" ? 12 : 8;
  return (
    <div className="row" style={{ gap, fontFamily: "var(--font-mono)", fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em" }}>
      {USER_CODE.split("").map((c, i) => c === "-" ? (
        <span key={i} style={{ width: fs * 0.22, height: 2, background: muted ? "currentColor" : "var(--muted-foreground)", opacity: 0.5, alignSelf: "center" }}/>
      ) : (
        <span key={i} style={{
          width: fs * 0.85, height: fs * 1.18,
          display: "grid", placeItems: "center",
          border: "1px solid " + (muted ? "currentColor" : "var(--border)"),
          borderRadius: 6,
          background: muted ? "transparent" : "var(--surface-1, var(--background))",
          fontSize: fs, lineHeight: 1, color: muted ? "currentColor" : "var(--foreground)",
        }}>{c}</span>
      ))}
    </div>
  );
}
window.DeviceCodeDisplay = DeviceCodeDisplay;

// ─── Spinner ─────────────────────────────────────────────────────────
function Spinner({ size = 12, color = "currentColor" }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 99,
      border: `2px solid ${color}`, borderTopColor: "transparent",
      display: "inline-block", animation: "spin 0.8s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
window.Spinner = Spinner;

// ────────────────────────────────────────────────────────────────────
// (a1) Device — POS (restaurant-pos / Tauri)
// Native chrome: Tauri window frame, restaurant POS empty-state.
// ────────────────────────────────────────────────────────────────────
function ScreenDevicePOS({ locale }) {
  const t = L[locale];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--background)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-sans-jp)",
      color: "var(--foreground)",
    }}>
      {/* Tauri-like titlebar */}
      <div style={{
        height: 32, padding: "0 12px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)",
      }}>
        <div className="row gap-1">
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fc615d" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fdbe40" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#34c84a" }}/>
        </div>
        <span style={{ marginLeft: 12 }}>restaurant-pos · betoya店</span>
        <span className="ml-auto">v1.4.0 · Tauri</span>
      </div>

      {/* POS app empty / lock state */}
      <div style={{ flex: 1, padding: "32px 36px 28px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div className="row gap-2" style={{ marginBottom: 28, alignItems: "center" }}>
          <GodxMark size={24}/>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", marginLeft: 6 }}>· POS sign-in</span>
          <span className="ml-auto row gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#68be8d" }}/>
            betoya-pos-12 · 192.168.20.42
          </span>
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px", letterSpacing: -0.2 }}>{t.deviceTitlePOS}</h1>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 22px", lineHeight: 1.6 }}>{t.deviceInstr}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center", flex: 1 }}>
          {/* Left: URL + code */}
          <div className="col gap-4" style={{ minWidth: 0 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>① 別のデバイスで開く</div>
              <div style={{
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: 8,
                fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
                color: "var(--foreground)",
              }}>{t.deviceVerifyUrl}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>② コードを入力</div>
              <DeviceCodeDisplay size="xl"/>
            </div>
          </div>

          {/* Right: QR */}
          <div className="col" style={{ alignItems: "center", gap: 8 }}>
            <div style={{ padding: 8, background: "var(--surface-1, var(--background))", border: "1px solid var(--border)", borderRadius: 10 }}>
              <FakeQR size={132}/>
            </div>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>QR 読み取り</span>
          </div>
        </div>

        {/* Status row */}
        <div className="row gap-2" style={{
          marginTop: 18, padding: "10px 14px",
          background: "color-mix(in oklch, #f8b500 14%, transparent)",
          border: "1px solid color-mix(in oklch, #f8b500 35%, transparent)",
          borderRadius: 8, alignItems: "center", fontSize: 12,
        }}>
          <Spinner color="#9a6f00" size={12}/>
          <span style={{ color: "var(--foreground)" }}>{t.waitingForApproval}</span>
          <span className="ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>04:32 残</span>
        </div>
      </div>
    </div>
  );
}
window.ScreenDevicePOS = ScreenDevicePOS;

// ────────────────────────────────────────────────────────────────────
// (a2) Device — KDS (Kitchen Display System)
// Fullbleed black background, large code (visible from across the kitchen).
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceKDS({ locale }) {
  const t = L[locale];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#0d0c0a", color: "#f6f4ef",
      fontFamily: "var(--font-sans-jp)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Top status bar */}
      <div style={{
        height: 36, padding: "0 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 12,
        fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono)",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: "#f8b500" }}/>
        <span>KDS · betoya-kitchen-01</span>
        <span className="ml-auto">offline · pending auth</span>
        <span>13:42</span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", padding: "32px 48px", gap: 56 }}>
        {/* QR */}
        <div style={{ padding: 12, background: "white", borderRadius: 12 }}>
          <FakeQR size={148}/>
        </div>

        {/* Middle */}
        <div className="col gap-3" style={{ alignItems: "flex-start" }}>
          <div className="row gap-2" style={{ alignItems: "center" }}>
            <span style={{
              width: 28, height: 28, borderRadius: 6, background: "#eb6101",
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "white",
            }}>g</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>godx-admin · KDS</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "12px 0 4px", letterSpacing: -0.4, lineHeight: 1.15 }}>{t.deviceTitleKDS}</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: 380, lineHeight: 1.5 }}>{t.deviceInstr}</p>
          <div style={{ marginTop: 18, fontFamily: "var(--font-mono)", fontSize: 16, color: "rgba(255,255,255,0.85)" }}>{t.deviceVerifyUrl}</div>
        </div>

        {/* Right: big code */}
        <div className="col" style={{ alignItems: "flex-end", gap: 10, color: "white" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{t.deviceCodeLabel}</span>
          <DeviceCodeDisplay size="xl" muted/>
          <div className="row gap-2" style={{ marginTop: 6, alignItems: "center", color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            <Spinner size={10} color="rgba(255,255,255,0.55)"/>
            <span>{t.waitingForApproval}</span>
          </div>
        </div>
      </div>

      <div style={{
        padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>{t.secured}</span>
        <span>OAuth 2.0 Device Authorization Grant (RFC 8628)</span>
      </div>
    </div>
  );
}
window.ScreenDeviceKDS = ScreenDeviceKDS;

// ────────────────────────────────────────────────────────────────────
// (a3) Device — CLI (godx CLI auth on developer machine)
// Terminal-style chrome with ASCII output and live polling.
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceCLI({ locale }) {
  const t = L[locale];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "oklch(15% 0.005 60)",
      fontFamily: "var(--font-mono)",
      color: "oklch(90% 0.005 60)",
      display: "flex", flexDirection: "column",
    }}>
      {/* terminal titlebar */}
      <div style={{
        height: 30, padding: "0 12px",
        background: "oklch(20% 0.006 60)",
        borderBottom: "1px solid oklch(28% 0.006 60)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11, color: "oklch(62% 0.006 60)",
      }}>
        <div className="row gap-1">
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fc615d" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fdbe40" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#34c84a" }}/>
        </div>
        <span style={{ marginLeft: 8 }}>satoshi@famgia: ~/projects/godx-kintai · zsh — 120×30</span>
      </div>

      {/* Terminal body */}
      <div style={{ flex: 1, padding: "16px 18px", fontSize: 13, lineHeight: 1.65, overflow: "hidden", minHeight: 0 }}>
        <div><span style={{ color: "#86c1ff" }}>satoshi@famgia</span><span style={{ color: "oklch(60% 0.006 60)" }}>:</span><span style={{ color: "#68be8d" }}>~/projects/godx-kintai</span><span style={{ color: "oklch(60% 0.006 60)" }}>$</span> godx auth login</div>
        <div style={{ color: "oklch(70% 0.005 60)", marginTop: 6 }}>godx CLI v0.18.2 — authenticating with <span style={{ color: "#f8b500" }}>verify.famgia.com</span></div>
        <div style={{ color: "oklch(70% 0.005 60)" }}>→ Requesting device code from <span style={{ color: "#86c1ff" }}>https://login.famgia.com/oauth/v2/device_authorization</span></div>
        <div style={{ color: "oklch(70% 0.005 60)" }}>← <span style={{ color: "#68be8d" }}>200 OK</span> · valid for 5 minutes</div>

        <div style={{ marginTop: 14, padding: "12px 14px", background: "oklch(22% 0.005 60)", borderLeft: "3px solid #eb6101", borderRadius: 4 }}>
          <div style={{ color: "oklch(70% 0.005 60)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>① Open this URL in your browser:</div>
          <div style={{ fontSize: 15, color: "#f6f4ef", fontWeight: 600 }}>https://{t.deviceVerifyUrl}</div>
          <div style={{ color: "oklch(70% 0.005 60)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", margin: "12px 0 6px" }}>② Enter this code:</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.12em", color: "#f8b500" }}>{USER_CODE}</div>
        </div>

        <div className="row gap-2" style={{ marginTop: 14, alignItems: "center", color: "oklch(70% 0.005 60)" }}>
          <Spinner size={10} color="oklch(70% 0.005 60)"/>
          <span>Polling for approval… (every 5s)</span>
          <span style={{ marginLeft: "auto", color: "oklch(55% 0.005 60)", fontSize: 11 }}>expires in 04:32</span>
        </div>
        <div style={{ marginTop: 10, color: "oklch(55% 0.005 60)", fontSize: 11 }}>Press <span style={{ color: "#f6f4ef", fontWeight: 600 }}>^C</span> to cancel.</div>

        <div style={{ marginTop: 14 }}>
          <span style={{ color: "#86c1ff" }}>satoshi@famgia</span><span style={{ color: "oklch(60% 0.006 60)" }}>:</span><span style={{ color: "#68be8d" }}>~/projects/godx-kintai</span><span style={{ color: "oklch(60% 0.006 60)" }}>$</span> <span className="pulse">▍</span>
        </div>
      </div>
    </div>
  );
}
window.ScreenDeviceCLI = ScreenDeviceCLI;

// ────────────────────────────────────────────────────────────────────
// (b1) Browser — Enter device code
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceCodeEntry({ locale }) {
  const t = L[locale];
  // Animated cursor on last empty slot.
  const filled = ["A", "B", "C", "D", "E", "_", "_", "_"];
  return (
    <LoginShell locale={locale} cardWidth={460}>
      <div style={{ width: 44, height: 44, borderRadius: 10, marginBottom: 16,
        background: "color-mix(in oklch, #4c6cb3 14%, transparent)",
        color: "#4c6cb3",
        display: "grid", placeItems: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h2M11 12h2M15 12h2"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.3 }}>{t.deviceCodeEntryTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.55 }}>{t.deviceCodeEntrySubtitle}</p>

      <div className="col" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{t.deviceCodeInput}</div>
        <div className="row" style={{ gap: 6, justifyContent: "space-between" }}>
          {filled.map((c, i) => {
            const isDash = i === 4;
            if (isDash) return <span key={i} style={{ alignSelf: "center", width: 10, height: 2, background: "var(--muted-foreground)", opacity: 0.4 }}/>;
            const empty = c === "_";
            return (
              <div key={i} style={{
                flex: 1, height: 56,
                border: "1px solid " + (i === 5 ? "var(--brand-accent, var(--primary))" : "var(--input)"),
                borderRadius: 10,
                background: i === 5 ? "color-mix(in oklch, var(--brand-accent, #eb6101) 4%, var(--background))" : "var(--input-background, var(--background))",
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600,
                color: empty ? "var(--muted-foreground)" : "var(--foreground)",
                boxShadow: i === 5 ? "0 0 0 3px color-mix(in oklch, var(--brand-accent, #eb6101) 14%, transparent)" : "none",
              }}>{empty ? (i === 5 ? <span className="pulse">▍</span> : "") : c}</div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted-foreground)" }}>{locale === "ja" ? "ABCD-EFGH 形式" : locale === "vi" ? "Định dạng ABCD-EFGH" : "Format: ABCD-EFGH"}</div>
      </div>

      <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("device-authorize")}>{t.next}</PrimaryBtn>

      <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted-foreground)", textAlign: "center" }}>
        {locale === "ja"
          ? "コードはデバイス側で 5 分間表示されます。期限切れの場合はデバイスで再表示してください。"
          : locale === "vi"
          ? "Mã hiển thị trên thiết bị trong 5 phút. Nếu hết hạn, mở lại trên thiết bị."
          : "The code stays visible on the device for 5 minutes. Refresh on the device if it expires."}
      </div>
    </LoginShell>
  );
}
window.ScreenDeviceCodeEntry = ScreenDeviceCodeEntry;

// ────────────────────────────────────────────────────────────────────
// (b2) Browser — Device authorize confirm (review scopes & approve)
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceAuthorize({ locale }) {
  const t = L[locale];
  return (
    <LoginShell locale={locale} cardWidth={460}>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.3 }}>{t.deviceAuthorizeTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 18px", lineHeight: 1.55 }}>{t.deviceAuthorizeSubtitle}</p>

      {/* Device card */}
      <div style={{
        padding: "12px 14px", marginBottom: 18,
        border: "1px solid var(--border)", borderRadius: 10,
        background: "var(--surface-2)",
      }}>
        <div className="row gap-2" style={{ alignItems: "center", marginBottom: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            background: "color-mix(in oklch, #eb6101 16%, transparent)",
            color: "#eb6101",
            display: "grid", placeItems: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 19h8M12 19v-3"/></svg>
          </span>
          <div className="col grow">
            <span style={{ fontSize: 13, fontWeight: 500 }}>restaurant-pos (Tauri)</span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>betoya-pos-12 · 192.168.20.42</span>
          </div>
          <span className="row gap-1" style={{
            padding: "2px 8px", borderRadius: 99,
            background: "color-mix(in oklch, #68be8d 18%, transparent)",
            color: "#1d5a3b", fontSize: 10, fontFamily: "var(--font-mono)", alignItems: "center",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: "#68be8d" }}/>
            ローカル同一NW
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{USER_CODE}</span>
          <span> · </span>
          <span>{locale === "ja" ? "GPS: 大阪府大阪市" : locale === "vi" ? "GPS: Osaka, Nhật Bản" : "GPS: Osaka, Japan"}</span>
        </div>
      </div>

      {/* Scopes */}
      <div style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{t.deviceMeta}</div>
      <div className="col gap-1" style={{ marginBottom: 22 }}>
        {[
          { text: t.deviceScopeRead, granted: true },
          { text: t.deviceScopeWrite, granted: true },
          { text: t.deviceScopeAdmin, granted: false },
        ].map((s, i) => (
          <div key={i} className="row gap-2" style={{
            padding: "8px 10px", borderRadius: 6,
            background: "var(--surface-2)",
            opacity: s.granted ? 1 : 0.55,
            alignItems: "center",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: s.granted ? "#68be8d" : "var(--surface-3)",
              color: s.granted ? "white" : "var(--muted-foreground)",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {s.granted
                ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                : <span style={{ fontSize: 10 }}>—</span>}
            </span>
            <span style={{ fontSize: 12 }}>{s.text}</span>
            {!s.granted && <span className="ml-auto" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{locale === "ja" ? "対象外" : locale === "vi" ? "Không bao gồm" : "not included"}</span>}
          </div>
        ))}
      </div>

      {/* Identity row */}
      <div className="row gap-2" style={{ marginBottom: 18, padding: "8px 10px", border: "1px dashed var(--border)", borderRadius: 6, alignItems: "center" }}>
        <span style={{
          width: 22, height: 22, borderRadius: 99,
          background: "color-mix(in oklch, var(--brand-accent, #eb6101) 18%, transparent)",
          color: "var(--brand-accent, #eb6101)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10,
        }}>S</span>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>satoshi@famgia.com</span>
        <span className="muted ml-auto" style={{ fontSize: 11 }}>{locale === "ja" ? "本人としてサインイン中" : locale === "vi" ? "Đang đăng nhập" : "signed in as"}</span>
      </div>

      <div className="row gap-2">
        <button onClick={() => window.__nextScreen && window.__nextScreen("device-denied")}
          style={{
            flex: 1, height: 44, borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface-1, var(--background))", color: "var(--foreground)",
            fontWeight: 500, fontSize: 13, cursor: "pointer",
            fontFamily: "var(--font-sans-jp)",
          }}>{t.deny}</button>
        <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("device-approved-browser")} style={{ flex: 2 }}>{t.approve}</PrimaryBtn>
      </div>
    </LoginShell>
  );
}
window.ScreenDeviceAuthorize = ScreenDeviceAuthorize;

// ────────────────────────────────────────────────────────────────────
// (b3) Browser — Device approved (success on browser side)
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceApprovedBrowser({ locale }) {
  const t = L[locale];
  return (
    <LoginShell locale={locale}>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 99, margin: "0 auto 18px",
          background: "color-mix(in oklch, #68be8d 18%, transparent)",
          color: "#1d5a3b",
          display: "grid", placeItems: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="#68be8d" strokeOpacity="0.4"/>
            <path d="M8 12l3 3 5-6"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.3 }}>{t.approvedTitle}</h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.5 }}>{t.approvedSubtitle}</p>

        <div style={{
          padding: "10px 14px", marginBottom: 22,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 8, fontSize: 12, color: "var(--muted-foreground)",
          fontFamily: "var(--font-mono)", textAlign: "left",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 19h8M12 19v-3"/></svg>
          <span>restaurant-pos · betoya-pos-12</span>
          <span className="ml-auto row gap-1" style={{ alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#68be8d" }}/>
            <span style={{ color: "#1d5a3b" }}>approved</span>
          </span>
        </div>

        <PrimaryBtn onClick={() => window.location.href = "godx-unified.html"}>
          {locale === "ja" ? "godx-admin を開く" : locale === "vi" ? "Mở godx-admin" : "Open godx-admin"}
        </PrimaryBtn>
      </div>
    </LoginShell>
  );
}
window.ScreenDeviceApprovedBrowser = ScreenDeviceApprovedBrowser;

// ────────────────────────────────────────────────────────────────────
// (a4) Device — POS, signed-in (post-approval)
// ────────────────────────────────────────────────────────────────────
function ScreenDeviceCompleted({ locale }) {
  const t = L[locale];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--background)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-sans-jp)",
      color: "var(--foreground)",
    }}>
      {/* Tauri titlebar */}
      <div style={{
        height: 32, padding: "0 12px",
        background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)",
      }}>
        <div className="row gap-1">
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fc615d" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#fdbe40" }}/>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#34c84a" }}/>
        </div>
        <span style={{ marginLeft: 12 }}>restaurant-pos · betoya店</span>
        <span className="ml-auto row gap-1" style={{ alignItems: "center" }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#68be8d" }}/>
          satoshi@famgia.com
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 18 }}>
        {/* Success orb */}
        <div style={{ position: "relative", width: 96, height: 96 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              position: "absolute", inset: 0, borderRadius: 99,
              border: "1px solid color-mix(in oklch, #68be8d 40%, transparent)",
              opacity: 0, animation: `ok-pulse 2.4s ease-out ${i * 1.2}s infinite`,
            }}/>
          ))}
          <div style={{
            position: "absolute", inset: 12, borderRadius: 99,
            background: "color-mix(in oklch, #68be8d 18%, transparent)",
            color: "#1d5a3b",
            display: "grid", placeItems: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7"/>
            </svg>
          </div>
          <style>{`@keyframes ok-pulse { 0% { opacity: 0.6; transform: scale(0.85); } 100% { opacity: 0; transform: scale(1.5); } }`}</style>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>{t.completedDeviceTitle}</h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5, textAlign: "center", maxWidth: 320 }}>{t.completedDeviceSubtitle}</p>

        <div style={{
          marginTop: 6, padding: "10px 14px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 8, fontSize: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 99,
            background: "color-mix(in oklch, #eb6101 18%, transparent)",
            color: "#eb6101", display: "grid", placeItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
          }}>S</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>satoshi@famgia.com</span>
          <span style={{ color: "var(--muted-foreground)", marginLeft: 4 }}>· {locale === "ja" ? "POS 担当" : "POS operator"}</span>
        </div>

        <button style={{
          marginTop: 14, padding: "8px 22px", height: 40,
          borderRadius: 8, border: "none",
          background: "var(--brand-accent, var(--primary))", color: "white",
          fontWeight: 600, fontSize: 13, cursor: "pointer",
          fontFamily: "var(--font-sans-jp)",
        }}>
          {locale === "ja" ? "シフトを開始" : locale === "vi" ? "Bắt đầu ca" : "Start shift"}
        </button>
      </div>
    </div>
  );
}
window.ScreenDeviceCompleted = ScreenDeviceCompleted;

// ────────────────────────────────────────────────────────────────────
// Error screens — Expired / Denied / Wrong code
// ────────────────────────────────────────────────────────────────────
function ErrorShell({ locale, tone, icon, title, subtitle, primary, primaryAction, secondary, secondaryAction, meta }) {
  const toneColor = tone === "warning" ? "#f8b500" : tone === "error" ? "#b7282e" : "var(--muted-foreground)";
  return (
    <LoginShell locale={locale}>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 99, margin: "0 auto 18px",
          background: "color-mix(in oklch, " + toneColor + " 16%, transparent)",
          color: toneColor,
          display: "grid", placeItems: "center",
        }}>{icon}</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.3 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 18px", lineHeight: 1.55 }}>{subtitle}</p>

        {meta && <div style={{
          padding: "10px 14px", marginBottom: 22,
          background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
          fontSize: 12, color: "var(--muted-foreground)",
          fontFamily: "var(--font-mono)", textAlign: "left",
          display: "flex", alignItems: "center", gap: 10,
        }}>{meta}</div>}

        <PrimaryBtn onClick={primaryAction}>{primary}</PrimaryBtn>
        {secondary && (
          <div style={{ marginTop: 12 }}>
            <button onClick={secondaryAction} style={{
              background: "transparent", border: "none", padding: 0,
              fontSize: 12, color: "var(--muted-foreground)", cursor: "pointer",
              borderBottom: "1px dotted var(--muted-foreground)",
              fontFamily: "var(--font-sans-jp)",
            }}>{secondary}</button>
          </div>
        )}
      </div>
    </LoginShell>
  );
}

function ScreenErrorExpired({ locale }) {
  const t = L[locale];
  return (
    <ErrorShell locale={locale} tone="warning"
      icon={<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg>}
      title={t.errorExpiredTitle}
      subtitle={t.errorExpiredSubtitle}
      meta={<>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
        <span>ABCD-EFGH · expired 12 秒前</span>
      </>}
      primary={t.backToDevice}
      primaryAction={() => window.__nextScreen && window.__nextScreen("device-pos")}
      secondary={t.retry}
      secondaryAction={() => window.__nextScreen && window.__nextScreen("device-code-entry")}/>
  );
}
window.ScreenErrorExpired = ScreenErrorExpired;

function ScreenErrorDenied({ locale }) {
  const t = L[locale];
  return (
    <ErrorShell locale={locale} tone="error"
      icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>}
      title={t.errorDeniedTitle}
      subtitle={t.errorDeniedSubtitle}
      meta={<>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
        <span>betoya-pos-12 · denied by satoshi@famgia.com</span>
      </>}
      primary={t.backToDevice}
      primaryAction={() => window.__nextScreen && window.__nextScreen("device-pos")}
      secondary={t.contactAdmin}
      secondaryAction={() => {}}/>
  );
}
window.ScreenErrorDenied = ScreenErrorDenied;

function ScreenErrorWrongCode({ locale }) {
  const t = L[locale];
  return (
    <ErrorShell locale={locale} tone="error"
      icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.6" fill="currentColor"/></svg>}
      title={t.errorWrongCodeTitle}
      subtitle={t.errorWrongCodeSubtitle}
      primary={t.retry}
      primaryAction={() => window.__nextScreen && window.__nextScreen("device-code-entry")}/>
  );
}
window.ScreenErrorWrongCode = ScreenErrorWrongCode;

// ────────────────────────────────────────────────────────────────────
// Browser sign-in complete (after MFA / Passkey / SSO)
// ────────────────────────────────────────────────────────────────────
function ScreenSignedIn({ locale }) {
  const t = L[locale];
  return (
    <LoginShell locale={locale}>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 99, margin: "0 auto 18px",
          background: "color-mix(in oklch, #68be8d 18%, transparent)",
          color: "#1d5a3b",
          display: "grid", placeItems: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.3 }}>
          {locale === "ja" ? "サインインしました" : locale === "vi" ? "Đã đăng nhập" : "Signed in"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.5 }}>
          {locale === "ja" ? "godx-admin にリダイレクトします…" : locale === "vi" ? "Đang chuyển sang godx-admin…" : "Redirecting to godx-admin…"}
        </p>
        <PrimaryBtn onClick={() => window.location.href = "godx-unified.html"}>
          {locale === "ja" ? "godx-admin を開く" : locale === "vi" ? "Mở godx-admin" : "Open godx-admin"}
        </PrimaryBtn>
      </div>
    </LoginShell>
  );
}
window.ScreenSignedIn = ScreenSignedIn;
