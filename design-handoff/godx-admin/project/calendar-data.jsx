/* global window */
/* eslint-disable react/prop-types */
/* ============================================================================
 * 暦 Koyomi — Calendar service · mock data
 *
 * Service identity inside the Famgia platform:
 *   sticker "暦"  · accent oklch(55% 0.12 220) (浅葱 asagi — a calm teal)
 *   distinct from kintai (purple), task (blue), payslip (green), tax (orange).
 *
 * Time anchor for the mockup:
 *   Wed 2026-05-20  ← "today"
 *   week window: Mon 5/18 .. Sun 5/24
 * ========================================================================= */

// ── Calendars the user can see (own + subscribed + shared) ─────────────────
const CALENDARS = [
  // Personal / from this user
  { id: "me",        name: "Yuki Tanaka",          owner: "self",   color: "#1e50a2", group: "mine",   shown: true },
  { id: "personal",  name: "Cá nhân",              owner: "self",   color: "#68be8d", group: "mine",   shown: true },
  { id: "focus",     name: "Focus time",           owner: "self",   color: "#595857", group: "mine",   shown: true },

  // Org calendars — surfaced from Famgia / Godx / Betoya / Tempo memberships
  { id: "godx-prod", name: "godx-admin · Product", owner: "org",    color: "#4c6cb3", group: "org",    shown: true,  org: "godx" },
  { id: "godx-eng",  name: "godx-admin · Eng",     owner: "org",    color: "#165e83", group: "org",    shown: true,  org: "godx" },
  { id: "famgia",    name: "Famgia · Company",     owner: "org",    color: "#b94047", group: "org",    shown: true,  org: "famgia" },
  { id: "betoya",    name: "Betoya F&B",           owner: "org",    color: "#009444", group: "org",    shown: false, org: "betoya" },
  { id: "tempo",     name: "Tempo Inc.",           owner: "org",    color: "#7c3aed", group: "org",    shown: false, org: "tempo" },

  // Shared / external (read-only or invited)
  { id: "ha",        name: "Hà · cá nhân",         owner: "shared", color: "#eb6101", group: "shared", shown: true,  sharedBy: "Hà Nguyễn" },
  { id: "hol-jp",    name: "Ngày lễ Nhật Bản",     owner: "ext",    color: "#949495", group: "shared", shown: true,  readonly: true },
  { id: "hol-vn",    name: "Ngày lễ Việt Nam",     owner: "ext",    color: "#949495", group: "shared", shown: false, readonly: true },
];

// ── Attendees pool ─────────────────────────────────────────────────────────
const PEOPLE = [
  { id: "yuki",   name: "Yuki Tanaka",     short: "YT", email: "yuki@famgia.com",  org: "Famgia", role: "PM",        color: "#1e50a2", self: true },
  { id: "ha",     name: "Hà Nguyễn",       short: "HN", email: "ha@famgia.com",    org: "Famgia", role: "Designer",  color: "#eb6101" },
  { id: "minh",   name: "Minh Phạm",       short: "MP", email: "minh@famgia.com",  org: "Famgia", role: "Engineer",  color: "#4c6cb3" },
  { id: "satoshi",name: "佐藤 聡",          short: "聡", email: "sato@famgia.com",  org: "Famgia", role: "Director",  color: "#165e83" },
  { id: "linh",   name: "Linh Trần",       short: "LT", email: "linh@betoya.com",  org: "Betoya", role: "Operations",color: "#009444" },
  { id: "kenji",  name: "Kenji Saito",     short: "KS", email: "kenji@tempo.co.jp",org: "Tempo",  role: "CTO",       color: "#7c3aed" },
  { id: "amy",    name: "Amy Chen",        short: "AC", email: "amy@acme.com",     org: "Acme",   role: "Buyer",     color: "#b94047" },
];

// ── Helpers used by views ──────────────────────────────────────────────────
const TODAY = { y: 2026, m: 5, d: 20 }; // Wed 2026-05-20
const WEEK_START = { y: 2026, m: 5, d: 18 }; // Mon

// Y-M-D string for keying
const ymd = (y, m, d) => `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

// ── Events (timed + all-day) for the visible week ──────────────────────────
// Each event: { id, calId, title, start: "HH:MM", end: "HH:MM" | null (all-day),
//   date: "YYYY-MM-DD", allDay: bool, location?, attendees: [personId],
//   status: "accepted"|"tentative"|"declined"|"organizer", note?, type: "meet"|"focus"|"customer"|"personal"|"company" }
const EVENTS = [
  // ── Mon 5/18 ─────────────────────────────────────────────────────────────
  { id: "e-101", calId: "godx-eng",  title: "Daily standup",                date: ymd(2026,5,18), start: "09:30", end: "10:00", attendees: ["yuki","minh","satoshi"], status: "organizer", type: "meet", location: "Zoom · Eng" },
  { id: "e-102", calId: "godx-prod", title: "1:1 với 佐藤 (PM ↔ Director)",   date: ymd(2026,5,18), start: "10:00", end: "11:00", attendees: ["yuki","satoshi"], status: "accepted", type: "meet", location: "渋谷オフィス 4F · Room 蘭" },
  { id: "e-103", calId: "focus",     title: "Deep work · Q3 brief",         date: ymd(2026,5,18), start: "11:30", end: "13:00", attendees: ["yuki"], status: "organizer", type: "focus" },
  { id: "e-104", calId: "godx-prod", title: "Sprint planning · onboarding", date: ymd(2026,5,18), start: "14:00", end: "15:30", attendees: ["yuki","ha","minh"], status: "organizer", type: "meet", location: "Zoom" },
  { id: "e-105", calId: "personal",  title: "Yoga · 中目黒",                  date: ymd(2026,5,18), start: "18:30", end: "19:30", attendees: ["yuki"], status: "organizer", type: "personal" },

  // ── Tue 5/19 ─────────────────────────────────────────────────────────────
  { id: "e-110", calId: "godx-eng",  title: "🚧 Release freeze · godx 2.1", date: ymd(2026,5,19), allDay: true, attendees: ["yuki","minh","satoshi"], status: "accepted", type: "company" },
  { id: "e-111", calId: "godx-eng",  title: "Coffee Q&A (optional)",         date: ymd(2026,5,19), start: "09:00", end: "09:30", attendees: ["yuki","minh"], status: "tentative", type: "meet", location: "1F カフェ" },
  { id: "e-112", calId: "godx-prod", title: "Design review · godx 2.1",     date: ymd(2026,5,19), start: "11:00", end: "12:00", attendees: ["yuki","ha","minh","satoshi"], status: "organizer", type: "meet", location: "Figma · godx-2.1" },
  { id: "e-113", calId: "personal",  title: "Lunch với Hà",                  date: ymd(2026,5,19), start: "12:00", end: "13:00", attendees: ["yuki","ha"], status: "accepted", type: "personal", location: "Betoya 渋谷" },
  { id: "e-114", calId: "godx-prod", title: "Customer · Betoya HCM demo",   date: ymd(2026,5,19), start: "15:00", end: "16:00", attendees: ["yuki","linh","satoshi"], status: "organizer", type: "customer", location: "Zoom · VN" },
  { id: "e-115", calId: "godx-eng",  title: "Retro · onboarding squad",     date: ymd(2026,5,19), start: "17:00", end: "17:30", attendees: ["yuki","ha","minh"], status: "accepted", type: "meet" },

  // ── Wed 5/20 (today) ─────────────────────────────────────────────────────
  { id: "e-120", calId: "godx-prod", title: "Morning brief",                date: ymd(2026,5,20), start: "08:30", end: "09:00", attendees: ["yuki","minh","satoshi"], status: "organizer", type: "meet" },
  { id: "e-121", calId: "godx-prod", title: "Product strategy · Q3",        date: ymd(2026,5,20), start: "10:00", end: "11:30", attendees: ["yuki","satoshi","ha"], status: "organizer", type: "meet", location: "渋谷 4F · Room 桜" },
  { id: "e-122", calId: "personal",  title: "Lunch",                         date: ymd(2026,5,20), start: "12:30", end: "13:00", attendees: ["yuki"], status: "organizer", type: "personal" },
  { id: "e-123", calId: "famgia",    title: "Interview · Frontend candidate", date: ymd(2026,5,20), start: "14:00", end: "14:45", attendees: ["yuki","ha","minh"], status: "organizer", type: "meet", location: "Zoom · candidate" },
  { id: "e-124", calId: "godx-prod", title: "Customer · Tempo VN onboarding", date: ymd(2026,5,20), start: "15:00", end: "16:00", attendees: ["yuki","kenji","satoshi"], status: "organizer", type: "customer", location: "Zoom · 東京⇄HCM" },
  { id: "e-125", calId: "godx-prod", title: "1:1 với Tanaka-san",            date: ymd(2026,5,20), start: "16:30", end: "17:00", attendees: ["yuki","satoshi"], status: "accepted", type: "meet" },
  { id: "e-126", calId: "personal",  title: "Tiếng Việt · lớp B2",           date: ymd(2026,5,20), start: "19:00", end: "20:00", attendees: ["yuki"], status: "organizer", type: "personal", location: "ZoomVN" },

  // ── Thu 5/21 ─────────────────────────────────────────────────────────────
  { id: "e-130", calId: "personal",  title: "Hà · nghỉ phép",                date: ymd(2026,5,21), allDay: true, attendees: ["ha"], status: "accepted", type: "personal" },
  { id: "e-131", calId: "famgia",    title: "Eng all-hands",                 date: ymd(2026,5,21), start: "10:00", end: "11:00", attendees: ["yuki","minh","satoshi"], status: "accepted", type: "company", location: "Zoom · All-hands" },
  { id: "e-132", calId: "godx-prod", title: "Pricing workshop",              date: ymd(2026,5,21), start: "13:00", end: "14:30", attendees: ["yuki","satoshi"], status: "organizer", type: "meet", location: "渋谷 4F · Room 蘭" },
  { id: "e-133", calId: "famgia",    title: "Vendor call · Stripe",         date: ymd(2026,5,21), start: "15:30", end: "16:00", attendees: ["yuki","minh"], status: "accepted", type: "meet" },
  { id: "e-134", calId: "focus",     title: "Deep work · Q3 doc",            date: ymd(2026,5,21), start: "16:30", end: "18:00", attendees: ["yuki"], status: "organizer", type: "focus" },

  // ── Fri 5/22 ─────────────────────────────────────────────────────────────
  { id: "e-140", calId: "godx-eng",  title: "Demo day · sprint 24",          date: ymd(2026,5,22), start: "09:00", end: "10:00", attendees: ["yuki","minh","ha","satoshi"], status: "accepted", type: "meet", location: "Zoom + 4F 桜" },
  { id: "e-141", calId: "godx-prod", title: "Customer · Acme revisit",       date: ymd(2026,5,22), start: "11:00", end: "12:00", attendees: ["yuki","amy","satoshi"], status: "organizer", type: "customer", location: "Zoom" },
  { id: "e-142", calId: "focus",     title: "Deep work · Q3 plan",           date: ymd(2026,5,22), start: "14:00", end: "17:00", attendees: ["yuki"], status: "organizer", type: "focus" },
  { id: "e-143", calId: "famgia",    title: "Pay-day standup",               date: ymd(2026,5,22), start: "17:30", end: "18:00", attendees: ["yuki","satoshi"], status: "accepted", type: "company" },

  // ── Sat–Sun 5/23–24 — offsite ────────────────────────────────────────────
  { id: "e-150", calId: "famgia",    title: "🏔 開発合宿 · 箱根",             date: ymd(2026,5,23), allDay: true, attendees: ["yuki","minh","ha","satoshi"], status: "accepted", type: "company" },
  { id: "e-151", calId: "famgia",    title: "🏔 開発合宿 · 箱根",             date: ymd(2026,5,24), allDay: true, attendees: ["yuki","minh","ha","satoshi"], status: "accepted", type: "company" },
  { id: "e-152", calId: "godx-eng",  title: "Team dinner · Betoya 渋谷",     date: ymd(2026,5,23), start: "18:00", end: "21:00", attendees: ["yuki","minh","ha","satoshi","linh"], status: "accepted", type: "personal", location: "Betoya 渋谷店" },

  // ── A few items in adjacent weeks so the month view has texture ──────────
  { id: "e-200", calId: "hol-jp",    title: "海の日 (đề xuất)",               date: ymd(2026,5,11), allDay: true, attendees: [], status: "accepted", type: "company" },
  { id: "e-201", calId: "godx-prod", title: "QBR · Q1",                       date: ymd(2026,5, 6), start: "14:00", end: "16:00", attendees: ["yuki","satoshi"], status: "accepted", type: "meet" },
  { id: "e-202", calId: "godx-eng",  title: "Demo day",                       date: ymd(2026,5, 8), start: "09:00", end: "10:00", attendees: ["yuki","minh"], status: "accepted", type: "meet" },
  { id: "e-203", calId: "famgia",    title: "Town hall",                      date: ymd(2026,5,13), start: "16:00", end: "17:00", attendees: ["yuki"], status: "accepted", type: "company" },
  { id: "e-204", calId: "personal",  title: "Sinh nhật Minh",                 date: ymd(2026,5,14), allDay: true, attendees: ["minh"], status: "accepted", type: "personal" },
  { id: "e-205", calId: "godx-prod", title: "Roadmap Q3 lock",                date: ymd(2026,5,29), start: "10:00", end: "12:00", attendees: ["yuki","satoshi","ha"], status: "organizer", type: "meet" },
  { id: "e-206", calId: "famgia",    title: "月末締め",                       date: ymd(2026,5,31), allDay: true, attendees: [], status: "accepted", type: "company" },

  // June peek
  { id: "e-220", calId: "godx-prod", title: "godx 2.1 GA",                    date: ymd(2026,6, 2), allDay: true, attendees: [], status: "accepted", type: "company" },
  { id: "e-221", calId: "godx-eng",  title: "All-hands",                      date: ymd(2026,6, 4), start: "10:00", end: "11:00", attendees: ["yuki"], status: "accepted", type: "company" },
];

// ── Working-hours availability (for the "Find a time" panel) ───────────────
// 30-min slots Mon..Fri 09:00–18:00 — 0 = free, 1 = tentative, 2 = busy
const AVAILABILITY = (() => {
  const slots = []; // 18 slots/day × 5 days
  for (let s = 0; s < 18; s++) slots.push(s);
  // Build per-person blocks for Wed 5/20 by reading EVENTS above
  const grid = {};
  for (const p of PEOPLE) grid[p.id] = Array(18).fill(0);
  const slotIndex = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return Math.max(0, Math.min(17, (h - 9) * 2 + (m >= 30 ? 1 : 0)));
  };
  for (const e of EVENTS) {
    if (e.date !== ymd(2026,5,20) || e.allDay) continue;
    const a = slotIndex(e.start);
    const b = slotIndex(e.end);
    for (const pid of e.attendees) {
      if (!grid[pid]) continue;
      for (let i = a; i < b; i++) grid[pid][i] = 2;
    }
  }
  // A bit of tentative noise
  grid.kenji[0] = 2; grid.kenji[1] = 2;
  grid.linh[10] = 1; grid.linh[11] = 1;
  grid.amy[4] = 2; grid.amy[5] = 2; grid.amy[6] = 2;
  return grid;
})();

// ── Notification preferences (per-event-type) ──────────────────────────────
const NOTIF_RULES = [
  { id: "all-meet",   trigger: "10 phút trước", channel: "Push + Email", scope: "Cuộc họp" },
  { id: "customer",   trigger: "30 phút trước", channel: "Push",         scope: "Khách hàng" },
  { id: "all-day",    trigger: "08:30 hôm đó",  channel: "Push",         scope: "Sự kiện cả ngày" },
];

window.CAL_DATA = { CALENDARS, PEOPLE, EVENTS, AVAILABILITY, NOTIF_RULES, TODAY, WEEK_START, ymd };
