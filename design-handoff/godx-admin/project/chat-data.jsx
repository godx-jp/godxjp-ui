/* global React */
/* Chat mock data — VI + JP mix, godx-friendly */

const CHAT_USERS = [
  { id: "u1",  name: "Satoshi Fujimoto", short: "Satoshi", role: "Platform Lead", color: "oklch(60% 0.137 163)", status: "active" },
  { id: "u2",  name: "Naoki Nakamura",   short: "Naoki",   role: "Backend",        color: "oklch(56% 0.15 240)",  status: "active" },
  { id: "u3",  name: "Anh Khoa",         short: "Anh",     role: "Frontend",       color: "oklch(58% 0.18 25)",   status: "active" },
  { id: "u4",  name: "Mai Linh",         short: "Mai",     role: "PM · Betoya",    color: "oklch(58% 0.159 150)", status: "active" },
  { id: "u5",  name: "田中 美咲",         short: "Misaki",  role: "Designer",       color: "oklch(48% 0.16 285)",  status: "away" },
  { id: "u6",  name: "Quang Hùng",       short: "Hùng",    role: "Ops",            color: "oklch(50% 0.16 30)",   status: "dnd" },
  { id: "u7",  name: "佐藤 健",           short: "Ken",     role: "QA",             color: "oklch(55% 0.12 265)",  status: "offline" },
  { id: "u8",  name: "Phương Anh",       short: "Phương",  role: "HR",             color: "oklch(60% 0.13 200)",  status: "active" },
  { id: "me",  name: "Bạn",              short: "Bạn",     role: "Admin",          color: "oklch(56% 0.15 240)",  status: "active" },
];
window.CHAT_USERS = CHAT_USERS;
const U = Object.fromEntries(CHAT_USERS.map(u => [u.id, u]));
window.U = U;

// ── Workspaces (per tenant) ────────────────────────────────────────
const CHAT_WORKSPACES = [
  { id: "godx",    name: "godx",    label: "Famgia HQ",     color: "oklch(60% 0.137 163)", unread: 12 },
  { id: "kintai",  name: "kintai",  label: "dxs-kintai",    color: "oklch(56% 0.15 240)",  unread: 3 },
  { id: "tempo",   name: "tempo",   label: "dxs-tempo",     color: "oklch(48% 0.16 285)",  unread: 0 },
  { id: "betoya",  name: "betoya",  label: "Betoya VN",     color: "oklch(58% 0.159 150)", unread: 5 },
];
window.CHAT_WORKSPACES = CHAT_WORKSPACES;

// ── Channels for the active workspace (godx default) ───────────────
const CHAT_CHANNELS = {
  godx: [
    { id: "ch-general",  name: "general",          kind: "channel",  priv: false, unread: 0,  topic: "Famgia tổng hợp · 全員参加" },
    { id: "ch-eng",      name: "eng-platform",     kind: "channel",  priv: false, unread: 4,  topic: "Platform discussion" },
    { id: "ch-design",   name: "design-system",    kind: "channel",  priv: false, unread: 2,  topic: "godx-ui · tokens · ガイドライン" },
    { id: "ch-incidents",name: "incidents",        kind: "channel",  priv: false, unread: 0,  topic: "🚨 incident channel — page on red", muted: true },
    { id: "ch-deploy",   name: "deploy-bot",       kind: "channel",  priv: false, unread: 0,  topic: "auto · CI/CD notifications" },
    { id: "ch-vn",       name: "vn-team",          kind: "channel",  priv: false, unread: 6,  topic: "Team Việt Nam · daily standup" },
    { id: "ch-leads",    name: "leads",            kind: "channel",  priv: true,  unread: 0,  topic: "リード会議 · weekly sync" },
    { id: "ch-mochi",    name: "mochi-club",       kind: "channel",  priv: false, unread: 0,  topic: "🍡 雑談 · không-công-việc" },
  ],
  kintai:  [
    { id: "ch-kin-general", name: "kintai-general", kind: "channel", priv: false, unread: 1,  topic: "勤怠プロダクト" },
    { id: "ch-kin-bugs",    name: "bugs-triage",    kind: "channel", priv: false, unread: 2,  topic: "Triage · weekly Mon 10:00" },
  ],
  tempo:   [
    { id: "ch-tmp-general", name: "tempo-general",  kind: "channel", priv: false, unread: 0,  topic: "Tempo backend" },
  ],
  betoya:  [
    { id: "ch-bt-shifts",   name: "ca-lam-viec",    kind: "channel", priv: false, unread: 3,  topic: "Lịch ca · phân công" },
    { id: "ch-bt-supply",   name: "nguyen-lieu",    kind: "channel", priv: false, unread: 2,  topic: "Đặt hàng · nhập kho" },
  ],
};
window.CHAT_CHANNELS = CHAT_CHANNELS;

// ── DMs / Groups for active workspace ─────────────────────────────
const CHAT_DMS = {
  godx: [
    { id: "dm-u2",        kind: "dm",    users: ["u2"],          unread: 1, last: "Đã merge PR #482" },
    { id: "dm-u3",        kind: "dm",    users: ["u3"],          unread: 0, last: "Mai mình demo nhé" },
    { id: "dm-u4",        kind: "dm",    users: ["u4"],          unread: 3, last: "OK em check rồi nhé anh" },
    { id: "dm-u5",        kind: "dm",    users: ["u5"],          unread: 0, last: "デザイントークン更新済み" },
    { id: "dm-group-1",   kind: "group", users: ["u2","u3","u6"], name: "Release crew", unread: 2, last: "Hùng: cutoff 17:00" },
    { id: "dm-group-2",   kind: "group", users: ["u4","u8"],      name: "Betoya ops",   unread: 0, last: "Mai: tuần này…" },
  ],
  kintai: [
    { id: "dm-k-u2", kind: "dm", users: ["u2"], unread: 0, last: "Migration plan" },
  ],
  tempo: [],
  betoya: [
    { id: "dm-b-u4", kind: "dm", users: ["u4"], unread: 2, last: "Anh ơi check menu mới" },
  ],
};
window.CHAT_DMS = CHAT_DMS;

// ── Messages for the focused channel (eng-platform) ────────────────
const CHAT_MESSAGES = [
  { id: "m1",  user: "u5", ts: "10:02", date: "Hôm nay", text: "おはようございます ☀️ デザイントークンの更新を朝のうちに反映しました。`tokens-ext.css` をご確認ください。", reactions: [{ e: "👍", n: 3, mine: true }, { e: "🙏", n: 1 }] },
  { id: "m2",  user: "u2", ts: "10:08", date: "Hôm nay", text: "Naoki rebuild lại API endpoint cho shift export — bumped to v2. Old URL còn redirect tới end of month.", reactions: [{ e: "🚀", n: 2 }], thread: { count: 4, last: "11:22", users: ["u3","u6"] } },
  { id: "m3",  user: "u3", ts: "10:14", date: "Hôm nay", text: "Mọi người, em đang touch up component `<ChatComposer>` ở @design-system. Mention `@here` nếu thấy padding lệch nhé.", mention: "@here" },
  { id: "m4",  user: "u4", ts: "10:21", date: "Hôm nay", text: "Bên Betoya tuần này có 3 PO mới + 2 invoice cần ký. Em đăng lên `#nguyen-lieu` nha.", attachments: [{ kind: "doc", name: "PO-2026-W19.xlsx", size: "42 KB" }] },
  { id: "m5",  user: "u6", ts: "11:02", date: "Hôm nay", text: "Heads-up: thấy spike CPU trên `kintai-api` lúc 10:47. Đang điều tra — sẽ post update trong 30'.", pinned: true },
  { id: "m6",  user: "u2", ts: "11:18", date: "Hôm nay", text: "Đã narrow xuống N+1 query trên `/shifts?expand=staff`. Patch sẵn ở branch `hotfix/shift-n1`.", thread: { count: 2, last: "11:40", users: ["u6"] } },
  { id: "m7",  user: "u8", ts: "13:30", date: "Hôm nay", text: "Reminder: lễ 30/4 — VN team off Mon. JP team vẫn working. Ai bị block ping em.", attachments: [{ kind: "image", name: "holiday-poster.png", w: 240, h: 140 }] },
  { id: "m8",  user: "u1", ts: "14:05", date: "Hôm nay", text: "Tốt lắm cả team 👏. Cuối tuần này mình sẽ retro & plan sprint sau. @channel xem agenda trong `#leads`.", mention: "@channel", reactions: [{ e: "✅", n: 4 }, { e: "👀", n: 2 }, { e: "🌸", n: 1 }] },
  { id: "m9",  user: "u3", ts: "14:08", date: "Hôm nay", text: "OK anh. Em đang viết spec cho float chat button — sẽ drop link draft chiều nay.", thread: { count: 6, last: "14:55", users: ["u1","u5","u2"] } },
];
window.CHAT_MESSAGES = CHAT_MESSAGES;

// ── Thread replies for m9 ─────────────────────────────────────────
const CHAT_THREAD = {
  parentId: "m9",
  replies: [
    { id: "t1", user: "u1", ts: "14:12", text: "Nhớ cover dark mode + 4 tenant theme nha." },
    { id: "t2", user: "u3", ts: "14:18", text: "Vâng anh. Badge animation em đang test 2 option: pulse vs subtle bump.", reactions: [{ e: "👀", n: 2 }] },
    { id: "t3", user: "u5", ts: "14:31", text: "Pulse tốt cho urgent (incidents). Bump phù hợp cho DM thường — \u9054成感が低くて済む。" },
    { id: "t4", user: "u2", ts: "14:38", text: "Có thể expose 2 mode qua tweaks panel?" },
    { id: "t5", user: "u3", ts: "14:42", text: "Yeah em sẽ làm tweak. Default = bump." },
    { id: "t6", user: "u1", ts: "14:55", text: "Perfect. Ship đi 🚢" },
  ],
};
window.CHAT_THREAD = CHAT_THREAD;

// ── Recent conversations for mini-popup (sorted by recency) ────────
const MINI_RECENT = [
  { id: "ch-vn",      kind: "channel", name: "vn-team",       lastUser: "u4", last: "OK em check rồi nhé anh",    ts: "vừa xong", unread: 6, priv: false },
  { id: "dm-u4",      kind: "dm",      userId: "u4",                            last: "Em vừa gửi PO xong",         ts: "2 phút",  unread: 3 },
  { id: "ch-eng",     kind: "channel", name: "eng-platform",  lastUser: "u3", last: "Em đang viết spec cho…",      ts: "8 phút",  unread: 4, priv: false },
  { id: "dm-group-1", kind: "group",   groupName: "Release crew", userIds: ["u2","u3","u6"], last: "Hùng: cutoff 17:00", ts: "12 phút", unread: 2 },
  { id: "ch-design",  kind: "channel", name: "design-system", lastUser: "u5", last: "デザイントークン更新済み",   ts: "1 giờ",   unread: 2, priv: false },
  { id: "dm-u2",      kind: "dm",      userId: "u2",                            last: "Đã merge PR #482",           ts: "2 giờ",   unread: 1 },
  { id: "dm-u3",      kind: "dm",      userId: "u3",                            last: "Mai mình demo nhé",          ts: "Hôm qua", unread: 0 },
  { id: "ch-leads",   kind: "channel", name: "leads",         lastUser: "u1", last: "Agenda Q2 retro",             ts: "Hôm qua", unread: 0, priv: true },
];
window.MINI_RECENT = MINI_RECENT;
