import { useState } from "react";
import {
  Form,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Form — Ant-style layout container. Sets layout (vertical/horizontal), labelWidth/controlWidth,
 * label alignment, responsive collapse and a multi-column grid ONCE on <Form>; every <FormField>
 * inherits and may override per-field. Mobile-first: horizontal collapses to vertical below
 * `collapseBelow` (default md). Composed only from real @godxjp/ui primitives.
 */
export default function Demo() {
  const [v, setV] = useState<Record<string, string>>({});
  const set = (k: string) => (e: { target: { value: string } }) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  return (
    <PageContainer
      title="Form"
      subtitle="Ant-style layout — vertical / horizontal / columns / per-field override"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Vertical (default)</CardTitle>
            <CardDescription>
              Label stacked above the control — the default for narrow forms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <FormField id="v-name" label="氏名" required>
                <Input
                  id="v-name"
                  value={v["v-name"] ?? ""}
                  onChange={set("v-name")}
                  placeholder="山田 太郎"
                />
              </FormField>
              <FormField id="v-email" label="メールアドレス" helper="連絡先として使用します">
                <Input
                  id="v-email"
                  type="email"
                  value={v["v-email"] ?? ""}
                  onChange={set("v-email")}
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horizontal (labelWidth 120, collapses to vertical below md)</CardTitle>
            <CardDescription>
              Label sits beside the control in a fixed 120px column. Resize below 768px (md) — it
              stacks back to vertical automatically (mobile-first).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth={120}>
              <FormField id="h-account" label="勘定科目" required>
                <Select
                  value={v["h-account"] ?? ""}
                  onValueChange={(val) => setV((s) => ({ ...s, "h-account": val }))}
                >
                  <SelectTrigger id="h-account">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">現金</SelectItem>
                    <SelectItem value="sales">売上高</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                id="h-amount"
                label="金額"
                helper="税込"
                error={v["h-amount"] === "0" ? "0 より大きい値を入力してください" : undefined}
              >
                <Input
                  id="h-amount"
                  inputMode="numeric"
                  value={v["h-amount"] ?? ""}
                  onChange={set("h-amount")}
                />
              </FormField>
              {/* Per-field override: keep this one vertical even though the Form is horizontal. */}
              <FormField id="h-memo" label="摘要（この行だけ vertical）" layout="vertical">
                <Input id="h-memo" value={v["h-memo"] ?? ""} onChange={set("h-memo")} />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two columns (columns=2, 姓+名 pair, address spans both)</CardTitle>
            <CardDescription>
              Multi-column grid (reuses ResponsiveGrid — 1 column on small screens). A wide field
              spans columns with `colSpan`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2}>
              <FormField id="c-last" label="姓" required>
                <Input
                  id="c-last"
                  value={v["c-last"] ?? ""}
                  onChange={set("c-last")}
                  placeholder="山田"
                />
              </FormField>
              <FormField id="c-first" label="名" required>
                <Input
                  id="c-first"
                  value={v["c-first"] ?? ""}
                  onChange={set("c-first")}
                  placeholder="太郎"
                />
              </FormField>
              <FormField id="c-address" label="住所" colSpan={2}>
                <Input
                  id="c-address"
                  value={v["c-address"] ?? ""}
                  onChange={set("c-address")}
                  placeholder="東京都千代田区…"
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horizontal — always (collapseBelow=false)</CardTitle>
            <CardDescription>
              Stays label-beside-control even on phones (use sparingly).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="6rem" collapseBelow={false}>
              <FormField id="a-code" label="コード">
                <Input id="a-code" value={v["a-code"] ?? ""} onChange={set("a-code")} />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Flex justify="end">
          <Button onClick={() => setV({})} variant="outline">
            リセット
          </Button>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
