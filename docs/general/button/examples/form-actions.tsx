import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button, Logo } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import { BookOpen, FileText, LayoutDashboard, ReceiptText, Users } from "lucide-react";

/**
 * Form page — the primary submit + outline cancel live in PageContainer's
 * `footer` slot (stickyFooter pins it as the form scrolls). No hand-rolled
 * footer bar; the page shell owns it.
 */
const sections: SidebarSection[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
      { id: "invoices", label: "請求書", icon: ReceiptText },
      { id: "partners", label: "取引先", icon: BookOpen },
    ],
  },
  { label: "管理", items: [{ id: "users", label: "ユーザー", icon: Users }] },
];

export default function Demo() {
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="partners"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreBooks", role: "管理コンソール", color: "hsl(var(--primary))" }}
        />
      }
      topbar={<Topbar start={<Logo label="CoreBooks" glyph="C" />} />}
    >
      <PageContainer
        title="取引先の編集"
        subtitle="株式会社ベトヤ · BTY-0012"
        breadcrumb={[{ label: "取引先", to: "#" }, { label: "編集" }]}
        footer={
          <Flex direction="row" wrap gap="sm" justify="end">
            <Button variant="outline" type="button">
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="md">
          <FormField id="name" label="取引先名">
            <Input id="name" defaultValue="株式会社ベトヤ" />
          </FormField>
          <FormField id="code" label="取引先コード">
            <Input id="code" defaultValue="BTY-0012" />
          </FormField>
          <FormField id="contact" label="担当者">
            <Input id="contact" defaultValue="グエン・ヴァン・A" />
          </FormField>
          <FormField id="email" label="メール">
            <Input id="email" type="email" defaultValue="ke-toan@betoya.test" />
          </FormField>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
