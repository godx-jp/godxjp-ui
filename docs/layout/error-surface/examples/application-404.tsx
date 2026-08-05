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
 * 404 — `mode="application"` with the optional request ID. Same preserved shell, same surface; only
 * `status` changes, and with it the default icon (SearchX) and tone (muted — a miss is neutral, not
 * a warning). You do not re-pick the icon or the colour per status: the status IS the input.
 *
 * `requestId` is a semantic metadata slot, not a paragraph you write. The surface renders it as a
 * `<dt>/<dd>` pair with a localized "Request ID" label and a mono/tabular value, so the correlation
 * id can be read out or copied accurately for support, and so a screen reader announces the
 * label↔value relationship instead of a run-on sentence. Omit the prop when there is no id —
 * metadata rows are optional and the list disappears entirely when every slot is empty.
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
        <ErrorSurface
          mode="application"
          status={404}
          title="ページが見つかりません"
          description="お探しのドキュメントは移動または削除された可能性があります。一覧から選び直してください。"
          requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
          action={<Button>ドキュメント一覧へ</Button>}
        />
      </PageContainer>
    </AppShell>
  );
}
