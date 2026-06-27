import { useState } from "react";

import {
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  Field,
  Form,
  FormField,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  PasswordInput,
  Rating,
  RadioGroup,
  SearchInput,
  Select,
  Slider,
  Switch,
  TagInput,
  Textarea,
  TimePicker,
  ToggleGroup,
  ToggleGroupItem,
  TreeSelect,
  Upload,
  type UploadFileItem,
} from "@godxjp/ui/data-entry";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** No-op uploader: resolves immediately with a fake mediaId for preview purposes. */
async function noopUpload(_file: File, _item: UploadFileItem) {
  return { mediaId: "preview-media-id" };
}

/** Expense category tree for the Cascader field. */
const EXPENSE_CATEGORIES = [
  {
    value: "operating",
    label: "営業費用",
    children: [
      { value: "travel", label: "旅費交通費" },
      { value: "communication", label: "通信費" },
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

/** Account tree for the TreeSelect field. */
const ACCOUNT_TREE = [
  {
    value: "assets",
    label: "資産",
    children: [
      { value: "cash", label: "現金" },
      { value: "bank", label: "普通預金" },
      { value: "ar", label: "売掛金" },
    ],
  },
  {
    value: "expenses",
    label: "費用",
    children: [
      { value: "rent", label: "地代家賃" },
      { value: "utilities", label: "水道光熱費" },
    ],
  },
];

/**
 * Form — the comprehensive catalogue. One page proving (1) EVERY data-entry field type wired in a
 * FormField, (2) every Form LAYOUT (vertical / horizontal / inline / multi-column / responsive
 * collapse), and (3) every Form STATE (pristine · filled · required-error · helper · disabled ·
 * read-only · pending · success). Composed only from real @godxjp/ui primitives; all typography is
 * the Text/Heading primitive (never a hand-rolled span). For the full controlled validation flow,
 * see the example screens under Form → examples.
 */
export default function Demo() {
  // ── Field-catalogue state (each field independent) ─────────────────────────
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [memo, setMemo] = useState("");
  const [account, setAccount] = useState("");
  const [tree, setTree] = useState<string | undefined>();
  const [category, setCategory] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [rounding, setRounding] = useState("round");
  const [active, setActive] = useState(true);
  const [taxRate, setTaxRate] = useState<number[]>([10]);
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date(2026, 0, 15));
  const [period, setPeriod] = useState<DateRange | undefined>();
  const [closeTime, setCloseTime] = useState("17:30");
  const [score, setScore] = useState(4);
  const [tags, setTags] = useState<string[]>(["優先"]);
  const [otp, setOtp] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [period2, setPeriod2] = useState("monthly");

  return (
    <PageContainer
      title="Form"
      subtitle="全フィールド型 × 全レイアウト × 全状態 · 実画面のフォーム例 (real primitives only)"
    >
      <Flex direction="col" gap="lg">
        {/* ════════════════════ 1. EVERY FIELD TYPE ════════════════════ */}
        <Heading level={3}>1. 全フィールド型 · すべての入力コントロール</Heading>
        <Text tone="muted" size="sm">
          ライブラリが提供するデータ入力コンポーネントを 1 つずつ FormField
          でラップ。ラベル・ヘルパー・必須マークを付与し、aria-* は自動配線される。
        </Text>

        <Card>
          <CardHeader>
            <CardTitle>テキスト系 · Input / SearchInput / PasswordInput / Textarea</CardTitle>
            <CardDescription>
              文字列・検索・パスワード・複数行。type=email / inputMode=numeric も Input で表現する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2}>
              <FormField id="f-text" label="件名" required helper="最大50文字">
                <Input
                  id="f-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="2026年1月度 請求書"
                />
              </FormField>
              <FormField id="f-email" label="メールアドレス" helper="連絡先として使用します">
                <Input id="f-email" type="email" placeholder="taro@example.co.jp" />
              </FormField>
              <FormField id="f-search" label="取引先を検索">
                <SearchInput
                  id="f-search"
                  value={search}
                  onValueChange={setSearch}
                  onSearch={() => {}}
                  placeholder="社名・コードで検索…"
                />
              </FormField>
              <FormField id="f-pass" label="パスワード" required helper="8文字以上">
                <PasswordInput id="f-pass" placeholder="••••••••" />
              </FormField>
              <FormField id="f-memo" label="摘要" helper="任意" colSpan={2}>
                <Textarea
                  id="f-memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例: 4月分から取引開始"
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選択系 · Select / TreeSelect / Cascader</CardTitle>
            <CardDescription>
              単一選択・階層ツリー選択・カスケード選択。いずれも options/treeData
              でデータ駆動し、value/onValueChange で制御する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2}>
              <FormField id="f-account" label="勘定科目" required>
                <Select
                  id="f-account"
                  name="account"
                  value={account}
                  onValueChange={setAccount}
                  placeholder="選択してください"
                  options={[
                    { value: "cash", label: "現金" },
                    { value: "sales", label: "売上高" },
                    { value: "rent", label: "地代家賃" },
                  ]}
                />
              </FormField>
              <FormField id="f-tree" label="計上先科目">
                <TreeSelect
                  id="f-tree"
                  treeData={ACCOUNT_TREE}
                  value={tree}
                  onValueChange={(v) => setTree(v as string | undefined)}
                  placeholder="科目ツリーから選択…"
                />
              </FormField>
              <FormField id="f-category" label="経費カテゴリ" colSpan={2}>
                <Cascader
                  id="f-category"
                  options={EXPENSE_CATEGORIES}
                  value={category}
                  onValueChange={(v) => setCategory(v as string[])}
                  showSearch
                  placeholder="カテゴリを選択…"
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>真偽・選択肢系 · Checkbox / CheckboxGroup / RadioGroup / Switch</CardTitle>
            <CardDescription>
              単一チェック・複数チェック・排他選択・トグル。Checkbox/Switch は Field
              でラベルと横並びにする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="f-terms"
                label="利用規約に同意する"
                description="同意しないと送信できません"
              >
                <Checkbox id="f-terms" checked={terms} onCheckedChange={(c) => setTerms(!!c)} />
              </Field>
              <FormField id="f-channels" label="通知チャネル" helper="複数選択可">
                <CheckboxGroup
                  value={channels}
                  onValueChange={setChannels}
                  options={[
                    { value: "email", label: "メール" },
                    { value: "slack", label: "Slack" },
                    { value: "sms", label: "SMS" },
                  ]}
                />
              </FormField>
              <FormField id="f-rounding" label="端数処理">
                <RadioGroup
                  value={rounding}
                  onValueChange={setRounding}
                  orientation="horizontal"
                  options={[
                    { value: "round", label: "四捨五入" },
                    { value: "floor", label: "切り捨て" },
                    { value: "ceil", label: "切り上げ" },
                  ]}
                />
              </FormField>
              <Field
                id="f-active"
                label="取引を有効にする"
                description="無効にすると新規取引を登録できません"
              >
                <Switch id="f-active" checked={active} onCheckedChange={setActive} />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>数値・範囲系 · Slider / Rating</CardTitle>
            <CardDescription>
              連続値スライダーと星評価。value は配列／数値で制御する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="f-tax" label={`消費税率: ${taxRate[0]}%`} helper="0% / 8% / 10%">
                <Slider
                  id="f-tax"
                  value={taxRate}
                  onValueChange={setTaxRate}
                  min={0}
                  max={10}
                  step={2}
                  name="tax_rate"
                  aria-label="消費税率"
                />
              </FormField>
              <FormField id="f-score" label="取引先評価">
                <Rating
                  name="vendor_score"
                  aria-label="取引先評価"
                  value={score}
                  onValueChange={setScore}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>日時系 · DatePicker / DateRangePicker / TimePicker</CardTitle>
            <CardDescription>
              単一日付・期間・時刻。ISO-8601 / IANA タイムゾーンに準拠し locale
              連動でフォーマットする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2}>
              <FormField id="f-issue" label="発行日" required>
                <DatePicker
                  id="f-issue"
                  name="issue_date"
                  value={issueDate}
                  onValueChange={setIssueDate}
                />
              </FormField>
              <FormField id="f-time" label="締め時刻">
                <TimePicker
                  id="f-time"
                  name="close_time"
                  value={closeTime}
                  onValueChange={setCloseTime}
                  minuteStep={15}
                />
              </FormField>
              <FormField id="f-period" label="会計期間" colSpan={2}>
                <DateRangePicker
                  id="f-period"
                  name="period"
                  value={period}
                  onValueChange={setPeriod}
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>その他 · TagInput / ToggleGroup / InputOTP / Upload</CardTitle>
            <CardDescription>
              タグ入力・セグメント切替・ワンタイムコード・ファイル添付。すべて FormField
              でラベル付けする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="f-tags" label="ラベル" helper="Enter またはカンマで追加">
                <TagInput
                  value={tags}
                  onValueChange={setTags}
                  placeholder="ラベルを追加…"
                  name="labels"
                />
              </FormField>
              <FormField id="f-period2" label="集計期間">
                <ToggleGroup
                  type="single"
                  value={period2}
                  onValueChange={(v) => {
                    if (v) setPeriod2(v);
                  }}
                >
                  <ToggleGroupItem value="daily">日次</ToggleGroupItem>
                  <ToggleGroupItem value="monthly">月次</ToggleGroupItem>
                  <ToggleGroupItem value="yearly">年次</ToggleGroupItem>
                </ToggleGroup>
              </FormField>
              <FormField id="f-otp" label="認証コード" helper="メールに届いた6桁の数字">
                <InputOTP id="f-otp" maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormField>
              <FormField id="f-files" label="添付ファイル" helper="PDF・Excel（最大5件）">
                <Upload
                  variant="dropzone"
                  value={files}
                  onValueChange={setFiles}
                  accept=".pdf,.xlsx,.csv"
                  maxCount={5}
                  onUpload={noopUpload}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        {/* ════════════════════ 2. EVERY LAYOUT ════════════════════ */}
        <Heading level={3}>2. レイアウト · vertical / horizontal / inline / columns</Heading>

        <Card>
          <CardHeader>
            <CardTitle>Vertical（デフォルト）</CardTitle>
            <CardDescription>ラベルをコントロールの上に積む。狭いフォームの既定。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <FormField id="l-v-name" label="氏名" required>
                <Input id="l-v-name" placeholder="山田 太郎" />
              </FormField>
              <FormField id="l-v-email" label="メールアドレス" helper="連絡先として使用します">
                <Input id="l-v-email" type="email" placeholder="taro@example.co.jp" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horizontal（labelWidth 120 · md未満で縦に折り返し）</CardTitle>
            <CardDescription>
              ラベルを固定幅120pxの列に置き、コントロールと横並び。768px (md)
              未満で自動的に縦積みへ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth={120}>
              <FormField id="l-h-account" label="勘定科目" required>
                <Select
                  id="l-h-account"
                  name="h_account"
                  placeholder="選択してください"
                  options={[
                    { value: "cash", label: "現金" },
                    { value: "sales", label: "売上高" },
                  ]}
                />
              </FormField>
              <FormField id="l-h-amount" label="金額" helper="税込">
                <Input id="l-h-amount" inputMode="numeric" placeholder="100000" />
              </FormField>
              {/* Per-field override: keep this one vertical even though the Form is horizontal. */}
              <FormField id="l-h-memo" label="摘要（この行だけ vertical）" layout="vertical">
                <Input id="l-h-memo" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inline · フィルターバー（layout=inline · Flex で横並び）</CardTitle>
            <CardDescription>
              一覧画面上部の絞り込みバー。layout=inline でラベルをコントロールの左に詰め、Flex
              direction=row でフィールドを横一列に並べ、末尾に適用ボタンを置く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="inline">
              <Flex direction="row" gap="md" wrap align="end">
                <FormField id="l-i-keyword" label="キーワード">
                  <SearchInput id="l-i-keyword" onSearch={() => {}} placeholder="取引先名…" />
                </FormField>
                <FormField id="l-i-status" label="ステータス">
                  <Select
                    id="l-i-status"
                    name="i_status"
                    placeholder="すべて"
                    options={[
                      { value: "draft", label: "下書き" },
                      { value: "paid", label: "入金済" },
                    ]}
                  />
                </FormField>
                <Button type="button">絞り込む</Button>
              </Flex>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Columns（columns=2 · 姓+名ペア · 住所は2列span）</CardTitle>
            <CardDescription>
              複数列グリッド（ResponsiveGrid · 小画面では1列）。広いフィールドは colSpan
              で列をまたぐ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2}>
              <FormField id="l-c-last" label="姓" required>
                <Input id="l-c-last" placeholder="山田" />
              </FormField>
              <FormField id="l-c-first" label="名" required>
                <Input id="l-c-first" placeholder="太郎" />
              </FormField>
              <FormField id="l-c-address" label="住所" colSpan={2}>
                <Input id="l-c-address" placeholder="東京都千代田区…" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horizontal · 常時（collapseBelow=false）</CardTitle>
            <CardDescription>
              スマホでもラベル横並びを維持（多用しない）。labelAlign=start で左揃えに。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="6rem" labelAlign="start" collapseBelow={false}>
              <FormField id="l-a-code" label="コード">
                <Input id="l-a-code" placeholder="BTY-0012" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        {/* ════════════════════ 3. EVERY STATE ════════════════════ */}
        <Heading level={3}>3. 状態 · pristine / filled / error / disabled / read-only</Heading>

        <Card>
          <CardHeader>
            <CardTitle>必須エラー · ヘルパー · disabled · read-only</CardTitle>
            <CardDescription>
              required は赤いアスタリスク、error (role=alert) はヘルパーを上書きし aria-invalid
              を立てる。 disabled は操作不可、read-only は値を表示するが編集不可。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <FormField id="s-name" label="取引先名" required error="取引先名は必須です">
                <Input id="s-name" placeholder="株式会社…" />
              </FormField>
              <FormField id="s-email" label="メール" error="メールアドレスの形式が正しくありません">
                <Input id="s-email" type="email" defaultValue="invalid@" />
              </FormField>
              <FormField id="s-filled" label="コード" helper="一意のコードを入力">
                <Input id="s-filled" defaultValue="BTY-0012" />
              </FormField>
              <FormField id="s-disabled" label="登録番号（システム発番 · disabled）">
                <Input id="s-disabled" disabled defaultValue="INV-2026-0001" />
              </FormField>
              <FormField id="s-readonly" label="作成日時（read-only）">
                <Input id="s-readonly" readOnly defaultValue="2026-01-15 09:32" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Flex justify="end">
          <Text tone="muted" size="sm">
            送信・pending・成功を含む完全な検証フローは Form → examples を参照。
          </Text>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
