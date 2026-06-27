import { useState } from "react";

import { Descriptions } from "@godxjp/ui/data-display";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Button, Logo } from "@godxjp/ui/general";
import { AppShell, PageContainer, Sidebar, type SidebarSection, Topbar } from "@godxjp/ui/layout";
import { BookOpen, FileText, LayoutDashboard, ReceiptText, Trash2, Users } from "lucide-react";

/**
 * Destructive confirmation — the irreversible "削除" action opens an AlertDialog
 * (the canonical confirm primitive, role="alertdialog", variant="destructive"),
 * never a hand-rolled Card + buttons. Cancel dismisses; confirm runs onConfirm.
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
  const [open, setOpen] = useState(true);

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="journal"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreBooks", role: "管理コンソール", color: "hsl(var(--primary))" }}
        />
      }
      topbar={<Topbar start={<Logo label="CoreBooks" glyph="C" />} />}
    >
      <PageContainer
        title="仕訳 #2024-0312"
        subtitle="2024-04-12 · 承認済"
        breadcrumb={[{ label: "仕訳", to: "#" }, { label: "#2024-0312" }]}
        extra={
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash2 />
            削除
          </Button>
        }
      >
        <Descriptions>
          <Descriptions.Item label="日付">2024-04-12</Descriptions.Item>
          <Descriptions.Item label="借方">売掛金 ¥482,000</Descriptions.Item>
          <Descriptions.Item label="貸方">売上高 ¥438,182 / 仮受消費税 ¥43,818</Descriptions.Item>
          <Descriptions.Item label="取引先">株式会社ベトヤ</Descriptions.Item>
          <Descriptions.Item label="摘要">4月分 受注 INV-2024-0312</Descriptions.Item>
        </Descriptions>

        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="仕訳を削除しますか？"
          description="この操作は取り消せません。仕訳 #2024-0312 を完全に削除します。"
          confirmLabel="削除する"
          cancelLabel="キャンセル"
          variant="destructive"
          onConfirm={() => setOpen(false)}
        />
      </PageContainer>
    </AppShell>
  );
}
