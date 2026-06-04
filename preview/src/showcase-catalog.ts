/**
 * Showcase catalog — full standalone application pages built ENTIRELY from real
 * @godxjp/ui primitives (the design-handoff "skeleton, not transcription" rule).
 *
 * These are NOT preview-catalog entries: they never render inside the :6008
 * preview chrome (no Card/PageContainer wrapper, no sidebar tree). Each one is a
 * self-contained page served at its own URL `/showcase/<id>` via showcase.html,
 * exactly like /isolate/* — independent documents, not hash routes.
 *
 * The source lives under `docs/showcase/<id>.tsx` (default-exporting the page) so
 * it ships with the repo and stays MCP-discoverable as a reference pattern, but it
 * is excluded from the preview tree (see catalog.ts `isShowcasePath`).
 *
 * To add a case: drop `docs/showcase/<id>.tsx` (default export) and append one
 * entry below. The landing page + standalone runtime pick it up automatically.
 */

import type * as React from "react";

export type ShowcaseEntry = {
  /** URL slug — page is served at `/showcase/<id>`. */
  id: string;
  /** Card title on the Get Started landing. */
  title: string;
  /** One calm factual sentence (kanso) for the landing card. */
  description: string;
  /** Domain tag shown as a Badge on the landing. */
  tag: string;
  /** Lazy-load the page component (default export of the docs/showcase file). */
  load: () => Promise<{ default: React.ComponentType }>;
};

export const SHOWCASES: ShowcaseEntry[] = [
  {
    id: "case1-warehouse-dashboard",
    title: "Tổng quan kho (Warehouse Dashboard)",
    description:
      "Bảng điều khiển 勤怠/admin: AppShell + Sidebar + KPI StatCard, hàng đợi xử lý, hoạt động gần đây và dung lượng giá hàng.",
    tag: "Admin",
    load: () => import("../../docs/showcase/case1-warehouse-dashboard"),
  },
];

export const SHOWCASE_MAP = new Map<string, ShowcaseEntry>(SHOWCASES.map((s) => [s.id, s]));

export function parseShowcaseId(pathname: string): string {
  const match = pathname.match(/^\/showcase\/(.+?)\/?$/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
