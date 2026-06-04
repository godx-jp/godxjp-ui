import { useState } from "react";

import { Field, FormField, Input, Select, Switch, Textarea } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
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
 * Create form — a real screen: FormField wraps each stacked control (Input /
 * Select / Textarea), Field pairs the Switch with its label, and the page's
 * footer holds the primary submit + outline cancel. The canonical data-entry
 * page, composed only from real @godxjp/ui components.
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
  const [type, setType] = useState("corp");

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
      topbar={
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(var(--primary))" }}
          onSearchOpen={() => {}}
        />
      }
    >
      <PageContainer
        title="取引先を作成"
        breadcrumb={[{ label: "取引先", to: "#" }, { label: "新規" }]}
        footer={
          <Flex direction="row" wrap gap="sm" justify="end">
            <Button variant="outline" type="button">
              キャンセル
            </Button>
            <Button type="submit">作成</Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="md" className="max-w-2xl">
          <FormField id="cf-name" label="取引先名" required helper="最大50文字">
            <Input id="cf-name" placeholder="株式会社ベトヤ" />
          </FormField>
          <FormField id="cf-code" label="取引先コード" required helper="一意のコードを入力">
            <Input id="cf-code" placeholder="BTY-0012" />
          </FormField>
          <FormField id="cf-type" label="区分">
            <Select
              id="cf-type"
              name="type"
              value={type}
              onValueChange={setType}
              options={[
                { value: "corp", label: "法人" },
                { value: "indiv", label: "個人事業主" },
              ]}
            />
          </FormField>
          <FormField id="cf-memo" label="メモ" helper="任意">
            <Textarea id="cf-memo" placeholder="例: 4月分から取引開始" />
          </FormField>
          <Field
            id="cf-active"
            label="取引を有効にする"
            description="無効にすると新規取引を登録できません"
          >
            <Switch id="cf-active" defaultChecked />
          </Field>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
