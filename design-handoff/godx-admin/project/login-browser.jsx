/* global React, L, LoginShell, GodxMark, PrimaryBtn, GhostBtn, Divider, GoogleIcon, MicrosoftIcon, FingerprintIcon, ShieldIcon */
/* eslint-disable react/prop-types */

// ────────────────────────────────────────────────────────────────────
// Browser flow screens
// ────────────────────────────────────────────────────────────────────

const Field = ({ label, hint, error, right, children }) => (
  <label style={{ display: "block", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{label}</span>
      {right}
    </div>
    {children}
    {hint && !error && <span style={{ display: "block", marginTop: 6, fontSize: 11, color: "var(--muted-foreground)" }}>{hint}</span>}
    {error && <span style={{ display: "block", marginTop: 6, fontSize: 11, color: "var(--destructive)" }}>{error}</span>}
  </label>
);

const Input = ({ leading, trailing, autoFocus, ...props }) => (
  <span style={{
    display: "flex", alignItems: "center",
    height: 44, padding: "0 12px",
    border: "1px solid var(--input)", borderRadius: 8,
    background: "var(--input-background, var(--background))",
  }}>
    {leading && <span style={{ marginRight: 8, color: "var(--muted-foreground)", display: "flex" }}>{leading}</span>}
    <input {...props} autoFocus={autoFocus}
      style={{
        flex: 1, border: "none", outline: "none", background: "transparent",
        fontSize: 14, fontFamily: props.type === "password" ? "var(--font-mono)" : "var(--font-sans-jp)",
        color: "var(--foreground)", padding: 0,
        ...(props.style || {}),
      }}/>
    {trailing && <span style={{ marginLeft: 8, color: "var(--muted-foreground)", display: "flex" }}>{trailing}</span>}
  </span>
);

const IdentityChip = ({ email, onSwitch }) => (
  <div className="row gap-2" style={{
    padding: "8px 8px 8px 10px", marginBottom: 18,
    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 99,
    alignItems: "center", width: "fit-content", maxWidth: "100%",
  }}>
    <span style={{
      width: 22, height: 22, borderRadius: 99,
      background: "color-mix(in oklch, var(--brand-accent, #eb6101) 18%, transparent)",
      color: "var(--brand-accent, #eb6101)",
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10,
    }}>S</span>
    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{email}</span>
    <button onClick={onSwitch} style={{
      border: "none", background: "transparent", color: "var(--muted-foreground)",
      fontSize: 11, padding: "0 4px", cursor: "pointer", fontFamily: "var(--font-sans-jp)",
    }}>切り替え</button>
  </div>
);

// ────────────────────────────────────────────────────────────────────
// 1. Email entry
// ────────────────────────────────────────────────────────────────────
function ScreenEmail({ locale }) {
  const t = L[locale];
  return (
    <LoginShell locale={locale}>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.3 }}>{t.emailTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 22px" }}>{t.emailSubtitle}</p>
      <Field label={t.emailLabel}>
        <Input type="email" placeholder={t.emailHint} defaultValue="satoshi@famgia.com" autoFocus
          leading={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
            </svg>
          }/>
      </Field>
      <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("password")}>
        {t.next}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </PrimaryBtn>

      <Divider label={t.or}/>

      <div className="col gap-2">
        <GhostBtn icon={<GoogleIcon/>}>{t.google}</GhostBtn>
        <GhostBtn icon={<MicrosoftIcon/>}>{t.microsoft}</GhostBtn>
        <GhostBtn icon={<FingerprintIcon/>} onClick={() => window.__nextScreen && window.__nextScreen("passkey")}>{t.passkey}</GhostBtn>
        <GhostBtn icon={<ShieldIcon/>} onClick={() => window.__nextScreen && window.__nextScreen("sso")}>{t.sso}</GhostBtn>
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: "var(--muted-foreground)", display: "flex", justifyContent: "space-between" }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dotted var(--muted-foreground)" }}>{t.register}</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dotted var(--muted-foreground)" }}>{t.help}</a>
      </div>
    </LoginShell>
  );
}
window.ScreenEmail = ScreenEmail;

// ────────────────────────────────────────────────────────────────────
// 2. Password entry
// ────────────────────────────────────────────────────────────────────
function ScreenPassword({ locale }) {
  const t = L[locale];
  const [show, setShow] = React.useState(false);
  return (
    <LoginShell locale={locale}>
      <IdentityChip email="satoshi@famgia.com" onSwitch={() => window.__nextScreen && window.__nextScreen("email")}/>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 22px", letterSpacing: -0.3 }}>{t.passwordTitle}</h1>
      <Field label={t.passwordLabel} right={
        <a href="#" style={{ fontSize: 11, color: "var(--brand-accent, var(--primary))", textDecoration: "none", fontWeight: 500 }}>{t.forgot}</a>
      }>
        <Input type={show ? "text" : "password"} defaultValue="•••••••••••••••" autoFocus
          leading={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
            </svg>
          }
          trailing={
            <button onClick={() => setShow(!show)} style={{ border: "none", background: "transparent", padding: 4, cursor: "pointer", color: "var(--muted-foreground)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {show
                  ? <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><path d="M2 2l20 20"/></>
                  : <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
          }/>
      </Field>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontSize: 13, color: "var(--foreground)" }}>
        <input type="checkbox" style={{ accentColor: "var(--brand-accent, var(--primary))" }}/>
        {t.rememberMe}
      </label>

      <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("mfa")}>{t.signIn}</PrimaryBtn>

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 11, color: "var(--muted-foreground)" }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dotted var(--muted-foreground)" }}>{t.notYou}</a>
      </div>
    </LoginShell>
  );
}
window.ScreenPassword = ScreenPassword;

// ────────────────────────────────────────────────────────────────────
// 3. MFA / OTP — 6-digit code
// ────────────────────────────────────────────────────────────────────
function ScreenMFA({ locale }) {
  const t = L[locale];
  const code = ["4","2","9","1","7","_"];
  return (
    <LoginShell locale={locale}>
      <IdentityChip email="satoshi@famgia.com" onSwitch={() => window.__nextScreen && window.__nextScreen("email")}/>
      <div style={{
        width: 44, height: 44, borderRadius: 10, marginBottom: 16,
        background: "color-mix(in oklch, var(--brand-accent, #eb6101) 12%, transparent)",
        color: "var(--brand-accent, #eb6101)",
        display: "grid", placeItems: "center",
      }}>
        <ShieldIcon/>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.3 }}>{t.mfaTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 22px", lineHeight: 1.5 }}>{t.mfaSubtitle}</p>

      <div className="row gap-2" style={{ marginBottom: 22, justifyContent: "space-between" }}>
        {code.map((c, i) => (
          <div key={i} style={{
            flex: 1, height: 56,
            border: "1px solid " + (c === "_" ? "var(--brand-accent, var(--primary))" : "var(--input)"),
            borderRadius: 10,
            background: c === "_" ? "color-mix(in oklch, var(--brand-accent, #eb6101) 4%, var(--background))" : "var(--input-background, var(--background))",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600,
            color: c === "_" ? "var(--muted-foreground)" : "var(--foreground)",
            boxShadow: c === "_" ? "0 0 0 3px color-mix(in oklch, var(--brand-accent, #eb6101) 14%, transparent)" : "none",
          }}>{c === "_" ? <span className="pulse">▍</span> : c}</div>
        ))}
      </div>

      <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("done-browser")}>{t.verify}</PrimaryBtn>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <a href="#" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>· {t.mfaResend}</a>
        <a href="#" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>{t.mfaUseBackup} ·</a>
      </div>
    </LoginShell>
  );
}
window.ScreenMFA = ScreenMFA;

// ────────────────────────────────────────────────────────────────────
// 4. Passkey
// ────────────────────────────────────────────────────────────────────
function ScreenPasskey({ locale }) {
  const t = L[locale];
  return (
    <LoginShell locale={locale}>
      <IdentityChip email="satoshi@famgia.com" onSwitch={() => window.__nextScreen && window.__nextScreen("email")}/>

      <div style={{ position: "relative", height: 132, marginBottom: 22, display: "grid", placeItems: "center" }}>
        {/* radar pulses */}
        {[0, 1, 2].map(i => (
          <div key={i} className="passkey-pulse" style={{
            position: "absolute", width: 132, height: 132, borderRadius: 99,
            border: "1px solid color-mix(in oklch, var(--brand-accent, #eb6101) 40%, transparent)",
            opacity: 0, animation: `passkey-pulse 2.2s ease-out ${i * 0.55}s infinite`,
          }}/>
        ))}
        <div style={{
          width: 78, height: 78, borderRadius: 99,
          background: "color-mix(in oklch, var(--brand-accent, #eb6101) 14%, transparent)",
          color: "var(--brand-accent, #eb6101)",
          display: "grid", placeItems: "center", position: "relative",
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 11v2a8 8 0 0 1-2 5"/>
            <path d="M6 18c2-2 2-5 2-7a4 4 0 0 1 7-3"/>
            <path d="M16 12v2a6 6 0 0 1-1 3"/>
            <path d="M3 12a9 9 0 0 1 15-6.7"/>
            <path d="M21 14a9 9 0 0 1-3.5 5.5"/>
          </svg>
        </div>
        <style>{`@keyframes passkey-pulse { 0% { opacity: 0.6; transform: scale(0.5); } 100% { opacity: 0; transform: scale(1.4); } }`}</style>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", textAlign: "center", letterSpacing: -0.3 }}>{t.passkeyTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 22px", textAlign: "center", lineHeight: 1.5 }}>{t.passkeySubtitle}</p>

      <PrimaryBtn onClick={() => window.__nextScreen && window.__nextScreen("done-browser")}>
        <FingerprintIcon/>
        {t.passkeyButton}
      </PrimaryBtn>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); window.__nextScreen && window.__nextScreen("password"); }}
          style={{ fontSize: 12, color: "var(--muted-foreground)", textDecoration: "none", borderBottom: "1px dotted var(--muted-foreground)" }}>{t.passkeyOther}</a>
      </div>
    </LoginShell>
  );
}
window.ScreenPasskey = ScreenPasskey;

// ────────────────────────────────────────────────────────────────────
// 5. SSO chooser — pick organization IdP
// ────────────────────────────────────────────────────────────────────
function ScreenSSO({ locale }) {
  const t = L[locale];
  const orgs = [
    { id: "famgia",   name: "famgia.com",        desc: "Keycloak · 全社", color: "#eb6101", initial: "F" },
    { id: "betoya",   name: "betoya.vn",          desc: "Keycloak · Vietnam Restaurant", color: "#009444", initial: "B" },
    { id: "godxlabs", name: "godx-labs.dev",      desc: "Google Workspace", color: "#4c6cb3", initial: "G" },
    { id: "tempo",    name: "tempo-systems.jp",   desc: "OIDC · Azure AD", color: "#68be8d", initial: "T" },
  ];
  return (
    <LoginShell locale={locale}>
      <div style={{ width: 44, height: 44, borderRadius: 10, marginBottom: 16,
        background: "color-mix(in oklch, var(--brand-accent, #eb6101) 12%, transparent)",
        color: "var(--brand-accent, #eb6101)",
        display: "grid", placeItems: "center" }}>
        <ShieldIcon/>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.3 }}>{t.ssoTitle}</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 18px", lineHeight: 1.5 }}>{t.ssoSubtitle}</p>

      <div className="col gap-2" style={{ marginBottom: 18 }}>
        {orgs.map(o => (
          <button key={o.id}
            onClick={() => window.__nextScreen && window.__nextScreen("done-browser")}
            className="row gap-3"
            style={{
              padding: "10px 12px", alignItems: "center", textAlign: "left",
              border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface-1, var(--background))",
              cursor: "pointer", transition: "background 120ms, border-color 120ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--muted-foreground)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-1, var(--background))"; e.currentTarget.style.borderColor = "var(--border)"; }}>
            <span style={{
              width: 32, height: 32, borderRadius: 6,
              background: "color-mix(in oklch, " + o.color + " 18%, transparent)",
              color: o.color,
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
            }}>{o.initial}</span>
            <div className="col grow" style={{ minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{o.name}</span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{o.desc}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      <button onClick={() => window.__nextScreen && window.__nextScreen("email")} style={{
        background: "transparent", border: "none", padding: 0,
        fontSize: 12, color: "var(--muted-foreground)", cursor: "pointer",
        fontFamily: "var(--font-sans-jp)",
      }}>← {locale === "ja" ? "別の方法で続行" : locale === "vi" ? "Quay lại cách khác" : "Back to other options"}</button>
    </LoginShell>
  );
}
window.ScreenSSO = ScreenSSO;
