// Mock data fixtures shared by the calendar Storybook stories. Ported
// from `design-handoff/calendar/.../calendar-data.jsx` and trimmed to
// strict TypeScript shapes. The strings are intentionally Vietnamese
// + Japanese so the visual handoff (artboards A–F) matches.

import type {
  CalendarEvent,
  CalendarRef,
  PersonRef,
} from "../components/data-display/calendar";

export const TODAY = { y: 2026, m: 5, d: 20 } as const;
export const WEEK_START = { y: 2026, m: 5, d: 18 } as const;

export const CALENDARS: CalendarRef[] = [
  { id: "me", name: "Yuki Tanaka", color: "#1e50a2", group: "mine", shown: true },
  { id: "personal", name: "Cá nhân", color: "#68be8d", group: "mine", shown: true },
  { id: "focus", name: "Focus time", color: "#595857", group: "mine", shown: true },
  { id: "godx-prod", name: "godx-admin · Product", color: "#4c6cb3", group: "org", shown: true },
  { id: "godx-eng", name: "godx-admin · Eng", color: "#165e83", group: "org", shown: true },
  { id: "famgia", name: "Famgia · Company", color: "#b94047", group: "org", shown: true },
  { id: "betoya", name: "Betoya F&B", color: "#009444", group: "org", shown: false },
  { id: "tempo", name: "Tempo Inc.", color: "#7c3aed", group: "org", shown: false },
  { id: "ha", name: "Hà · cá nhân", color: "#eb6101", group: "shared", shown: true },
  { id: "hol-jp", name: "Ngày lễ Nhật Bản", color: "#949495", group: "shared", shown: true, readonly: true },
  { id: "hol-vn", name: "Ngày lễ Việt Nam", color: "#949495", group: "shared", shown: false, readonly: true },
];

export const PEOPLE: PersonRef[] = [
  { id: "yuki", name: "Yuki Tanaka", short: "YT", email: "yuki@example.com", org: "Famgia", role: "PM", color: "#1e50a2", self: true },
  { id: "ha", name: "Hà Nguyễn", short: "HN", email: "ha@example.com", org: "Famgia", role: "Designer", color: "#eb6101" },
  { id: "minh", name: "Minh Phạm", short: "MP", email: "minh@example.com", org: "Famgia", role: "Engineer", color: "#4c6cb3" },
  { id: "satoshi", name: "佐藤 聡", short: "聡", email: "sato@example.com", org: "Famgia", role: "Director", color: "#165e83" },
  { id: "linh", name: "Linh Trần", short: "LT", email: "linh@example.com", org: "Betoya", role: "Operations", color: "#009444" },
  { id: "kenji", name: "Kenji Saito", short: "KS", email: "kenji@example.com", org: "Tempo", role: "CTO", color: "#7c3aed" },
  { id: "amy", name: "Amy Chen", short: "AC", email: "amy@example.com", org: "Acme", role: "Buyer", color: "#b94047" },
];

const ymd = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const EVENTS: CalendarEvent[] = [
  { id: "e-101", calId: "godx-eng", title: "Daily standup", date: ymd(2026, 5, 18), start: "09:30", end: "10:00", attendees: ["yuki", "minh", "satoshi"], status: "organizer", type: "meet", location: "Zoom · Eng" },
  { id: "e-102", calId: "godx-prod", title: "1:1 với 佐藤 (PM ↔ Director)", date: ymd(2026, 5, 18), start: "10:00", end: "11:00", attendees: ["yuki", "satoshi"], status: "accepted", type: "meet", location: "渋谷オフィス 4F · Room 蘭" },
  { id: "e-103", calId: "focus", title: "Deep work · Q3 brief", date: ymd(2026, 5, 18), start: "11:30", end: "13:00", attendees: ["yuki"], status: "organizer", type: "focus" },
  { id: "e-104", calId: "godx-prod", title: "Sprint planning · onboarding", date: ymd(2026, 5, 18), start: "14:00", end: "15:30", attendees: ["yuki", "ha", "minh"], status: "organizer", type: "meet", location: "Zoom" },
  { id: "e-105", calId: "personal", title: "Yoga · 中目黒", date: ymd(2026, 5, 18), start: "18:30", end: "19:30", attendees: ["yuki"], status: "organizer", type: "personal" },

  { id: "e-110", calId: "godx-eng", title: "🚧 Release freeze · godx 2.1", date: ymd(2026, 5, 19), allDay: true, attendees: ["yuki", "minh", "satoshi"], status: "accepted", type: "company" },
  { id: "e-111", calId: "godx-eng", title: "Coffee Q&A (optional)", date: ymd(2026, 5, 19), start: "09:00", end: "09:30", attendees: ["yuki", "minh"], status: "tentative", type: "meet", location: "1F カフェ" },
  { id: "e-112", calId: "godx-prod", title: "Design review · godx 2.1", date: ymd(2026, 5, 19), start: "11:00", end: "12:00", attendees: ["yuki", "ha", "minh", "satoshi"], status: "organizer", type: "meet", location: "Figma · godx-2.1" },
  { id: "e-113", calId: "personal", title: "Lunch với Hà", date: ymd(2026, 5, 19), start: "12:00", end: "13:00", attendees: ["yuki", "ha"], status: "accepted", type: "personal", location: "Betoya 渋谷" },
  { id: "e-114", calId: "godx-prod", title: "Customer · Betoya HCM demo", date: ymd(2026, 5, 19), start: "15:00", end: "16:00", attendees: ["yuki", "linh", "satoshi"], status: "organizer", type: "customer", location: "Zoom · VN" },
  { id: "e-115", calId: "godx-eng", title: "Retro · onboarding squad", date: ymd(2026, 5, 19), start: "17:00", end: "17:30", attendees: ["yuki", "ha", "minh"], status: "accepted", type: "meet" },

  { id: "e-120", calId: "godx-prod", title: "Morning brief", date: ymd(2026, 5, 20), start: "08:30", end: "09:00", attendees: ["yuki", "minh", "satoshi"], status: "organizer", type: "meet" },
  { id: "e-121", calId: "godx-prod", title: "Product strategy · Q3", date: ymd(2026, 5, 20), start: "10:00", end: "11:30", attendees: ["yuki", "satoshi", "ha"], status: "organizer", type: "meet", location: "渋谷 4F · Room 桜" },
  { id: "e-122", calId: "personal", title: "Lunch", date: ymd(2026, 5, 20), start: "12:30", end: "13:00", attendees: ["yuki"], status: "organizer", type: "personal" },
  { id: "e-123", calId: "famgia", title: "Interview · Frontend candidate", date: ymd(2026, 5, 20), start: "14:00", end: "14:45", attendees: ["yuki", "ha", "minh"], status: "organizer", type: "meet", location: "Zoom · candidate" },
  { id: "e-124", calId: "godx-prod", title: "Customer · Tempo VN onboarding", date: ymd(2026, 5, 20), start: "15:00", end: "16:00", attendees: ["yuki", "kenji", "satoshi"], status: "organizer", type: "customer", location: "Zoom · 東京⇄HCM" },
  { id: "e-125", calId: "godx-prod", title: "1:1 với Tanaka-san", date: ymd(2026, 5, 20), start: "16:30", end: "17:00", attendees: ["yuki", "satoshi"], status: "accepted", type: "meet" },
  { id: "e-126", calId: "personal", title: "Tiếng Việt · lớp B2", date: ymd(2026, 5, 20), start: "19:00", end: "20:00", attendees: ["yuki"], status: "organizer", type: "personal", location: "ZoomVN" },

  { id: "e-130", calId: "personal", title: "Hà · nghỉ phép", date: ymd(2026, 5, 21), allDay: true, attendees: ["ha"], status: "accepted", type: "personal" },
  { id: "e-131", calId: "famgia", title: "Eng all-hands", date: ymd(2026, 5, 21), start: "10:00", end: "11:00", attendees: ["yuki", "minh", "satoshi"], status: "accepted", type: "company", location: "Zoom · All-hands" },
  { id: "e-132", calId: "godx-prod", title: "Pricing workshop", date: ymd(2026, 5, 21), start: "13:00", end: "14:30", attendees: ["yuki", "satoshi"], status: "organizer", type: "meet", location: "渋谷 4F · Room 蘭" },
  { id: "e-133", calId: "famgia", title: "Vendor call · Stripe", date: ymd(2026, 5, 21), start: "15:30", end: "16:00", attendees: ["yuki", "minh"], status: "accepted", type: "meet" },
  { id: "e-134", calId: "focus", title: "Deep work · Q3 doc", date: ymd(2026, 5, 21), start: "16:30", end: "18:00", attendees: ["yuki"], status: "organizer", type: "focus" },

  { id: "e-140", calId: "godx-eng", title: "Demo day · sprint 24", date: ymd(2026, 5, 22), start: "09:00", end: "10:00", attendees: ["yuki", "minh", "ha", "satoshi"], status: "accepted", type: "meet", location: "Zoom + 4F 桜" },
  { id: "e-141", calId: "godx-prod", title: "Customer · Acme revisit", date: ymd(2026, 5, 22), start: "11:00", end: "12:00", attendees: ["yuki", "amy", "satoshi"], status: "organizer", type: "customer", location: "Zoom" },
  { id: "e-142", calId: "focus", title: "Deep work · Q3 plan", date: ymd(2026, 5, 22), start: "14:00", end: "17:00", attendees: ["yuki"], status: "organizer", type: "focus" },
  { id: "e-143", calId: "famgia", title: "Pay-day standup", date: ymd(2026, 5, 22), start: "17:30", end: "18:00", attendees: ["yuki", "satoshi"], status: "accepted", type: "company" },

  { id: "e-150", calId: "famgia", title: "🏔 開発合宿 · 箱根", date: ymd(2026, 5, 23), allDay: true, attendees: ["yuki", "minh", "ha", "satoshi"], status: "accepted", type: "company" },
  { id: "e-151", calId: "famgia", title: "🏔 開発合宿 · 箱根", date: ymd(2026, 5, 24), allDay: true, attendees: ["yuki", "minh", "ha", "satoshi"], status: "accepted", type: "company" },
  { id: "e-152", calId: "godx-eng", title: "Team dinner · Betoya 渋谷", date: ymd(2026, 5, 23), start: "18:00", end: "21:00", attendees: ["yuki", "minh", "ha", "satoshi", "linh"], status: "accepted", type: "personal", location: "Betoya 渋谷店" },

  { id: "e-200", calId: "hol-jp", title: "海の日 (đề xuất)", date: ymd(2026, 5, 11), allDay: true, attendees: [], status: "accepted", type: "company" },
  { id: "e-201", calId: "godx-prod", title: "QBR · Q1", date: ymd(2026, 5, 6), start: "14:00", end: "16:00", attendees: ["yuki", "satoshi"], status: "accepted", type: "meet" },
  { id: "e-202", calId: "godx-eng", title: "Demo day", date: ymd(2026, 5, 8), start: "09:00", end: "10:00", attendees: ["yuki", "minh"], status: "accepted", type: "meet" },
  { id: "e-203", calId: "famgia", title: "Town hall", date: ymd(2026, 5, 13), start: "16:00", end: "17:00", attendees: ["yuki"], status: "accepted", type: "company" },
  { id: "e-204", calId: "personal", title: "Sinh nhật Minh", date: ymd(2026, 5, 14), allDay: true, attendees: ["minh"], status: "accepted", type: "personal" },
  { id: "e-205", calId: "godx-prod", title: "Roadmap Q3 lock", date: ymd(2026, 5, 29), start: "10:00", end: "12:00", attendees: ["yuki", "satoshi", "ha"], status: "organizer", type: "meet" },
  { id: "e-206", calId: "famgia", title: "月末締め", date: ymd(2026, 5, 31), allDay: true, attendees: [], status: "accepted", type: "company" },
];

/** Per-person availability for Wed 5/20 — 18 slots × 5 days @ 30-min steps. */
export const AVAILABILITY: Record<string, ReadonlyArray<0 | 1 | 2>> = (() => {
  const grid: Record<string, (0 | 1 | 2)[]> = {};
  for (const p of PEOPLE) grid[p.id] = Array(18).fill(0) as (0 | 1 | 2)[];
  const slotIndex = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return Math.max(0, Math.min(17, (h - 9) * 2 + (m >= 30 ? 1 : 0)));
  };
  for (const e of EVENTS) {
    if (e.date !== ymd(2026, 5, 20) || e.allDay) continue;
    const a = slotIndex(e.start ?? "00:00");
    const b = slotIndex(e.end ?? "00:00");
    for (const pid of e.attendees) {
      if (!grid[pid]) continue;
      for (let i = a; i < b; i++) grid[pid][i] = 2;
    }
  }
  grid.kenji[0] = 2; grid.kenji[1] = 2;
  grid.linh[10] = 1; grid.linh[11] = 1;
  grid.amy[4] = 2; grid.amy[5] = 2; grid.amy[6] = 2;
  return grid;
})();

/** Asagi (浅葱) teal — the canonical handoff accent for the calendar app. */
export const ASAGI_ACCENT = "oklch(55% 0.12 220)";
export const ASAGI_ACCENT_SOFT =
  "color-mix(in oklch, oklch(55% 0.12 220) 14%, transparent)";
