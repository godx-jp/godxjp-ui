// Product / project registry — MOCK DATA used by Storybook stories
// and `examples/screens/*` page-level samples ONLY. Shell primitives
// (Sidebar / Topbar / Switchers / TweaksPanel) NEVER import this —
// they accept products + projects via props per cardinal rule 28.
//
// Service consumers fetch their own catalogues from
// forge-service / identity-service and pass them down through the
// shell. This file exists purely so the storybook iframes render
// realistic surfaces.

import type {
  ForgeProduct,
  ForgeProject,
  ProjectKind,
} from "../../components/shell/types";

export type { ForgeProduct, ForgeProject, ProjectKind };

export const PRODUCTS: ForgeProduct[] = [
  {
    id: "restaurant",
    name: "godx-restaurant",
    tenant: "restaurant",
    role: "レストラン管理",
    desc: "店舗向け統合管理プラットフォーム",
    color: "oklch(58% 0.18 25)",
    owner: "Satoshi F",
    devs: 6,
    projects: [
      { id: "api",    name: "restaurant-api",    stack: "NestJS · PostgreSQL", kind: "service",     devs: 3, status: "active",   branch: "main",          lastCommit: "12分前", openIssues: 8, prs: 2, sandbox: true },
      { id: "admin",  name: "restaurant-admin",  stack: "Next.js 14 · React",  kind: "web",         devs: 2, status: "active",   branch: "main",          lastCommit: "1時間前", openIssues: 5, prs: 1, sandbox: true },
      { id: "pos",    name: "restaurant-pos",    stack: "Tauri · Vue 3",       kind: "desktop",     devs: 1, status: "active",   branch: "feature/print", lastCommit: "30分前", openIssues: 3, prs: 1, sandbox: true },
      { id: "kds",    name: "restaurant-kds",    stack: "React · Electron",    kind: "workstation", devs: 1, status: "review",   branch: "main",          lastCommit: "昨日",   openIssues: 2, prs: 1, sandbox: true },
      { id: "kintai", name: "restaurant-kintai", stack: "Vue 3 · Laravel",     kind: "service",     devs: 2, status: "active",   branch: "main",          lastCommit: "5分前",  openIssues: 4, prs: 0, sandbox: true },
      { id: "mobile", name: "restaurant-mobile", stack: "React Native",        kind: "mobile",      devs: 1, status: "planning", branch: "develop",       lastCommit: "3日前",  openIssues: 1, prs: 0, sandbox: false },
    ],
  },
  {
    id: "godx",
    name: "godx-admin",
    tenant: "godx",
    role: "Platform admin",
    desc: "GoDX Forge developer workspace",
    color: "oklch(60% 0.137 163)",
    owner: "Satoshi F",
    devs: 4,
    projects: [
      { id: "frontend", name: "godx-admin-frontend", stack: "React · Vite",       kind: "web",     devs: 2, status: "active", branch: "master", lastCommit: "2時間前", openIssues: 6, prs: 2, sandbox: true },
      { id: "api",      name: "godx-admin-api",      stack: "Go · Gin",           kind: "service", devs: 1, status: "active", branch: "master", lastCommit: "4時間前", openIssues: 3, prs: 1, sandbox: true },
      { id: "ui",       name: "@godxjp/ui",          stack: "TypeScript · React", kind: "library", devs: 2, status: "active", branch: "master", lastCommit: "1時間前", openIssues: 2, prs: 0, sandbox: false },
    ],
  },
  {
    id: "kintai",
    name: "dxs-kintai",
    tenant: "kintai",
    role: "HR / Attendance",
    desc: "勤怠管理プラットフォーム",
    color: "oklch(56% 0.15 240)",
    owner: "Naoki N",
    devs: 3,
    projects: [
      { id: "frontend", name: "kintai-web", stack: "Vue 3 · Vite", kind: "web",     devs: 2, status: "active", branch: "main", lastCommit: "20分前", openIssues: 7, prs: 1, sandbox: true },
      { id: "backend",  name: "kintai-api", stack: "Laravel 11",   kind: "service", devs: 1, status: "active", branch: "main", lastCommit: "1日前",  openIssues: 4, prs: 0, sandbox: true },
    ],
  },
  {
    id: "tempo",
    name: "dxs-tempo",
    tenant: "tempo",
    role: "Shop / Inventory",
    desc: "店舗・在庫バックエンド",
    color: "oklch(48% 0.16 285)",
    owner: "Naoki N",
    devs: 2,
    projects: [
      { id: "api", name: "tempo-api", stack: "Go · Echo",     kind: "service", devs: 2, status: "active",   branch: "main", lastCommit: "5時間前", openIssues: 9, prs: 1, sandbox: true },
      { id: "ops", name: "tempo-ops", stack: "Terraform",     kind: "infra",   devs: 1, status: "planning", branch: "main", lastCommit: "1週間前", openIssues: 1, prs: 0, sandbox: false },
    ],
  },
  {
    id: "betoya",
    name: "betoya",
    tenant: "betoya",
    role: "Vietnamese restaurant",
    desc: "ベト屋 Tenant",
    color: "oklch(58% 0.159 150)",
    owner: "Anh K",
    devs: 1,
    projects: [
      { id: "site", name: "betoya-site", stack: "Astro", kind: "web", devs: 1, status: "active", branch: "main", lastCommit: "昨日", openIssues: 2, prs: 0, sandbox: false },
    ],
  },
];

export const PROJECT_KIND: Record<ProjectKind, { color: string; label: string }> = {
  service:     { color: "oklch(60% 0.137 163)", label: "API" },
  web:         { color: "oklch(56% 0.15 240)",  label: "Web" },
  desktop:     { color: "oklch(48% 0.16 285)",  label: "Desktop" },
  workstation: { color: "oklch(50% 0.16 30)",   label: "Workstation" },
  mobile:      { color: "oklch(58% 0.18 25)",   label: "Mobile" },
  library:     { color: "oklch(50% 0.05 250)",  label: "Library" },
  infra:       { color: "oklch(45% 0.05 260)",  label: "Infra" },
};

export function findProductByTenant(tenant: string): ForgeProduct | undefined {
  return PRODUCTS.find((p) => p.tenant === tenant);
}
