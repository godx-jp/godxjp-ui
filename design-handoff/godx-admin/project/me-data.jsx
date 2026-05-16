/* global window */
/* Mock data for the godx-me personal page.
 *
 * Model: one user = one identity across the platform. The user collects
 * memberships to organizations over time (current + past), each granting
 * access to services. Payslips, tax records, etc. persist across employers
 * — leaving an org doesn't erase the data, only future access.
 */

const USER = {
  id: "u-yuki",
  name: "Yuki Tanaka",
  nameKana: "タナカ ユキ",
  nameRomaji: "Tanaka Yuki",
  initials: "YT",
  email: "yuki.tanaka@gmail.com",   // personal address — not an org domain
  emailVerified: true,
  emailSecondary: "yuki@famgia.com",
  phone: "+81 90-1234-5678",
  phoneVerified: true,
  birthDate: "1989-03-14",
  gender: "female",
  nationality: "JP",
  languages: ["ja", "en", "vi"],
  address: "東京都港区六本木 6-10-1",
  postalCode: "106-0032",
  joinedSystem: "2019-04-01",
  twoFactorEnabled: true,
  hasMyNumber: true,
  myNumberLast4: "••• ••• 8421",
  hasPasskey: true,
  avatarAccent: "oklch(56% 0.15 240)",
};

// Each membership describes the user inside one organization.
// services[] lists what the user can OPEN inside that org today.
// historicalServices[] lists what is READ-ONLY accessible after leaving (e.g. payslip history).
const MEMBERSHIPS = [
  {
    id: "m-famgia",
    orgId: "famgia",
    orgName: "Famgia",
    orgInitial: "F",
    orgColor: "#0077c7",
    role: "Owner",
    employeeId: "FG-0002",
    department: "Operations",
    branch: "本社 (HQ)",
    branchCode: "HQ-001",
    joinedAt: "2019-04-01",
    leftAt: null,
    status: "active",
    services: ["kintai", "task"],
    historicalServices: ["payslip", "tax"],
    isOwner: true,
  },
  {
    id: "m-betoya",
    orgId: "betoya",
    orgName: "Betoya F&B",
    orgInitial: "B",
    orgColor: "#009444",
    role: "Advisor",
    employeeId: "BTY-A-008",
    department: "—",
    branch: "Lê Lợi (HCM)",
    branchCode: "BTY-01",
    joinedAt: "2024-03-15",
    leftAt: null,
    status: "active",
    services: ["kintai"],
    historicalServices: ["payslip"],
    isOwner: false,
  },
  {
    id: "m-acme",
    orgId: "acme",
    orgName: "Acme Holdings",
    orgInitial: "A",
    orgColor: "#595857",
    role: "Engineer",
    employeeId: "AC-1142",
    department: "プロダクト開発部",
    branch: "東京本社",
    branchCode: "AC-HQ",
    joinedAt: "2015-04-01",
    leftAt: "2019-03-31",
    status: "past",
    reason: "退職",
    services: [],
    historicalServices: ["payslip", "tax"],
    isOwner: false,
  },
  {
    id: "m-nikko",
    orgId: "nikko",
    orgName: "Nikko Trading Co.",
    orgInitial: "N",
    orgColor: "#b94047",
    role: "Intern",
    employeeId: "NK-2201",
    department: "総務",
    branch: "京都支店",
    branchCode: "NK-KY",
    joinedAt: "2013-06-01",
    leftAt: "2014-03-31",
    status: "past",
    reason: "契約満了",
    services: [],
    historicalServices: ["payslip"],
    isOwner: false,
  },
];

// Pending invitations — show as a card on the dashboard.
const INVITATIONS = [
  {
    id: "inv-tempo",
    orgId: "tempo",
    orgName: "Tempo Inc.",
    orgInitial: "T",
    orgColor: "#5e3b9e",
    role: "Consultant",
    invitedBy: "佐藤 健太",
    invitedByEmail: "sato@tempo.jp",
    invitedAt: "2026-05-10",
    expiresAt: "2026-05-24",
    note: "業務委託としての参画をお願いいたします。週2日のリモート稼働を想定しています。",
    services: ["task"],
  },
  {
    id: "inv-saigon",
    orgId: "saigon-studio",
    orgName: "Saigon Studio",
    orgInitial: "S",
    orgColor: "#eb6101",
    role: "Designer",
    invitedBy: "An Nguyễn",
    invitedByEmail: "an.nguyen@saigonstudio.vn",
    invitedAt: "2026-05-14",
    expiresAt: "2026-05-28",
    note: "",
    services: ["task"],
  },
];

// Services catalog — same accent palette as console.
const SERVICES = {
  kintai:  { sticker: "勤", name: "勤怠管理",     accent: "oklch(58% 0.18 295)" },
  task:    { sticker: "課", name: "課題管理",     accent: "oklch(56% 0.15 240)" },
  payslip: { sticker: "給", name: "給与明細",     accent: "oklch(58% 0.159 150)" },
  tax:     { sticker: "税", name: "源泉徴収",     accent: "oklch(66% 0.19 45)"  },
};

// Payslips — across all employers, current and past. Sorted newest first.
const PAYSLIPS = [
  // Famgia (current)
  { id: "ps-2026-05-fg", period: "2026-05", periodLabel: "2026年5月分", orgId: "famgia", orgName: "Famgia",        gross: 580000, deductions: 162400, net: 417600, paidAt: "2026-05-25", status: "scheduled" },
  { id: "ps-2026-04-fg", period: "2026-04", periodLabel: "2026年4月分", orgId: "famgia", orgName: "Famgia",        gross: 580000, deductions: 162400, net: 417600, paidAt: "2026-04-25", status: "released" },
  { id: "ps-2026-03-fg", period: "2026-03", periodLabel: "2026年3月分", orgId: "famgia", orgName: "Famgia",        gross: 580000, deductions: 162400, net: 417600, paidAt: "2026-03-25", status: "released" },
  { id: "ps-2026-02-fg", period: "2026-02", periodLabel: "2026年2月分", orgId: "famgia", orgName: "Famgia",        gross: 560000, deductions: 156800, net: 403200, paidAt: "2026-02-25", status: "released" },
  { id: "ps-2026-01-fg", period: "2026-01", periodLabel: "2026年1月分", orgId: "famgia", orgName: "Famgia",        gross: 560000, deductions: 156800, net: 403200, paidAt: "2026-01-25", status: "released" },
  { id: "ps-2025-12-fg", period: "2025-12", periodLabel: "2025年12月分", orgId: "famgia", orgName: "Famgia",       gross: 920000, deductions: 247200, net: 672800, paidAt: "2025-12-25", status: "released", note: "賞与込み" },
  { id: "ps-2025-11-fg", period: "2025-11", periodLabel: "2025年11月分", orgId: "famgia", orgName: "Famgia",       gross: 560000, deductions: 156800, net: 403200, paidAt: "2025-11-25", status: "released" },
  { id: "ps-2025-10-fg", period: "2025-10", periodLabel: "2025年10月分", orgId: "famgia", orgName: "Famgia",       gross: 560000, deductions: 156800, net: 403200, paidAt: "2025-10-25", status: "released" },
  // Betoya (advisor — monthly retainer)
  { id: "ps-2026-04-bt", period: "2026-04", periodLabel: "2026年4月分", orgId: "betoya", orgName: "Betoya F&B",     gross:  80000, deductions:  16320, net:  63680, paidAt: "2026-05-05", status: "released", note: "顧問料" },
  { id: "ps-2026-03-bt", period: "2026-03", periodLabel: "2026年3月分", orgId: "betoya", orgName: "Betoya F&B",     gross:  80000, deductions:  16320, net:  63680, paidAt: "2026-04-05", status: "released", note: "顧問料" },
  { id: "ps-2026-02-bt", period: "2026-02", periodLabel: "2026年2月分", orgId: "betoya", orgName: "Betoya F&B",     gross:  80000, deductions:  16320, net:  63680, paidAt: "2026-03-05", status: "released", note: "顧問料" },
  // Acme (past — last paycheck)
  { id: "ps-2019-03-ac", period: "2019-03", periodLabel: "2019年3月分", orgId: "acme",   orgName: "Acme Holdings",  gross: 420000, deductions: 118400, net: 301600, paidAt: "2019-03-25", status: "final", note: "最終給与" },
  { id: "ps-2019-02-ac", period: "2019-02", periodLabel: "2019年2月分", orgId: "acme",   orgName: "Acme Holdings",  gross: 420000, deductions: 118400, net: 301600, paidAt: "2019-02-25", status: "final" },
  { id: "ps-2019-01-ac", period: "2019-01", periodLabel: "2019年1月分", orgId: "acme",   orgName: "Acme Holdings",  gross: 420000, deductions: 118400, net: 301600, paidAt: "2019-01-25", status: "final" },
];

// Year-end / tax-withholding documents (源泉徴収票).
const TAX_DOCS = [
  { id: "tax-2025", year: 2025, orgId: "famgia", orgName: "Famgia",        type: "源泉徴収票", issuedAt: "2026-01-15", grossYear: 7480000 },
  { id: "tax-2024", year: 2024, orgId: "famgia", orgName: "Famgia",        type: "源泉徴収票", issuedAt: "2025-01-15", grossYear: 7220000 },
  { id: "tax-2023", year: 2023, orgId: "famgia", orgName: "Famgia",        type: "源泉徴収票", issuedAt: "2024-01-15", grossYear: 6900000 },
  { id: "tax-2018", year: 2018, orgId: "acme",   orgName: "Acme Holdings", type: "源泉徴収票", issuedAt: "2019-01-31", grossYear: 5040000, archived: true },
  { id: "tax-2017", year: 2017, orgId: "acme",   orgName: "Acme Holdings", type: "源泉徴収票", issuedAt: "2018-01-31", grossYear: 4800000, archived: true },
];

// External account links (Google, Apple, LINE).
const EXTERNAL_LINKS = [
  { id: "google", provider: "Google",    email: "yuki.tanaka@gmail.com", status: "linked",    linkedAt: "2019-04-01", role: "primary" },
  { id: "apple",  provider: "Apple",     email: "yuki.t@icloud.com",     status: "linked",    linkedAt: "2022-09-12", role: "secondary" },
  { id: "line",   provider: "LINE",      email: "—",                     status: "not-linked", linkedAt: null,         role: null },
];

// Sessions / devices
const SESSIONS = [
  { id: "s-mac",  device: "MacBook Pro 14\"", os: "macOS 15.4", browser: "Chrome 128", ip: "203.0.113.42",  location: "東京",      lastSeen: "2分前",   current: true,  trusted: true },
  { id: "s-ipa",  device: "iPad Air",          os: "iPadOS 18",  browser: "Safari 18",  ip: "203.0.113.42",  location: "東京",      lastSeen: "今日 09:14", current: false, trusted: true },
  { id: "s-pix",  device: "Pixel 8",           os: "Android 15", browser: "Chrome 128", ip: "118.103.55.21", location: "TP. HCM",  lastSeen: "昨日",     current: false, trusted: true },
  { id: "s-old",  device: "Unknown",           os: "Windows 11", browser: "Edge 127",   ip: "45.79.211.8",   location: "Singapore", lastSeen: "5日前",   current: false, trusted: false },
];

// Notification preferences
const NOTIF_CATEGORIES = [
  { id: "payslip",  label: "給与明細の公開",        desc: "新しい給与明細が公開されたとき", email: true,  push: true,  inApp: true  },
  { id: "shift",    label: "シフト・勤務予定",      desc: "シフト割当・変更が確定したとき",  email: false, push: true,  inApp: true  },
  { id: "approval", label: "承認リクエスト",        desc: "申請に対する応答があったとき",    email: true,  push: true,  inApp: true  },
  { id: "invite",   label: "組織からの招待",        desc: "新しい組織への招待を受けたとき",  email: true,  push: false, inApp: true  },
  { id: "security", label: "セキュリティアラート", desc: "新しい端末からのサインインなど",   email: true,  push: true,  inApp: true  },
  { id: "marketing",label: "プロダクトの更新情報", desc: "新機能・メンテナンスのお知らせ",  email: false, push: false, inApp: false },
];

// Privacy — what each org can see about this user.
// Mirrors a real consent layer: PII vs business vs financial.
const PRIVACY_FIELDS = [
  { key: "name",      label: "氏名",         category: "基本",   required: true  },
  { key: "email",     label: "メール",       category: "基本",   required: true  },
  { key: "phone",     label: "電話番号",     category: "連絡先", required: false },
  { key: "address",   label: "住所",         category: "連絡先", required: false },
  { key: "birthDate", label: "生年月日",     category: "PII",    required: false },
  { key: "myNumber",  label: "マイナンバー", category: "PII",    required: false },
  { key: "salary",    label: "給与額",       category: "財務",   required: false },
];

// What each org actually sees — array of field keys.
const PRIVACY_GRANTS = {
  famgia:  ["name","email","phone","address","birthDate","myNumber","salary"],
  betoya:  ["name","email","phone","address"],
  acme:    ["name","email","birthDate"],                  // retained for tax history only
  nikko:   ["name","email"],
};

// Recent activity timeline — surfaces on Dashboard
const ACTIVITY = [
  { id: "a1", at: "今日 09:14", kind: "auth",     icon: "shieldCheck", text: "iPad Air から サインイン",       org: null },
  { id: "a2", at: "昨日",       kind: "payslip",  icon: "wallet",     text: "2026年4月分の給与明細を表示",    org: "Famgia" },
  { id: "a3", at: "5/10",     kind: "invite",   icon: "handshake",  text: "Tempo Inc. から招待を受領",       org: null },
  { id: "a4", at: "5/05",     kind: "payslip",  icon: "wallet",     text: "2026年4月分の給与明細が公開",     org: "Betoya F&B" },
  { id: "a5", at: "5/02",     kind: "privacy",  icon: "lock",       text: "プライバシー設定を更新",          org: null },
  { id: "a6", at: "4/28",     kind: "security", icon: "key",        text: "パスキー (MacBook) を追加",       org: null },
];

window.ME_DATA = {
  USER, MEMBERSHIPS, INVITATIONS, SERVICES, PAYSLIPS, TAX_DOCS,
  EXTERNAL_LINKS, SESSIONS, NOTIF_CATEGORIES, PRIVACY_FIELDS, PRIVACY_GRANTS, ACTIVITY,
};
