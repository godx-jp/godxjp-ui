import { Button, Logo } from "@godxjp/ui/general";
import {
  AppShell,
  ErrorSurface,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";
import { BarChart3, FileText, LayoutDashboard, Users } from "lucide-react";

/**
 * 403 — `mode="application"`. The failure happened INSIDE the authenticated app, so the app shell is
 * PRESERVED: the sidebar nav, the topbar and the breadcrumb all survive, and only the page body is
 * replaced. The user is never stranded on a chrome-less page with a single "go home" button.
 *
 * READ THE MODE CONTRACT: `mode="application"` does NOT make the component build a shell. It cannot
 * — the nav sections, the product identity and the user menu are consumer-owned data. The mode says
 * "this is what you put in AppShell's children": the surface returns just its own block, and the
 * `AppShell` the route already renders stays mounted around it.
 *
 * 403 is the one status where WHY matters as much as WHAT, so both permission slots are used here:
 * `permission` names the missing role and `organization` names the workspace the request was scoped
 * to — that pair is what distinguishes "you need a role" from "you are in the wrong tenant". Both
 * are semantic `<dt>/<dd>` rows whose LABELS are library-owned and localized; you pass bare values.
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
        <ErrorSurface
          mode="application"
          status={403}
          title="このページへのアクセス権限がありません"
          description="レポートの閲覧には管理者によるロール付与が必要です。付与後に再度お試しください。"
          permission="reports.view"
          organization="株式会社ゴッドエックス"
          action={<Button>ダッシュボードへ戻る</Button>}
        />
      </PageContainer>
    </AppShell>
  );
}
