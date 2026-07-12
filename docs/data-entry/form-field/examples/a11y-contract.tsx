import { useState } from "react";

import {
  Cascader,
  CheckboxGroup,
  ColorPicker,
  DatePicker,
  DateRangePicker,
  Form,
  FormField,
  Input,
  MonthPicker,
  RadioGroup,
  SearchInput,
  Select,
  TimePicker,
  TreeSelect,
} from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * FormField × custom controls — the accessible-name/description/error contract.
 *
 * Every control below is wrapped in a FormField that provides the visible label, helper and error.
 * FormField injects `aria-labelledby` / `aria-describedby` / `aria-errormessage` / `aria-invalid` /
 * `aria-required` onto the control, which FORWARDS them to its real semantic focus target — the
 * combobox trigger, the typeable input, or (for groups/ranges) the `role=group`/`role=radiogroup`
 * container. Open a screen reader or run axe on this frame: the visible label names the actual
 * control, not a wrapper div. Composed only from real @godxjp/ui components.
 */

const REGIONS = [
  {
    value: "jp",
    label: "日本",
    children: [
      { value: "kanto", label: "関東", children: [{ value: "tokyo", label: "東京都" }] },
      { value: "kansai", label: "関西", children: [{ value: "osaka", label: "大阪府" }] },
    ],
  },
];

const CATEGORIES = [
  {
    value: "acct",
    label: "会計",
    children: [
      { value: "sales", label: "売上高" },
      { value: "rent", label: "地代家賃" },
    ],
  },
];

const CURRENCIES = [
  { value: "jpy", label: "日本円 (JPY)" },
  { value: "usd", label: "米ドル (USD)" },
  { value: "vnd", label: "ベトナムドン (VND)" },
];

export default function Demo() {
  // Async / server validation + recovery: submit runs a fake server check, sets an error on the
  // "code" field and focuses it; entering a valid code and resubmitting clears the error.
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "checking" | "ok">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("checking");
    // Simulate a server round-trip (a real app would call its API here).
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (code.trim().length < 4) {
      setCodeError("コードは4文字以上で、サーバー上で一意である必要があります");
      setStatus("idle");
      // Submit focus: move focus to the first invalid control by its FormField id.
      document.getElementById("ac-code")?.focus();
      return;
    }
    setCodeError(undefined);
    setStatus("ok");
  };

  return (
    <PageContainer
      title="FormField × カスタムコントロール"
      subtitle="ラベル・ヘルプ・エラーの ARIA 契約：フォーカス先の実コントロールに転送"
    >
      <Flex direction="col" gap="lg" className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>ポップアップ系コントロール（combobox 契約）</CardTitle>
            <CardDescription>
              Select（showSearch 含む）/ Cascader / TreeSelect / 各ピッカーはトリガー（combobox）に
              aria-labelledby・aria-describedby・aria-expanded・aria-controls を転送します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="ac-account" label="勘定科目" required helper="仕訳で使用する科目">
                <Select
                  id="ac-account"
                  name="account"
                  showSearch
                  options={[
                    { value: "sales", label: "売上高" },
                    { value: "rent", label: "地代家賃" },
                    { value: "misc", label: "雑費" },
                  ]}
                  onValueChange={() => {}}
                />
              </FormField>
              <FormField id="ac-currency" label="通貨" helper="ISO 4217">
                <Select
                  id="ac-currency"
                  name="currency"
                  options={CURRENCIES}
                  onValueChange={() => {}}
                />
              </FormField>
              <FormField id="ac-region" label="地域" helper="都道府県まで選択">
                <Cascader id="ac-region" options={REGIONS} onValueChange={() => {}} />
              </FormField>
              <FormField id="ac-category" label="カテゴリ" helper="ツリーから選択">
                <TreeSelect id="ac-category" treeData={CATEGORIES} onValueChange={() => {}} />
              </FormField>
              <FormField id="ac-date" label="取引日" helper="yyyy-MM-dd">
                <DatePicker id="ac-date" name="date" />
              </FormField>
              <FormField id="ac-month" label="対象月" helper="yyyy/MM">
                <MonthPicker id="ac-month" name="month" />
              </FormField>
              <FormField id="ac-time" label="締め時刻" helper="24時間表記">
                <TimePicker id="ac-time" name="time" />
              </FormField>
              <FormField id="ac-period" label="対象期間" helper="開始日と終了日">
                <DateRangePicker id="ac-period" name="period" />
              </FormField>
              <FormField id="ac-color" label="タグ色" helper="16進カラー">
                <ColorPicker id="ac-color" onValueChange={() => {}} />
              </FormField>
              <FormField id="ac-search" label="取引先検索" helper="名称の一部で検索">
                <SearchInput id="ac-search" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>グループ系コントロール（group / radiogroup 契約）</CardTitle>
            <CardDescription>
              RadioGroup は role=radiogroup で完全な検証 ARIA を、CheckboxGroup は role=group で
              ラベルと説明（エラーは説明に統合）を公開します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="ac-method"
                label="支払方法"
                required
                error="支払方法を選択してください"
              >
                <RadioGroup
                  id="ac-method"
                  options={[
                    { value: "bank", label: "銀行振込" },
                    { value: "card", label: "クレジットカード" },
                    { value: "cash", label: "現金" },
                  ]}
                  onValueChange={() => {}}
                />
              </FormField>
              <FormField id="ac-tags" label="タグ" helper="複数選択できます">
                <CheckboxGroup
                  id="ac-tags"
                  orientation="horizontal"
                  options={[
                    { value: "urgent", label: "至急" },
                    { value: "review", label: "要確認" },
                    { value: "archived", label: "アーカイブ" },
                  ]}
                  onValueChange={() => {}}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>エラーのタイミング・非同期検証・回復</CardTitle>
            <CardDescription>
              エラーは送信後にのみ表示（role=alert
              で即時アナウンス）。修正して再送信するとエラーが解除され、 helper
              に戻ります。送信時は最初の不正なコントロールへフォーカスします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form onSubmit={submit} layout="vertical">
              <Flex direction="col" gap="md">
                <FormField
                  id="ac-code"
                  label="取引先コード"
                  required
                  helper="4文字以上・サーバー上で一意"
                  error={codeError}
                >
                  <Input
                    id="ac-code"
                    name="code"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      if (codeError) setCodeError(undefined);
                    }}
                  />
                </FormField>
                {status === "ok" ? (
                  <Alert tone="success">
                    <AlertTitle>検証に成功しました</AlertTitle>
                    <AlertDescription>コードは利用可能です。</AlertDescription>
                  </Alert>
                ) : null}
                <Flex direction="row" justify="end">
                  <Button type="submit" loading={status === "checking"}>
                    検証して送信
                  </Button>
                </Flex>
              </Flex>
            </Form>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
