import { EmptyState } from "@godxjp/ui/data-display";
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
import { BarChart3, FileText, LayoutDashboard, ShieldAlert, Users } from "lucide-react";

/**
 * 403 — APPLICATION mode. The failure happened INSIDE the authenticated app, so the app shell is
 * PRESERVED: the sidebar nav, the topbar and the breadcrumb all survive, and only the page body is
 * replaced. The user is never stranded on a chrome-less page with a single "go home" button.
 *
 * There is no `mode` prop to set: the mode IS the shell you are already rendering. The error body
 * is the same three-part composition used by every status —
 * status code (`Text` mono/tabular) → `EmptyState` (icon · tone · title · description · ONE action)
 * → optional metadata. Exactly one recovery action is structural: `EmptyState.action` is a single
 * slot, so a second CTA has nowhere to go.
 *
 * Copy is shown inline here; in an app every string comes from the app's own `t()`.
 */
const sections: SidebarSectionProp[] = [
  {
    label: "業務",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "reports", label: "レポート", icon: BarChart3 },
      { id: "documents", label: "ドキュメント", icon: FileText },
    ],
  },
  { label: "管理", items: [{ id: "users", label: "ユーザー", icon: Users }] },
];

export default function Demo() {
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="reports"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "GodX Console", role: "管理コンソール" }}
        />
      }
      topbar={
        <Topbar
          start={<Logo glyph="G" />}
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
              <Button variant="ghost" size="sm">
                田中 太郎
              </Button>
            </Flex>
          }
        />
      }
    >
      <PageContainer
        title="レポート"
        breadcrumb={[{ label: "ホーム", to: "#" }, { label: "レポート" }]}
      >
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            403
          </Text>
          <EmptyState
            icon={ShieldAlert}
            tone="warning"
            titleLevel={2}
            title="このページへのアクセス権限がありません"
            description="レポートの閲覧には管理者によるロール付与が必要です。付与後に再度お試しください。"
            action={<Button>ダッシュボードへ戻る</Button>}
          />
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
