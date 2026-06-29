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
    id: "tiximax-portal",
    title: "TIXIMAX — Cổng khách hàng (token re-theme)",
    description:
      "Chứng minh re-theme CHỈ bằng token: cùng bộ component @godxjp/ui nhưng khoác bộ token TIXIMAX (gold/navy/đỏ · Source Sans 3 · bo 14px · shadow ám navy). Không sửa/thêm component.",
    tag: "Theme",
    load: () => import("../../docs/showcase/tiximax-portal"),
  },
  {
    id: "tiximax-website",
    title: "TIXIMAX — Landing page (token rebuild)",
    description:
      "Dựng lại trang marketing TIXIMAX (Navbar · Hero navy + glow vàng · Dịch vụ · Quy trình · Tuyến · CTA · Footer) CHỈ bằng token + real primitives. Section marketing là composition (không thêm component framework); vùng navy dùng role-scoping; display type + dual font + glow đều là token.",
    tag: "Theme",
    load: () => import("../../docs/showcase/tiximax-website"),
  },
  {
    id: "futurelastic-web",
    title: "FUTURELASTIC — Dark website (Kiniro token rebuild)",
    description:
      "Dựng lại website holding FUTURELASTIC (dark mode · gold Kiniro · Sora display 80px · hero glow · bento ventures · stats · CTA · footer) CHỈ bằng token + real primitives. Chứng minh token model tái hiện được 1 brand TỐI hoàn toàn khác — 0 component framework mới (section là composition).",
    tag: "Theme",
    load: () => import("../../docs/showcase/futurelastic-web"),
  },
  {
    id: "case1-warehouse-dashboard",
    title: "Tổng quan kho (Warehouse Dashboard)",
    description:
      "Bảng điều khiển 勤怠/admin: AppShell + Sidebar + KPI StatCard, hàng đợi xử lý, hoạt động gần đây và dung lượng giá hàng.",
    tag: "Admin",
    load: () => import("../../docs/showcase/case1-warehouse-dashboard"),
  },
  {
    id: "table-crud-list",
    title: "CRUD一覧 (V1)",
    description:
      "Danh sách quản trị: toolbar + hàng lọc + DataTable (sort/chọn dòng) + dòng tổng + phân trang số.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-crud-list"),
  },
  {
    id: "table-bulk-actions",
    title: "一括操作 (V2)",
    description:
      "Chọn dòng → thanh thao tác hàng loạt thay toolbar; select-all liên trang, hành động phá hủy tách biệt.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-bulk-actions"),
  },
  {
    id: "table-density",
    title: "密度切替 (V4)",
    description: "Đổi mật độ compact / default / comfortable trên cùng một bảng.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-density"),
  },
  {
    id: "table-filter-chips",
    title: "フィルターチップ (V6)",
    description: "Thanh chip bộ lọc đang áp (gỡ từng chip, xoá hết) lái dữ liệu bảng.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-filter-chips"),
  },
  {
    id: "table-view-tabs",
    title: "保存ビュー (V7)",
    description: "Tab ビュー lưu sẵn (pill số + chấm màu) đổi preset bộ lọc/cột của bảng.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-view-tabs"),
  },
  {
    id: "table-expandable-rows",
    title: "展開行 (V9)",
    description: "Mở dòng để hiện panel chi tiết inline; toggle độc quyền (một dòng mở).",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-expandable-rows"),
  },
  {
    id: "table-grouped-subtotals",
    title: "グループ集計 (V11)",
    description: "Dòng gom nhóm + header (số lượng + tổng phụ), thu gọn được.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-grouped-subtotals"),
  },
  {
    id: "table-tree-rows",
    title: "ツリー行 (V12)",
    description: "Dòng cây phân cấp: thụt lề theo cấp, twirl ở node cha.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-tree-rows"),
  },
  {
    id: "table-sticky-columns",
    title: "固定列 (V13)",
    description: "Cố định cột đầu (識別子) + cuối (操作), cuộn ngang ma trận.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-sticky-columns"),
  },
  {
    id: "table-pagination",
    title: "ページネーション (V14)",
    description: "Ba kiểu phân trang: số + page-size, load-more, cursor/period-jump.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-pagination"),
  },
  {
    id: "table-states",
    title: "状態 (V16)",
    description: "Năm trạng thái bảng: loading (Skeleton) / empty / error / partial / ideal.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-states"),
  },
  {
    id: "table-footer-totals",
    title: "合計行 (V17)",
    description: "Dòng tổng chân bảng (tabular-nums), sticky khi cuộn dọc.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-footer-totals"),
  },
  {
    id: "table-compact-kintone",
    title: "高密度グリッド (V18)",
    description: "Lưới dày kiểu kintone: dòng 28px, viền mảnh, nhiều cột, tabular-nums.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-compact-kintone"),
  },
  {
    id: "table-conditional-format",
    title: "条件付き書式 (V19)",
    description: "Tô màu dòng/ô theo ngưỡng (遅刻≥5 → đỏ, 早退>2h → 朱), chỉ token semantic.",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-conditional-format"),
  },
  {
    id: "table-master-detail",
    title: "マスター詳細 (V20)",
    description: "List + pane chi tiết (chọn dòng hiện chi tiết bên phải; mobile xếp dọc).",
    tag: "Bảng",
    load: () => import("../../docs/showcase/table-master-detail"),
  },
  {
    id: "case4-login",
    title: "ログイン (Login)",
    description:
      "Màn đăng nhập: density comfortable (44px touch), Card shadow-lg, SSO, FormField, brand panel ẩn ở mobile.",
    tag: "Auth",
    load: () => import("../../docs/showcase/case4-login"),
  },
  {
    id: "settings-security-mfa",
    title: "セキュリティ / 2要素認証",
    description:
      "Màn cài đặt bảo mật làm ĐÚNG luật: ListRow cho factor (không trùng title=description), nút Xoá tone destructive, action phải-aligned auto-width (không full-width), icon lucide (không emoji), Avatar cho brand mark.",
    tag: "Settings",
    load: () => import("../../docs/showcase/settings-security-mfa"),
  },
  {
    id: "case2-employee-me",
    title: "従業員 /me",
    description:
      "Trang cá nhân nhân viên: PunchCard chấm công, StatCard 2×2, bảng 7 ngày, tóm tắt hôm nay.",
    tag: "Employee",
    load: () => import("../../docs/showcase/case2-employee-me"),
  },
  {
    id: "case3-approval-workflow",
    title: "欠勤承認ワークフロー",
    description:
      "Màn admin phức tạp nhất: filter bar + DataTable chọn dòng + bulk approve/reject + badge trạng thái + reject prompt + states.",
    tag: "Admin",
    load: () => import("../../docs/showcase/case3-approval-workflow"),
  },
  {
    id: "case5-shift-calendar",
    title: "シフトカレンダー",
    description:
      "Lịch ca: grid tháng pill ca (palette 7 màu wa-iro), timeline tuần có now-line, tab tháng/tuần/ngày.",
    tag: "Admin",
    load: () => import("../../docs/showcase/case5-shift-calendar"),
  },
  {
    id: "case6-agency-handy",
    title: "代理店ハンディ (mobile)",
    description:
      "UI cầm tay đại lý (390×844): Sheet, nút scan, list-card, badge 1:1, segmented, Dialog, toast, select-mode bar — density comfortable.",
    tag: "Mobile",
    load: () => import("../../docs/showcase/case6-agency-handy"),
  },
];

export const SHOWCASE_MAP = new Map<string, ShowcaseEntry>(SHOWCASES.map((s) => [s.id, s]));

export function parseShowcaseId(pathname: string): string {
  // Not anchored to the path root: on a GitHub Pages project page the URL is
  // `/<repo>/showcase/<id>`, so match the `/showcase/<id>` segment under any base.
  const match = pathname.match(/\/showcase\/(.+?)\/?$/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
