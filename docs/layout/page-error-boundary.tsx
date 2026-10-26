import { useState } from "react";
import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";
import { BarChart3, CircleHelp, FileText, LayoutDashboard } from "lucide-react";

/**
 * PageErrorBoundary — AppShell wraps every page in one by default (gh#1494). Press 「表示を壊す」:
 * the page throws while rendering, its area becomes an application ErrorSurface, and the sidebar
 * and topbar stay, so the user can go elsewhere. Choosing another sidebar row (a navigation) draws
 * that page normally — the boundary resets when the URL changes.
 *
 * The page header also shows the `help` slot: the Help control sits at the header row's inline
 * end, after the actions, on every page.
 */
const sections: SidebarSectionProp[] = [
  {
    label: "業務",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard, href: "#dashboard" },
      { id: "reports", label: "レポート", icon: BarChart3, href: "#reports" },
      { id: "documents", label: "ドキュメント", icon: FileText, href: "#documents" },
    ],
  },
];

function ReportPage({ broken }: { broken: boolean }) {
  if (broken) throw new Error("demo: the report row renderer received null");
  return <Text>月次レポートの一覧がここに表示されます。</Text>;
}

export default function Demo() {
  const [broken, setBroken] = useState(false);
  const [activeId, setActiveId] = useState("reports");
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId={activeId}
          sections={sections}
          onSelect={(id) => {
            setActiveId(id);
            setBroken(false);
          }}
        />
      }
      topbar={
        <Topbar
          start={<Logo glyph="G" />}
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
            </Flex>
          }
        />
      }
    >
      <PageContainer
        title="レポート"
        extra={
          <Button variant="destructive" onClick={() => setBroken(true)}>
            表示を壊す
          </Button>
        }
        help={
          <Button variant="ghost">
            <CircleHelp aria-hidden="true" />
            ヘルプ
          </Button>
        }
      >
        <ReportPage broken={broken} />
      </PageContainer>
    </AppShell>
  );
}
