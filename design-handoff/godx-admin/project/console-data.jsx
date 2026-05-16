/* global window */
/* Mock data for the godx-admin console */

const ORG = {
  id: "famgia",
  name: "Famgia",
  legalName: "Famgia Co., Ltd.",
  domain: "famgia.com",
  taxId: "0312345678",
  country: "JP",
  founded: "2019-04",
  plan: "Business",
  seats: { used: 14, total: 25 },
  address: "東京都港区六本木 6-10-1",
  contactEmail: "info@famgia.com",
};

const USER = {
  name: "Famgia Info",
  email: "info@famgia.com",
  initials: "FI",
  role: "Owner",
};

// Products = SaaS services this org can subscribe to.
// Each carries a sticker (2-char kanji) and a brand color drawn from the wa-iro palette.
const SERVICES = [
  {
    id: "kintai",
    sticker: "勤",
    name: "勤怠管理",
    long: "Famgia 勤怠管理 (Local)",
    desc: "従業員の出退勤・休暇・残業を一元管理するサービス",
    accent: "oklch(58% 0.18 295)",       // 紫
    plan: "Pro",
    status: "registered",
    activeUsers: 14,
    branches: 11,
  },
  {
    id: "gcal",
    sticker: "暦",
    name: "Google カレンダー連携",
    long: "Google Calendar Integration",
    desc: "Google Workspace カレンダーと勤怠・休暇・タスクを双方向で同期",
    accent: "oklch(55% 0.12 265)",       // 群青 ultramarine
    plan: "Included",
    status: "registered",
    activeUsers: 12,
    branches: 8,
  },
  {
    id: "task",
    sticker: "課",
    name: "課題管理",
    long: "Famgia 課題管理 (Local)",
    desc: "プロジェクトの課題・タスクを管理するサービス",
    accent: "oklch(56% 0.15 240)",       // 群青
    plan: "Standard",
    status: "registered",
    activeUsers: 9,
    branches: 4,
  },
  {
    id: "restaurant",
    sticker: "レ",
    name: "レストラン管理",
    long: "Famgia レストラン管理",
    desc: "予約・注文・在庫・スタッフ管理を統合したレストラン運営プラットフォーム",
    accent: "oklch(58% 0.159 150)",      // 若竹
    plan: null,
    status: "try",
    activeUsers: 0,
    branches: 0,
  },
  {
    id: "crm",
    sticker: "顧",
    name: "顧客管理",
    long: "Famgia 顧客管理",
    desc: "顧客情報・商談・履歴を一元管理する CRM",
    accent: "oklch(66% 0.19 45)",        // 朱
    plan: null,
    status: "try",
    activeUsers: 0,
    branches: 0,
  },
  {
    id: "inventory",
    sticker: "在",
    name: "在庫管理",
    long: "Famgia 在庫管理",
    desc: "複数拠点の在庫・発注・棚卸しを管理するサービス",
    accent: "oklch(55% 0.12 265)",       // 藍
    plan: null,
    status: "try",
    activeUsers: 0,
    branches: 0,
  },
];

const BRANCHES = [
  { id: "hq",       code: "HQ-001", name: "本社 (HQ)",                city: "東京", country: "JP", members: 8, brand: "famgia", status: "active", openedAt: "2019-04-01" },
  { id: "shibuya",  code: "SH-002", name: "渋谷オフィス",                city: "東京", country: "JP", members: 5, brand: "famgia", status: "active", openedAt: "2020-09-12" },
  { id: "osaka",    code: "OS-003", name: "大阪支社",                  city: "大阪", country: "JP", members: 3, brand: "famgia", status: "active", openedAt: "2021-03-01" },
  { id: "fukuoka",  code: "FK-004", name: "福岡支社",                  city: "福岡", country: "JP", members: 2, brand: "famgia", status: "active", openedAt: "2022-07-10" },
  { id: "saigon",   code: "VN-101", name: "Saigon Studio",             city: "TP. HCM", country: "VN", members: 6, brand: "famgia", status: "active", openedAt: "2021-11-22" },
  { id: "hanoi",    code: "VN-102", name: "Hanoi Studio",              city: "Hà Nội", country: "VN", members: 4, brand: "famgia", status: "active", openedAt: "2023-02-14" },
  { id: "betoya-hcm", code: "BTY-01", name: "Betoya — Lê Lợi",          city: "TP. HCM", country: "VN", members: 12, brand: "betoya", status: "active", openedAt: "2024-04-01" },
  { id: "betoya-hn",  code: "BTY-02", name: "Betoya — Tràng Tiền",     city: "Hà Nội", country: "VN", members: 9, brand: "betoya", status: "active", openedAt: "2024-08-15" },
  { id: "betoya-da",  code: "BTY-03", name: "Betoya — Đà Nẵng Center", city: "Đà Nẵng", country: "VN", members: 7, brand: "betoya", status: "active", openedAt: "2025-01-20" },
  { id: "betoya-jp",  code: "BTY-04", name: "Betoya 東京 麻布",          city: "東京", country: "JP", members: 5, brand: "betoya", status: "prelaunch", openedAt: "2026-06-01" },
  { id: "ws-kyoto",   code: "WS-001", name: "京都ワークショップ",        city: "京都", country: "JP", members: 2, brand: "famgia", status: "paused",  openedAt: "2022-04-09" },
];

const BRANDS = [
  { id: "famgia", code: "FAMGIA",  name: "Famgia",  primary: "#0077c7", desc: "親ブランド・コーポレート", branches: 7, status: "active" },
  { id: "betoya", code: "BETOYA",  name: "Betoya",  primary: "#009444", desc: "ベトナム料理レストランチェーン", branches: 4, status: "active" },
  { id: "godx",   code: "GODX",    name: "godx",    primary: "#4c6cb3", desc: "社内向け開発プラットフォーム", branches: 0, status: "internal" },
];

const TEAMS = [
  { id: "exec",     name: "Executive",          desc: "経営・全社管理",                    color: "#223a70", members: 3, services: ["kintai","task"] },
  { id: "eng",      name: "Engineering",        desc: "エンジニアリング全般",              color: "#1e50a2", members: 6, services: ["kintai","task"] },
  { id: "design",   name: "Design",             desc: "プロダクト・ブランドデザイン",      color: "#b94047", members: 3, services: ["task"] },
  { id: "ops-jp",   name: "Operations · 日本",   desc: "本社オペレーション",               color: "#006e54", members: 4, services: ["kintai"] },
  { id: "ops-vn",   name: "Operations · VN",     desc: "ベトナム拠点 + Betoya",             color: "#eb6101", members: 8, services: ["kintai","task"] },
  { id: "betoya-front", name: "Betoya · Front",  desc: "レストラン フロント (FOH)",        color: "#009444", members: 12, services: [] },
  { id: "betoya-kitchen", name: "Betoya · Kitchen", desc: "レストラン キッチン (BOH)",     color: "#f8b500", members: 9, services: [] },
];

const MEMBERS = [
  { id: "u-info",     name: "Famgia Info",   email: "info@famgia.com",        role: "Owner",  branches: ["hq"],                  teams: ["exec"],            services: ["kintai","task"], status: "active",  joined: "2019-04-01" },
  { id: "u-yuki",     name: "Yuki Tanaka",   email: "yuki@famgia.com",        role: "Admin",  branches: ["hq","shibuya"],        teams: ["exec","ops-jp"],   services: ["kintai","task"], status: "active",  joined: "2019-05-12" },
  { id: "u-ken",      name: "Ken Watanabe",  email: "ken@famgia.com",         role: "Admin",  branches: ["osaka"],               teams: ["eng"],             services: ["kintai","task"], status: "active",  joined: "2020-01-08" },
  { id: "u-sora",     name: "Sora Mori",     email: "sora@famgia.com",        role: "Manager",branches: ["shibuya"],             teams: ["design"],          services: ["task"],          status: "active",  joined: "2020-06-22" },
  { id: "u-haru",     name: "Haruto Sato",   email: "haru@famgia.com",        role: "Manager",branches: ["fukuoka"],             teams: ["ops-jp"],          services: ["kintai"],        status: "active",  joined: "2021-09-30" },
  { id: "u-an",       name: "An Nguyễn",     email: "an.nguyen@famgia.com",   role: "Manager",branches: ["saigon"],              teams: ["ops-vn","eng"],    services: ["kintai","task"], status: "active",  joined: "2021-11-22" },
  { id: "u-binh",     name: "Bình Trần",     email: "binh.tran@famgia.com",   role: "Member", branches: ["saigon"],              teams: ["eng"],             services: ["task"],          status: "active",  joined: "2022-02-14" },
  { id: "u-chau",     name: "Châu Lê",       email: "chau.le@famgia.com",     role: "Member", branches: ["hanoi"],               teams: ["design","ops-vn"], services: ["task"],          status: "active",  joined: "2023-03-10" },
  { id: "u-dat",      name: "Đạt Phạm",      email: "dat.pham@famgia.com",    role: "Member", branches: ["hanoi"],               teams: ["eng"],             services: ["kintai","task"], status: "active",  joined: "2023-05-02" },
  { id: "u-emi",      name: "Emi Kobayashi", email: "emi@famgia.com",         role: "Member", branches: ["hq"],                  teams: ["design"],          services: ["task"],          status: "active",  joined: "2023-07-18" },
  { id: "u-hoa",      name: "Hoa Lý",        email: "hoa.ly@betoya.vn",       role: "Manager",branches: ["betoya-hcm"],          teams: ["betoya-front"],    services: [],                status: "active",  joined: "2024-04-01" },
  { id: "u-minh",     name: "Minh Đỗ",       email: "minh.do@betoya.vn",      role: "Manager",branches: ["betoya-hn"],           teams: ["betoya-kitchen"],  services: [],                status: "active",  joined: "2024-08-15" },
  { id: "u-quan",     name: "Quân Vũ",       email: "quan.vu@betoya.vn",      role: "Member", branches: ["betoya-da"],           teams: ["betoya-front"],    services: [],                status: "active",  joined: "2025-01-20" },
  { id: "u-rio",      name: "Rio Nakamura",  email: "rio@famgia.com",         role: "Member", branches: ["hq"],                  teams: ["eng"],             services: ["kintai","task"], status: "active",  joined: "2025-03-05" },
  { id: "u-leo",      name: "Leo Yamamoto",  email: "leo@famgia.com",         role: "Member", branches: [],                      teams: [],                  services: [],                status: "invited", joined: "2026-05-10" },
  { id: "u-mai",      name: "Mai Trần",      email: "mai.tran@famgia.com",    role: "Manager",branches: [],                      teams: ["ops-vn"],          services: [],                status: "invited", joined: "2026-05-12" },
  { id: "u-yuto",     name: "Yuto Ito",      email: "yuto@famgia.com",        role: "Member", branches: ["osaka"],               teams: ["eng"],             services: ["kintai"],        status: "suspended", joined: "2022-04-09" },
];

const INVOICES = [
  { id: "INV-2026-05", date: "2026-05-01", period: "2026/05", amount: 89400, status: "paid",    items: 2 },
  { id: "INV-2026-04", date: "2026-04-01", period: "2026/04", amount: 89400, status: "paid",    items: 2 },
  { id: "INV-2026-03", date: "2026-03-01", period: "2026/03", amount: 78600, status: "paid",    items: 2 },
  { id: "INV-2026-02", date: "2026-02-01", period: "2026/02", amount: 78600, status: "paid",    items: 2 },
  { id: "INV-2026-01", date: "2026-01-01", period: "2026/01", amount: 78600, status: "paid",    items: 2 },
  { id: "INV-2025-12", date: "2025-12-01", period: "2025/12", amount: 72000, status: "paid",    items: 2 },
];

window.CONSOLE_DATA = { ORG, USER, SERVICES, BRANCHES, BRANDS, TEAMS, MEMBERS, INVOICES };
