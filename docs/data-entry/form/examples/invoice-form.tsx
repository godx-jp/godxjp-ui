import { useState } from "react";

import {
  Cascader,
  DatePicker,
  DateRangePicker,
  Field,
  Form,
  FormField,
  Input,
  Select,
  Slider,
  Switch,
  TagInput,
  Textarea,
} from "@godxjp/ui/data-entry";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import { BookOpen, FileText, LayoutDashboard, Loader2, ReceiptText, Users } from "lucide-react";

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

const EXPENSE_CATEGORIES = [
  {
    value: "operating",
    label: "営業費用",
    children: [
      { value: "travel", label: "旅費交通費" },
      { value: "supplies", label: "消耗品費" },
    ],
  },
  {
    value: "labor",
    label: "人件費",
    children: [
      { value: "salary", label: "給与手当" },
      { value: "bonus", label: "賞与" },
    ],
  },
];

/** The form's controlled value shape. */
interface InvoiceForm {
  partner: string;
  code: string;
  account: string;
  category: string[];
  issueDate: Date | undefined;
  period: DateRange | undefined;
  amount: string;
  taxRate: number[];
  labels: string[];
  memo: string;
  draft: boolean;
}

const EMPTY: InvoiceForm = {
  partner: "",
  code: "",
  account: "",
  category: [],
  issueDate: undefined,
  period: undefined,
  amount: "",
  taxRate: [10],
  labels: [],
  memo: "",
  draft: false,
};

type Errors = Partial<Record<keyof InvoiceForm, string>>;

/** Required-field validation — returns a message per empty required field. */
function validate(v: InvoiceForm): Errors {
  const e: Errors = {};
  if (!v.partner.trim()) e.partner = "取引先名は必須です";
  if (!v.code.trim()) e.code = "取引先コードは必須です";
  if (!v.account) e.account = "勘定科目を選択してください";
  if (!v.issueDate) e.issueDate = "発行日を選択してください";
  if (!v.amount.trim()) e.amount = "金額を入力してください";
  else if (!/^\d+$/.test(v.amount)) e.amount = "金額は半角数字で入力してください";
  return e;
}

/**
 * Invoice form — a complete, realistic multi-section form with the full controlled validation flow.
 * Sections are Card blocks; the action bar (Cancel + Submit, primary rightmost — rule 41) lives in
 * the PageContainer footer. Submitting with empty required fields renders an inline error under each
 * field AND a summary Alert; fixing a field clears its error live; a valid submit shows a pending
 * spinner (button disabled) then a success Alert. Composed only from real @godxjp/ui primitives.
 */
export default function Demo() {
  const [v, setV] = useState<InvoiceForm>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");

  // Update one field and clear its error live (validation-on-fix).
  function update<K extends keyof InvoiceForm>(key: K, value: InvoiceForm[K]) {
    setV((s) => ({ ...s, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    if (status === "success") setStatus("idle");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(v);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("idle");
      return;
    }
    // Valid: simulate an async submit — spinner + disabled button, then success.
    setStatus("pending");
    window.setTimeout(() => setStatus("success"), 1200);
  }

  function handleReset() {
    setV(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const pending = status === "pending";

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="invoices"
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
        title="請求書を作成"
        breadcrumb={[{ label: "請求書", to: "#" }, { label: "新規" }]}
        footer={
          <Flex direction="row" wrap gap="sm" justify="end">
            <Button variant="outline" type="button" onClick={handleReset} disabled={pending}>
              キャンセル
            </Button>
            <Button type="submit" form="invoice-form" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  送信中…
                </>
              ) : (
                "作成"
              )}
            </Button>
          </Flex>
        }
      >
        <Form id="invoice-form" onSubmit={handleSubmit}>
          <Flex direction="col" gap="lg" className="max-w-3xl">
            {/* Summary feedback — success after a valid submit, or an error summary on failure. */}
            {status === "success" ? (
              <Alert tone="success">
                <AlertTitle>請求書を作成しました</AlertTitle>
                <AlertDescription>
                  {v.partner} 宛の請求書（{v.code}）を保存しました。
                </AlertDescription>
              </Alert>
            ) : errorCount > 0 ? (
              <Alert tone="destructive">
                <AlertTitle>入力内容を確認してください</AlertTitle>
                <AlertDescription>
                  {errorCount} 件の必須項目が未入力です。各項目のエラーメッセージをご確認ください。
                </AlertDescription>
              </Alert>
            ) : null}

            {/* ── Section: 取引先 ── */}
            <Card>
              <CardHeader>
                <CardTitle>取引先</CardTitle>
                <CardDescription>請求先の取引先名とコードを入力します。</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid columns={2}>
                  <FormField
                    id="iv-partner"
                    label="取引先名"
                    required
                    helper="最大50文字"
                    error={errors.partner}
                  >
                    <Input
                      id="iv-partner"
                      value={v.partner}
                      onChange={(e) => update("partner", e.target.value)}
                      placeholder="株式会社ベトヤ"
                      disabled={pending}
                    />
                  </FormField>
                  <FormField
                    id="iv-code"
                    label="取引先コード"
                    required
                    helper="一意のコード"
                    error={errors.code}
                  >
                    <Input
                      id="iv-code"
                      value={v.code}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="BTY-0012"
                      disabled={pending}
                    />
                  </FormField>
                </ResponsiveGrid>
              </CardContent>
            </Card>

            {/* ── Section: 仕訳 ── */}
            <Card>
              <CardHeader>
                <CardTitle>仕訳</CardTitle>
                <CardDescription>
                  勘定科目・経費カテゴリ・金額・税率・日付を入力します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid columns={2}>
                  <FormField id="iv-account" label="勘定科目" required error={errors.account}>
                    <Select
                      id="iv-account"
                      name="account"
                      value={v.account}
                      onValueChange={(val) => update("account", val)}
                      placeholder="選択してください"
                      disabled={pending}
                      options={[
                        { value: "sales", label: "売上高" },
                        { value: "rent", label: "地代家賃" },
                        { value: "supplies", label: "消耗品費" },
                      ]}
                    />
                  </FormField>
                  <FormField id="iv-category" label="経費カテゴリ">
                    <Cascader
                      id="iv-category"
                      options={EXPENSE_CATEGORIES}
                      value={v.category}
                      onValueChange={(val) => update("category", val as string[])}
                      placeholder="カテゴリを選択…"
                      disabled={pending}
                    />
                  </FormField>
                  <FormField id="iv-issue" label="発行日" required error={errors.issueDate}>
                    <DatePicker
                      id="iv-issue"
                      name="issue_date"
                      value={v.issueDate}
                      onValueChange={(d) => update("issueDate", d)}
                    />
                  </FormField>
                  <FormField id="iv-period" label="対象期間">
                    <DateRangePicker
                      id="iv-period"
                      name="period"
                      value={v.period}
                      onValueChange={(r) => update("period", r)}
                    />
                  </FormField>
                  <FormField
                    id="iv-amount"
                    label="金額"
                    required
                    helper="税抜・半角数字"
                    error={errors.amount}
                  >
                    <Input
                      id="iv-amount"
                      inputMode="numeric"
                      value={v.amount}
                      onChange={(e) => update("amount", e.target.value)}
                      placeholder="100000"
                      disabled={pending}
                    />
                  </FormField>
                  <FormField
                    id="iv-tax"
                    label={`消費税率: ${v.taxRate[0]}%`}
                    helper="0% / 8% / 10%"
                  >
                    <Slider
                      id="iv-tax"
                      value={v.taxRate}
                      onValueChange={(val) => update("taxRate", val)}
                      min={0}
                      max={10}
                      step={2}
                      name="tax_rate"
                      aria-label="消費税率"
                    />
                  </FormField>
                </ResponsiveGrid>
              </CardContent>
            </Card>

            {/* ── Section: 補足 ── */}
            <Card>
              <CardHeader>
                <CardTitle>補足</CardTitle>
                <CardDescription>ラベル・摘要と下書き保存の設定。</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid columns={2}>
                  <FormField id="iv-labels" label="ラベル" helper="Enter またはカンマで追加">
                    <TagInput
                      value={v.labels}
                      onValueChange={(val) => update("labels", val)}
                      placeholder="ラベルを追加…"
                      name="labels"
                    />
                  </FormField>
                  <FormField id="iv-memo" label="摘要" helper="任意" colSpan={2}>
                    <Textarea
                      id="iv-memo"
                      value={v.memo}
                      onChange={(e) => update("memo", e.target.value)}
                      placeholder="例: 4月分から取引開始"
                      disabled={pending}
                    />
                  </FormField>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field
                      id="iv-draft"
                      label="下書きとして保存する"
                      description="送信せず下書きに保存します"
                    >
                      <Switch
                        id="iv-draft"
                        checked={v.draft}
                        onCheckedChange={(c) => update("draft", c)}
                        disabled={pending}
                      />
                    </Field>
                  </div>
                </ResponsiveGrid>
              </CardContent>
            </Card>
          </Flex>
        </Form>
      </PageContainer>
    </AppShell>
  );
}
