import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Receipt,
  Users,
} from "lucide-react";

/**
 * AppShell · grid states, one per URL.
 *
 * The shell's grid is keyed on four attributes — `data-sidebar`, `data-nav-rail(-position)`,
 * `data-collapsed` and `data-topbar-span` — and every combination is a real product shape. This
 * frame renders ONE AppShell in whichever state the query names, so a browser gate can walk all of
 * them (`scripts/check-app-shell-narrow-grid.mjs`) without stacking several `main` landmarks on a
 * single page:
 *
 *   ?topbarSpan=content|full   ?navRail=start|end|top|bottom   ?collapsed=1   ?sidebar=none
 *   ?responsive=docked
 *
 * With no query it is `topbarSpan="full"` without a rail — the state gh#474 found collapsing
 * `main` into a 170px implicit track below 900px, with the page actions laid out past the edge.
 */

const SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
      { id: "invoices", label: "請求書", icon: Receipt },
    ],
  },
  {
    label: "管理",
    items: [
      { id: "partners", label: "取引先", icon: Building2 },
      { id: "users", label: "ユーザー", icon: Users },
    ],
  },
];

type RailPosition = "start" | "end" | "top" | "bottom";

function readState() {
  const params = new URLSearchParams(window.location.search);
  const rail = params.get("navRail");
  return {
    topbarSpan: params.get("topbarSpan") === "content" ? ("content" as const) : ("full" as const),
    navRail: (["start", "end", "top", "bottom"] as const).find((p) => p === rail) as
      | RailPosition
      | undefined,
    collapsed: params.get("collapsed") === "1",
    hasSidebar: params.get("sidebar") !== "none",
    responsiveNavigation:
      params.get("responsive") === "docked" ? ("docked" as const) : ("drawer" as const),
  };
}

export default function Demo() {
  const [{ topbarSpan, navRail, collapsed, hasSidebar, responsiveNavigation }] = useState(readState);
  const [activeId, setActiveId] = useState("dashboard");
  const strip = navRail === "top" || navRail === "bottom";

  return (
    <AppShell
      topbarSpan={topbarSpan}
      responsiveNavigation={responsiveNavigation}
      sidebarCollapsed={collapsed}
      sidebar={
        hasSidebar ? (
          <Sidebar
            activeId={activeId}
            collapsed={collapsed}
            onSelect={setActiveId}
            sections={SECTIONS}
            product={{ name: "CoreBooks", role: "株式会社アクメ" }}
          />
        ) : undefined
      }
      navRail={
        navRail ? (
          <Flex direction={strip ? "row" : "col"} gap="xs" align="center">
            <Button variant="ghost" size="icon-sm" aria-label="会計">
              <Receipt />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="チャット">
              <MessageSquare />
            </Button>
          </Flex>
        ) : undefined
      }
      navRailPosition={navRail}
      topbar={
        <Topbar
          start={<Text weight="medium">CoreBooks</Text>}
          end={
            <Button variant="ghost" size="icon-sm" aria-label="通知">
              <Bell />
            </Button>
          }
        />
      }
    >
      <PageContainer
        title="請求書"
        subtitle="株式会社アクメ · 2026年5月"
        extra={
          <Flex gap="sm" wrap>
            <Button size="sm" variant="outline">
              取引先へ一括送信する
            </Button>
            <Button size="sm">
              <Plus />
              新しい請求書を作成する
            </Button>
          </Flex>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>今月の請求</CardTitle>
            <CardDescription>未送信 3 件 · 入金待ち 12 件</CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              状態はクエリで切り替えます。どの状態でも 900px 以下では 1 列になり、main
              は画面幅いっぱいに広がります。
            </Text>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
