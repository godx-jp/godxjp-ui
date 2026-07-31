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
import { BarChart3, FileText, LayoutDashboard, SearchX, Users } from "lucide-react";

/**
 * 404 — APPLICATION mode with an optional request ID. Same preserved shell, same three-part body;
 * only the status, icon, tone and copy differ from 403.
 *
 * The request ID is a plain metadata line under the action (`Text size="xs" mono`) — mono so the
 * correlation id can be read out or copied accurately for support, and muted so it never competes
 * with the single recovery action. Omit the line when the page has no correlation id: metadata is
 * an OPTIONAL slot, not a required row.
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
          activeId="documents"
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
        title="ドキュメント"
        breadcrumb={[{ label: "ホーム", to: "#" }, { label: "ドキュメント" }]}
      >
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            404
          </Text>
          <EmptyState
            icon={SearchX}
            titleLevel={2}
            title="ページが見つかりません"
            description="お探しのドキュメントは移動または削除された可能性があります。一覧から選び直してください。"
            action={<Button>ドキュメント一覧へ</Button>}
          />
          <Text as="p" size="xs" tone="muted" mono>
            リクエスト ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B
          </Text>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
