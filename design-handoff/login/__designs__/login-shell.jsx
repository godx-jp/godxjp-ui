/* global React, I */
/* eslint-disable react/prop-types */

// ────────────────────────────────────────────────────────────────────
// Login flow — Zitadel-style auth UI, in godx wa-iro brand.
// All screens share LoginShell (godx wordmark + centered card + footer).
// Device flow screens use DeviceShell (chrome that mimics POS/KDS/CLI/browser).
// ────────────────────────────────────────────────────────────────────

const L = {
  ja: {
    title: "godx-admin にサインイン",
    emailTitle: "godx-admin にサインイン",
    emailSubtitle: "famgia.com のアカウントを使用します",
    emailLabel: "メールアドレス",
    emailHint: "user@famgia.com",
    next: "次へ",
    or: "または",
    google: "Google で続行",
    microsoft: "Microsoft で続行",
    passkey: "パスキーで続行",
    sso: "SSO で続行 (Keycloak)",
    register: "アカウントを作成",
    help: "サインインできない方は",
    passwordTitle: "パスワードを入力",
    passwordLabel: "パスワード",
    forgot: "パスワードを忘れた",
    rememberMe: "ログイン状態を保持",
    signIn: "サインイン",
    notYou: "本人ではない場合",
    mfaTitle: "二要素認証",
    mfaSubtitle: "認証アプリに表示された 6 桁のコードを入力してください",
    mfaResend: "コードを SMS で再送",
    mfaUseBackup: "バックアップコードを使う",
    verify: "認証",
    passkeyTitle: "パスキーで認証",
    passkeySubtitle: "デバイスのセキュリティキー、Touch ID、または Windows Hello を使用します",
    passkeyButton: "パスキーをかざす",
    passkeyOther: "別の方法でサインイン",
    ssoTitle: "組織の SSO で続行",
    ssoSubtitle: "famgia.com グループ全体で有効なシングルサインオン",
    deviceTitleDev: "デバイスを承認",
    deviceTitlePOS: "POS をネットワークに接続",
    deviceTitleKDS: "KDS をネットワークに接続",
    deviceTitleCLI: "godx CLI を承認",
    deviceCodeLabel: "デバイスコード",
    deviceInstr: "下記の URL を別のデバイスで開き、コードを入力してください",
    deviceVerifyUrl: "verify.famgia.com/device",
    waitingForApproval: "承認をお待ちしています…",
    cancel: "キャンセル",
    deviceCodeEntryTitle: "デバイスコードを入力",
    deviceCodeEntrySubtitle: "POS、KDS、または CLI に表示されている 8 桁のコードを入力してください",
    deviceCodeInput: "コード",
    deviceAuthorizeTitle: "このデバイスを承認しますか?",
    deviceAuthorizeSubtitle: "承認すると、このデバイスは下記の権限で godx-admin にアクセスできるようになります",
    deviceScopeRead: "プロダクト・プロジェクト情報の閲覧",
    deviceScopeWrite: "課題・PR・PDCA の作成と更新",
    deviceScopeAdmin: "メンバー・ドメイン管理 (オーナーのみ)",
    deviceMeta: "次の情報を共有します",
    deny: "拒否",
    approve: "このデバイスを承認",
    approvedTitle: "デバイスが承認されました",
    approvedSubtitle: "POS の画面に戻り、サインインを完了してください",
    completedDeviceTitle: "サインイン完了",
    completedDeviceSubtitle: "godx-admin に接続しました。この画面は閉じても構いません。",
    errorExpiredTitle: "コードの有効期限が切れました",
    errorExpiredSubtitle: "デバイスに新しいコードを表示し、再度お試しください",
    errorDeniedTitle: "サインインが拒否されました",
    errorDeniedSubtitle: "デバイスでの承認が拒否されました。デバイス側で再度お試しいただくか、管理者にお問い合わせください。",
    errorWrongCodeTitle: "コードが正しくありません",
    errorWrongCodeSubtitle: "入力したコードを確認してください。コードはデバイスの画面に 5 分間表示されます。",
    retry: "もう一度",
    backToDevice: "デバイスに戻る",
    contactAdmin: "管理者に連絡",
    secured: "Zitadel + famgia.com SSO により保護",
  },
  en: {
    title: "Sign in to godx-admin",
    emailTitle: "Sign in to godx-admin",
    emailSubtitle: "Use your famgia.com account",
    emailLabel: "Email",
    emailHint: "user@famgia.com",
    next: "Next",
    or: "or",
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
    passkey: "Continue with passkey",
    sso: "Continue with SSO (Keycloak)",
    register: "Create account",
    help: "Trouble signing in?",
    passwordTitle: "Enter password",
    passwordLabel: "Password",
    forgot: "Forgot password",
    rememberMe: "Keep me signed in",
    signIn: "Sign in",
    notYou: "Not you?",
    mfaTitle: "Two-factor authentication",
    mfaSubtitle: "Enter the 6-digit code from your authenticator app",
    mfaResend: "Resend code via SMS",
    mfaUseBackup: "Use backup code",
    verify: "Verify",
    passkeyTitle: "Sign in with passkey",
    passkeySubtitle: "Use your security key, Touch ID, or Windows Hello",
    passkeyButton: "Hold passkey",
    passkeyOther: "Sign in another way",
    ssoTitle: "Continue with SSO",
    ssoSubtitle: "Single sign-on for the famgia.com group",
    deviceTitleDev: "Authorize a device",
    deviceTitlePOS: "Connect POS to network",
    deviceTitleKDS: "Connect KDS to network",
    deviceTitleCLI: "Authorize godx CLI",
    deviceCodeLabel: "Device code",
    deviceInstr: "Open the URL below on another device and enter the code",
    deviceVerifyUrl: "verify.famgia.com/device",
    waitingForApproval: "Waiting for approval…",
    cancel: "Cancel",
    deviceCodeEntryTitle: "Enter device code",
    deviceCodeEntrySubtitle: "Enter the 8-character code shown on your POS, KDS, or CLI",
    deviceCodeInput: "Code",
    deviceAuthorizeTitle: "Authorize this device?",
    deviceAuthorizeSubtitle: "Once approved this device can access godx-admin with the following scope",
    deviceScopeRead: "Read product and project info",
    deviceScopeWrite: "Create and update issues, PRs, PDCA",
    deviceScopeAdmin: "Manage members and domains (owners only)",
    deviceMeta: "The following will be shared",
    deny: "Deny",
    approve: "Authorize this device",
    approvedTitle: "Device authorized",
    approvedSubtitle: "Return to the POS screen to finish signing in",
    completedDeviceTitle: "Sign-in complete",
    completedDeviceSubtitle: "godx-admin is connected. You may close this window.",
    errorExpiredTitle: "Code has expired",
    errorExpiredSubtitle: "Display a new code on the device and try again",
    errorDeniedTitle: "Sign-in denied",
    errorDeniedSubtitle: "The device authorization was rejected. Try again on the device, or contact your admin.",
    errorWrongCodeTitle: "Code is incorrect",
    errorWrongCodeSubtitle: "Check the code you entered. The code stays visible on the device for 5 minutes.",
    retry: "Try again",
    backToDevice: "Back to device",
    contactAdmin: "Contact admin",
    secured: "Secured by Zitadel + famgia.com SSO",
  },
  vi: {
    title: "Đăng nhập godx-admin",
    emailTitle: "Đăng nhập godx-admin",
    emailSubtitle: "Dùng tài khoản famgia.com của bạn",
    emailLabel: "Email",
    emailHint: "user@famgia.com",
    next: "Tiếp",
    or: "hoặc",
    google: "Tiếp tục với Google",
    microsoft: "Tiếp tục với Microsoft",
    passkey: "Dùng passkey",
    sso: "Tiếp tục với SSO (Keycloak)",
    register: "Tạo tài khoản",
    help: "Không đăng nhập được?",
    passwordTitle: "Nhập mật khẩu",
    passwordLabel: "Mật khẩu",
    forgot: "Quên mật khẩu",
    rememberMe: "Giữ đăng nhập",
    signIn: "Đăng nhập",
    notYou: "Không phải bạn?",
    mfaTitle: "Xác thực 2 lớp",
    mfaSubtitle: "Nhập mã 6 chữ số từ ứng dụng xác thực",
    mfaResend: "Gửi lại mã qua SMS",
    mfaUseBackup: "Dùng mã dự phòng",
    verify: "Xác thực",
    passkeyTitle: "Đăng nhập bằng passkey",
    passkeySubtitle: "Dùng security key, Touch ID, hoặc Windows Hello",
    passkeyButton: "Chạm passkey",
    passkeyOther: "Đăng nhập kiểu khác",
    ssoTitle: "Tiếp tục với SSO",
    ssoSubtitle: "Đăng nhập một lần cho cả group famgia.com",
    deviceTitleDev: "Cấp quyền thiết bị",
    deviceTitlePOS: "Kết nối POS vào mạng",
    deviceTitleKDS: "Kết nối KDS vào mạng",
    deviceTitleCLI: "Cấp quyền godx CLI",
    deviceCodeLabel: "Mã thiết bị",
    deviceInstr: "Mở URL bên dưới trên thiết bị khác và nhập mã",
    deviceVerifyUrl: "verify.famgia.com/device",
    waitingForApproval: "Đang chờ phê duyệt…",
    cancel: "Huỷ",
    deviceCodeEntryTitle: "Nhập mã thiết bị",
    deviceCodeEntrySubtitle: "Nhập mã 8 ký tự hiển thị trên POS, KDS hoặc CLI",
    deviceCodeInput: "Mã",
    deviceAuthorizeTitle: "Cấp quyền cho thiết bị này?",
    deviceAuthorizeSubtitle: "Sau khi phê duyệt, thiết bị sẽ có quyền truy cập godx-admin với phạm vi sau",
    deviceScopeRead: "Đọc thông tin sản phẩm và dự án",
    deviceScopeWrite: "Tạo và cập nhật issue, PR, PDCA",
    deviceScopeAdmin: "Quản lý thành viên và domain (chỉ owner)",
    deviceMeta: "Thông tin sau sẽ được chia sẻ",
    deny: "Từ chối",
    approve: "Cấp quyền thiết bị này",
    approvedTitle: "Đã cấp quyền thiết bị",
    approvedSubtitle: "Quay lại màn hình POS để hoàn tất đăng nhập",
    completedDeviceTitle: "Đăng nhập hoàn tất",
    completedDeviceSubtitle: "godx-admin đã được kết nối. Bạn có thể đóng cửa sổ này.",
    errorExpiredTitle: "Mã đã hết hạn",
    errorExpiredSubtitle: "Hiển thị mã mới trên thiết bị và thử lại",
    errorDeniedTitle: "Đăng nhập bị từ chối",
    errorDeniedSubtitle: "Yêu cầu cấp quyền thiết bị đã bị từ chối. Thử lại trên thiết bị hoặc liên hệ admin.",
    errorWrongCodeTitle: "Mã không đúng",
    errorWrongCodeSubtitle: "Kiểm tra lại mã. Mã sẽ hiển thị trên thiết bị trong 5 phút.",
    retry: "Thử lại",
    backToDevice: "Về thiết bị",
    contactAdmin: "Liên hệ admin",
    secured: "Bảo mật bởi Zitadel + famgia.com SSO",
  },
};
window.L = L;

// ────────────────────────────────────────────────────────────────────
// Brand mark — godx wordmark
// ────────────────────────────────────────────────────────────────────
function GodxMark({ size = 32 }) {
  return (
    <div className="row gap-2" style={{ alignItems: "center" }}>
      <span style={{
        width: size, height: size, borderRadius: 6,
        background: "var(--brand-accent, #eb6101)",
        color: "white",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", fontWeight: 700,
        fontSize: Math.round(size * 0.48),
        letterSpacing: -0.5,
        boxShadow: "0 1px 0 oklch(0 0 0 / 0.04), 0 6px 14px oklch(0 0 0 / 0.06)",
      }}>g</span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize: Math.round(size * 0.52),
        letterSpacing: -0.3,
        color: "var(--foreground)",
      }}>godx<span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>-admin</span></span>
    </div>
  );
}
window.GodxMark = GodxMark;

// ────────────────────────────────────────────────────────────────────
// LoginShell — godx-branded centered card wrapper.
// All browser-flow screens render inside this.
// ────────────────────────────────────────────────────────────────────
function LoginShell({ children, locale, footer = true, cardWidth = 420, dense = false }) {
  const t = L[locale];
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "var(--font-sans-jp)",
      display: "flex", flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle wa-iro mesh — Japanese paper grain feel */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
        background:
          "radial-gradient(800px 400px at 12% -10%, color-mix(in oklch, var(--brand-accent, #eb6101) 8%, transparent), transparent 60%)," +
          "radial-gradient(700px 480px at 105% 110%, color-mix(in oklch, #4c6cb3 6%, transparent), transparent 65%)",
      }}/>
      {/* Header strip */}
      <header style={{
        position: "relative", zIndex: 1,
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <GodxMark size={28}/>
        <a href="https://godx.famgia.com" style={{
          fontSize: 12, color: "var(--muted-foreground)",
          fontFamily: "var(--font-mono)",
          textDecoration: "none",
        }}>godx.famgia.com ↗</a>
      </header>

      {/* Card */}
      <main style={{
        position: "relative", zIndex: 1,
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: dense ? "8px 24px 16px" : "16px 24px 24px",
        minHeight: 0,
      }}>
        <div style={{
          width: cardWidth, maxWidth: "100%",
          background: "var(--surface-1, var(--card))",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: dense ? "28px 28px 22px" : "32px 32px 26px",
          boxShadow: "0 1px 0 oklch(0 0 0 / 0.02), 0 12px 32px oklch(0 0 0 / 0.06)",
        }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer style={{
          position: "relative", zIndex: 1,
          padding: "14px 28px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 11, color: "var(--muted-foreground)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{t.secured}</span>
          <div className="row gap-3" style={{ alignItems: "center" }}>
            <span className="row gap-1" style={{ alignItems: "center", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              <span style={{ opacity: locale === "ja" ? 1 : 0.4, fontWeight: locale === "ja" ? 600 : 400 }}>JA</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span style={{ opacity: locale === "en" ? 1 : 0.4, fontWeight: locale === "en" ? 600 : 400 }}>EN</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span style={{ opacity: locale === "vi" ? 1 : 0.4, fontWeight: locale === "vi" ? 600 : 400 }}>VI</span>
            </span>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
          </div>
        </footer>
      )}
    </div>
  );
}
window.LoginShell = LoginShell;

// ────────────────────────────────────────────────────────────────────
// Form primitives
// ────────────────────────────────────────────────────────────────────
const Field = ({ label, hint, error, children }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <span style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--foreground)" }}>{label}</span>
    {children}
    {hint && !error && <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>{hint}</span>}
    {error && <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--destructive)" }}>{error}</span>}
  </label>
);

const TextInput = ({ icon, suffix, ...props }) => (
  <span style={{
    display: "flex", alignItems: "center",
    height: 44, padding: "0 12px",
    border: "1px solid var(--input)", borderRadius: 8,
    background: "var(--input-background, var(--background))",
    transition: "border-color 120ms, box-shadow 120ms",
  }}>
    {icon && <span style={{ marginRight: 8, color: "var(--muted-foreground)", display: "flex" }}>{icon}</span>}
    <input {...props}
      style={{
        flex: 1, border: "none", outline: "none", background: "transparent",
        fontSize: 14, fontFamily: "var(--font-sans-jp)", color: "var(--foreground)",
        ...(props.style || {}),
      }}/>
    {suffix && <span style={{ marginLeft: 8, color: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{suffix}</span>}
  </span>
);

const PrimaryBtn = ({ children, onClick, disabled, style }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      width: "100%", height: 44,
      borderRadius: 8, border: "1px solid transparent",
      background: "var(--brand-accent, var(--primary))",
      color: "white", fontWeight: 600, fontSize: 14,
      fontFamily: "var(--font-sans-jp)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "0 1px 0 oklch(0 0 0 / 0.04)",
      transition: "filter 120ms, transform 60ms",
      ...style,
    }}
    onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = "brightness(0.94)")}
    onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}>
    {children}
  </button>
);
window.PrimaryBtn = PrimaryBtn;

const GhostBtn = ({ children, onClick, icon, mono }) => (
  <button onClick={onClick}
    style={{
      width: "100%", height: 42,
      borderRadius: 8, border: "1px solid var(--border)",
      background: "var(--surface-1, var(--background))",
      color: "var(--foreground)", fontWeight: 500, fontSize: 13,
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans-jp)",
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      transition: "background 120ms",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
    onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface-1, var(--background))"}>
    {icon}
    {children}
  </button>
);
window.GhostBtn = GhostBtn;

const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: "var(--muted-foreground)" }}>
    <span style={{ flex: 1, height: 1, background: "var(--border)" }}/>
    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
    <span style={{ flex: 1, height: 1, background: "var(--border)" }}/>
  </div>
);
window.Divider = Divider;

// Cute SVG icons used inside buttons
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
    <path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <rect width="7" height="7" fill="#F25022"/>
    <rect x="9" width="7" height="7" fill="#7FBA00"/>
    <rect y="9" width="7" height="7" fill="#00A4EF"/>
    <rect x="9" y="9" width="7" height="7" fill="#FFB900"/>
  </svg>
);

const FingerprintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11v2a8 8 0 0 1-2 5"/>
    <path d="M6 18c2-2 2-5 2-7a4 4 0 0 1 7-3"/>
    <path d="M16 12v2a6 6 0 0 1-1 3"/>
    <path d="M3 12a9 9 0 0 1 15-6.7"/>
    <path d="M21 14a9 9 0 0 1-3.5 5.5"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

window.GoogleIcon = GoogleIcon;
window.MicrosoftIcon = MicrosoftIcon;
window.FingerprintIcon = FingerprintIcon;
window.ShieldIcon = ShieldIcon;

// Helper: SVG QR code (decorative — non-functional, but reads as a QR)
function FakeQR({ size = 132, dataSeed = "VERIFY-FAMGIA-DEVICE-ABCD-EFGH" }) {
  // Deterministic pseudo-random pattern from seed
  const cells = 25;
  const pattern = [];
  let s = 0;
  for (let i = 0; i < dataSeed.length; i++) s = (s * 31 + dataSeed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < cells * cells; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    pattern.push((s & 0xff) < 130);
  }
  const cell = size / cells;
  const fg = "var(--foreground)";
  // Force corner markers
  const isCornerMarker = (r, c) => {
    const inSq = (r0, c0) => (r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7);
    if (!inSq(0, 0) && !inSq(0, cells - 7) && !inSq(cells - 7, 0)) return null;
    const r0 = r < 7 ? 0 : cells - 7;
    const c0 = c < 7 ? 0 : cells - 7;
    const rr = r - r0, cc = c - c0;
    const border = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const inner = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return border || inner;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ shapeRendering: "crispEdges" }}>
      <rect width={size} height={size} fill="var(--surface-1, var(--background))"/>
      {pattern.map((on, i) => {
        const r = Math.floor(i / cells), c = i % cells;
        const cm = isCornerMarker(r, c);
        const filled = cm === null ? on : cm;
        if (!filled) return null;
        return <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill={fg}/>;
      })}
      {/* Center godx mark */}
      <rect x={size/2 - 14} y={size/2 - 14} width={28} height={28} fill="var(--surface-1, var(--background))"/>
      <rect x={size/2 - 11} y={size/2 - 11} width={22} height={22} rx={4} fill="var(--brand-accent, #eb6101)"/>
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fontWeight={700} fill="white">g</text>
    </svg>
  );
}
window.FakeQR = FakeQR;
