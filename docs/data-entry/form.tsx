import { useState } from "react";

import {
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Field,
  Form,
  FormErrors,
  FormErrorsProvider,
  FormField,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  NumberInput,
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

/** Keep the upload lifecycle visible in the form example. */
async function noopUpload(_file: File, _item: UploadFileItem) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { mediaId: crypto.randomUUID() };
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

/** 都道府県 — 住所の複合行の先頭。value は ISO 3166-2:JP のサブディビジョンコード。 */
const PREFECTURES = [
  { value: "JP-13", label: "東京都" },
  { value: "JP-14", label: "神奈川県" },
  { value: "JP-27", label: "大阪府" },
  { value: "JP-23", label: "愛知県" },
  { value: "JP-01", label: "北海道" },
];

/** 生年月日の 年/月/日 3連 Select — 日本の業務フォームで最も多い複合フィールド。 */
const BIRTH_YEARS = Array.from({ length: 60 }, (_, index) => {
  const year = 2006 - index;
  return { value: String(year), label: `${year}年` };
});
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}月`,
}));
const DAYS = Array.from({ length: 31 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}日`,
}));

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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [score, setScore] = useState(4);
  const [tags, setTags] = useState<string[]>(["優先"]);
  const [otp, setOtp] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [period2, setPeriod2] = useState("monthly");

  // ── 複合フィールド（1ラベル × 複数入力）の状態 ─────────────────────────────
  const [lastName, setLastName] = useState("山田");
  const [firstName, setFirstName] = useState("太郎");
  const [kanaLast, setKanaLast] = useState("ヤマダ");
  const [kanaFirst, setKanaFirst] = useState("タロウ");
  const [zip1, setZip1] = useState("100");
  const [zip2, setZip2] = useState("0005");
  const [prefecture, setPrefecture] = useState("JP-13");
  const [birthYear, setBirthYear] = useState("1988");
  const [birthMonth, setBirthMonth] = useState("4");
  const [birthDay, setBirthDay] = useState("");

  // ── Textarea 系の状態（文字数カウンタ・自動伸長） ──────────────────────────
  const [remarks, setRemarks] = useState("初回取引のため与信枠は50万円で開始する。");
  const [thread, setThread] = useState("");

  return (
    <PageContainer
      title="Form"
      subtitle="全フィールド型 × 全レイアウト × 全状態 · 実画面のフォーム例 (real primitives only)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Validation feedback</CardTitle>
            <CardDescription>確認中・成功・注意・エラーを区別します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form requiredMark="optional">
              <FormField label="確認済み" hasFeedback validateStatus="success">
                <Input defaultValue="verified@example.jp" />
              </FormField>
              <FormField label="確認中" hasFeedback validateStatus="validating">
                <Input defaultValue="checking@example.jp" />
              </FormField>
              <FormField
                label="注意"
                hasFeedback
                validateStatus="warning"
                helper="内容を確認してください。"
              >
                <Input defaultValue="review@example.jp" />
              </FormField>
              <FormField
                label="エラー"
                required
                hasFeedback
                error="メールアドレスを入力してください。"
              >
                <Input />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        {/* ════════════════════ 1. COMPOUND FIELDS ════════════════════ */}
        <Heading level={2}>1. 複合フィールド · 1つのラベルに複数の入力欄</Heading>
        <Text tone="muted" size="sm">
          日本の業務フォームでは氏名・郵便番号・電話番号・生年月日がいずれも「1項目 ×
          複数入力欄」になる。FormField は直下の 1 要素にしか属性を注入できないので、直下が Flex
          のときはラベルを FieldNameContext で配り、Flex 自身を role=group にする。これが無いと中の
          Input / Select は全て無名になり、axe の label · button-name が一気に赤くなる（gh#303）。
        </Text>

        <Card>
          <CardHeader>
            <CardTitle level={2}>氏名 · フリガナ（1ラベル × 2入力）</CardTitle>
            <CardDescription>
              「氏名」は 1 項目・2 欄。Flex でくるんでも姓と名の両方にラベルが届く。ただし各欄の
              aria-label を省くと両方が「氏名」と読み上げられ、どちらが姓か分からなくなる。
              複合フィールドで最初に壊れるのがここ。data-field は各 Input 自身の id から解決され、
              cmp-name-last / cmp-name-first として別々に自動テストから掴める。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField id="cmp-name" label="氏名" required helper="戸籍上の表記で入力">
                <Flex direction="row" gap="sm" align="center">
                  <Input
                    id="cmp-name-last"
                    aria-label="姓"
                    value={lastName}
                    onValueChange={setLastName}
                    placeholder="山田"
                  />
                  <Input
                    id="cmp-name-first"
                    aria-label="名"
                    value={firstName}
                    onValueChange={setFirstName}
                    placeholder="太郎"
                  />
                </Flex>
              </FormField>
              <FormField id="cmp-kana" label="フリガナ" required helper="全角カタカナ">
                <Flex direction="row" gap="sm" align="center">
                  <Input
                    id="cmp-kana-last"
                    aria-label="セイ"
                    value={kanaLast}
                    onValueChange={setKanaLast}
                    placeholder="ヤマダ"
                  />
                  <Input
                    id="cmp-kana-first"
                    aria-label="メイ"
                    value={kanaFirst}
                    onValueChange={setKanaFirst}
                    placeholder="タロウ"
                  />
                </Flex>
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>郵便番号 · 住所（狭い欄と広い欄が同じ行に並ぶ）</CardTitle>
            <CardDescription>
              郵便番号は 3桁 + 4桁 の固定幅、住所は残り全部。幅を Input
              に持たせる方法は無いので、狭い欄だけを Flex width で囲み shrink={false}
              で潰れないようにする。区切りの「-」は Text aria-hidden で、読み上げには混ぜない。
              住所行は都道府県 Select（width=auto）＋市区町村＋番地で、grow が効かないと番地欄が
              3文字幅に潰れるのが見える。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField
                id="cmp-zip"
                label="郵便番号"
                required
                helper="ハイフンなしの7桁でも可"
                labelAddon={
                  <Button type="button" variant="link" size="xs">
                    住所を自動入力
                  </Button>
                }
              >
                <Flex direction="row" gap="sm" align="center">
                  <Text aria-hidden tone="muted">
                    〒
                  </Text>
                  <Flex width="5.5rem" shrink={false}>
                    <Input
                      id="cmp-zip-head"
                      aria-label="郵便番号 上3桁"
                      inputMode="numeric"
                      maxLength={3}
                      value={zip1}
                      onValueChange={setZip1}
                      placeholder="100"
                    />
                  </Flex>
                  <Text aria-hidden tone="muted">
                    -
                  </Text>
                  <Flex width="6.5rem" shrink={false}>
                    <Input
                      id="cmp-zip-tail"
                      aria-label="郵便番号 下4桁"
                      inputMode="numeric"
                      maxLength={4}
                      value={zip2}
                      onValueChange={setZip2}
                      placeholder="0005"
                    />
                  </Flex>
                </Flex>
              </FormField>
              <FormField id="cmp-address" label="住所" required>
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Flex width="9rem" shrink={false}>
                    <Select
                      id="cmp-address-pref"
                      aria-label="都道府県"
                      name="prefecture"
                      value={prefecture}
                      onValueChange={setPrefecture}
                      options={PREFECTURES}
                      placeholder="都道府県"
                    />
                  </Flex>
                  <Flex width="11rem" shrink={false}>
                    <Input
                      id="cmp-address-city"
                      aria-label="市区町村"
                      defaultValue="千代田区丸の内"
                    />
                  </Flex>
                  <Flex grow>
                    <Input
                      id="cmp-address-street"
                      aria-label="番地・建物名"
                      defaultValue="1-9-1 グラントウキョウノースタワー 18F"
                    />
                  </Flex>
                </Flex>
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>電話番号 3分割 · 生年月日 年/月/日 Select</CardTitle>
            <CardDescription>
              桁数の決まった 3 分割と、型の違うコントロールを 1 ラベル下に混ぜる場合。生年月日は
              Select × 3（年は60件、月日は固定）で、どれか一つでも未選択なら値として不完全になる。
              その「部分入力」をどう検証するかが複合フィールドの本題。DatePicker
              で足りる画面ではこのパターンを使わない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField id="cmp-tel" label="電話番号" helper="市外局番から">
                {/* The three parts never split across lines — "03 -" alone on a row reads as a
                    whole number. The extension is a separate value, so it is what wraps on a phone. */}
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Flex direction="row" gap="sm" align="center" shrink={false}>
                    <Flex width="4rem" shrink={false}>
                      <Input
                        id="cmp-tel-area"
                        aria-label="市外局番"
                        inputMode="numeric"
                        maxLength={4}
                        defaultValue="03"
                      />
                    </Flex>
                    <Text aria-hidden tone="muted">
                      -
                    </Text>
                    <Flex width="4rem" shrink={false}>
                      <Input
                        id="cmp-tel-city"
                        aria-label="市内局番"
                        inputMode="numeric"
                        maxLength={4}
                        defaultValue="6273"
                      />
                    </Flex>
                    <Text aria-hidden tone="muted">
                      -
                    </Text>
                    <Flex width="4rem" shrink={false}>
                      <Input
                        id="cmp-tel-line"
                        aria-label="加入者番号"
                        inputMode="numeric"
                        maxLength={4}
                        defaultValue="0001"
                      />
                    </Flex>
                  </Flex>
                  <Flex width="6rem" shrink={false}>
                    <NumberInput
                      id="cmp-tel-ext"
                      aria-label="内線番号"
                      controls={false}
                      min={0}
                      max={9999}
                      defaultValue={281}
                    />
                  </Flex>
                </Flex>
              </FormField>
              <FormField
                id="cmp-birth"
                label="生年月日"
                required
                error={birthDay === "" ? "日を選択してください。" : undefined}
              >
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Flex width="8rem" shrink={false}>
                    <Select
                      id="cmp-birth-year"
                      aria-label="生年"
                      name="birth_year"
                      value={birthYear}
                      onValueChange={setBirthYear}
                      options={BIRTH_YEARS}
                      placeholder="年"
                      showSearch
                    />
                  </Flex>
                  <Flex width="6rem" shrink={false}>
                    <Select
                      id="cmp-birth-month"
                      aria-label="生月"
                      name="birth_month"
                      value={birthMonth}
                      onValueChange={setBirthMonth}
                      options={MONTHS}
                      placeholder="月"
                    />
                  </Flex>
                  <Flex width="6rem" shrink={false}>
                    <Select
                      id="cmp-birth-day"
                      aria-label="生日"
                      name="birth_day"
                      value={birthDay}
                      onValueChange={setBirthDay}
                      options={DAYS}
                      placeholder="日"
                      status={birthDay === "" ? "error" : undefined}
                    />
                  </Flex>
                </Flex>
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>複合フィールドのエラー · どちらの欄が悪いのか</CardTitle>
            <CardDescription>
              FormField のエラーは 1 行しか出ない。欄が 3 つある行で「形式が正しくありません」
              だけ出しても、利用者はどこを直せばいいか分からない。行のメッセージは FormField の
              error に、犯人の特定は各コントロールの status="error" に分担させる。status
              は塗るだけ（aria-invalid は error の側）なので二重に読み上げられない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField
                id="cmp-err-zip"
                label="郵便番号"
                required
                error="下4桁が数字ではありません。"
              >
                <Flex direction="row" gap="sm" align="center">
                  <Flex width="5.5rem" shrink={false}>
                    <Input id="cmp-err-zip-head" aria-label="郵便番号 上3桁" defaultValue="100" />
                  </Flex>
                  <Text aria-hidden tone="muted">
                    -
                  </Text>
                  <Flex width="6.5rem" shrink={false}>
                    <Input
                      id="cmp-err-zip-tail"
                      aria-label="郵便番号 下4桁"
                      status="error"
                      defaultValue="00O5"
                    />
                  </Flex>
                </Flex>
              </FormField>
              <FormField
                id="cmp-warn-name"
                label="氏名"
                validateStatus="warning"
                hasFeedback
                helper="フリガナと姓が一致しません。登録は可能です。"
              >
                <Flex direction="row" gap="sm" align="center">
                  <Input id="cmp-warn-name-last" aria-label="姓" defaultValue="山田" />
                  <Input id="cmp-warn-name-first" aria-label="名" defaultValue="太郎" />
                </Flex>
              </FormField>
              <FormField id="cmp-ok-tel" label="電話番号" validateStatus="success" hasFeedback>
                <Flex direction="row" gap="sm" align="center">
                  <Flex width="4rem" shrink={false}>
                    <Input id="cmp-ok-tel-area" aria-label="市外局番" defaultValue="03" />
                  </Flex>
                  <Text aria-hidden tone="muted">
                    -
                  </Text>
                  <Flex width="4rem" shrink={false}>
                    <Input id="cmp-ok-tel-city" aria-label="市内局番" defaultValue="6273" />
                  </Flex>
                  <Text aria-hidden tone="muted">
                    -
                  </Text>
                  <Flex width="4rem" shrink={false}>
                    <Input id="cmp-ok-tel-line" aria-label="加入者番号" defaultValue="0001" />
                  </Flex>
                </Flex>
              </FormField>
            </Form>
          </CardContent>
        </Card>

        {/* ════════════════════ 2. EVERY FIELD TYPE ════════════════════ */}
        <Heading level={2}>2. 全フィールド型 · すべての入力コントロール</Heading>
        <Text tone="muted" size="sm">
          ライブラリが提供するデータ入力コンポーネントを 1 つずつ FormField
          でラップ。ラベル・ヘルパー・必須マークを付与し、aria-* は自動配線される。
        </Text>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              テキスト系 · Input / SearchInput / PasswordInput / Textarea
            </CardTitle>
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
            <CardTitle level={2}>Textarea · 固定行数 / 文字数カウンタ / 自動伸長</CardTitle>
            <CardDescription>
              複数行欄は 3 種類しかない。行数固定（rows）・上限付きカウンタ（count）・内容に合わせて
              伸びる（autoGrow minRows/maxRows）。カウンタはコードポイント単位で数え、超過を
              報告するだけで値を切らない。IME 変換中に切ると日本語が途中で壊れるため。autoGrow は
              CSS で測るので貼り付け・IME 確定・プログラムからの代入でも追従し、maxRows
              を超えたらページを押し広げずに内部スクロールする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              <FormField id="ta-remarks" label="備考" helper="取引条件の申し送り事項">
                <Textarea
                  id="ta-remarks"
                  rows={3}
                  value={remarks}
                  onValueChange={setRemarks}
                  count={{ max: 200, show: true }}
                  allowClear
                  placeholder="例: 初回取引のため与信枠は50万円で開始する。"
                />
              </FormField>
              <FormField
                id="ta-thread"
                label="社内コメント"
                helper="1行から始まり、8行まで伸びてから内部スクロールに切り替わる"
              >
                <Textarea
                  id="ta-thread"
                  autoGrow
                  minRows={1}
                  maxRows={8}
                  value={thread}
                  onValueChange={setThread}
                  placeholder="承認者への申し送りを入力…"
                />
              </FormField>
              <FormField id="ta-template" label="請求メール定型文（read-only）">
                <Textarea
                  id="ta-template"
                  rows={4}
                  readOnly
                  defaultValue={
                    "いつもお世話になっております。\n2026年1月度のご請求書を添付いたします。\nお支払期限は2026年2月28日です。\nご不明点はご返信ください。"
                  }
                />
              </FormField>
              <FormField id="ta-disabled" label="監査コメント（権限なし · disabled）">
                <Textarea id="ta-disabled" rows={2} disabled defaultValue="監査部門のみ編集可能" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Responsive collapse contract · every breakpoint</CardTitle>
            <CardDescription>
              The horizontal form collapse union is rendered at false, sm, md, lg and xl; the
              viewport matrix verifies each transition without consumer CSS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {([false, "sm", "md", "lg", "xl"] as const).map((collapseBelow) => (
                <Form
                  key={String(collapseBelow)}
                  layout="horizontal"
                  collapseBelow={collapseBelow}
                  labelWidth="8rem"
                  controlWidth="18rem"
                  labelAlign="end"
                  className="contract-collapse-form"
                >
                  <FormField id={`collapse-${String(collapseBelow)}`} label={String(collapseBelow)}>
                    <Input defaultValue="Responsive value" />
                  </FormField>
                </Form>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>asChild · the router owns the form element</CardTitle>
            <CardDescription>
              Inertia&apos;s <code>&lt;Form action method&gt;</code> and TanStack Form render their
              own <code>&lt;form&gt;</code>, and two form elements cannot nest. <code>asChild</code>
              keeps the layout context and hands the element back, so a consumer keeps the
              router&apos;s submission handling AND the label column instead of hand-rolling one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              asChild
              layout="horizontal"
              labelWidth="8rem"
              controlWidth="18rem"
              labelAlign="end"
            >
              <form className="contract-aschild-form" onSubmit={(event) => event.preventDefault()}>
                <FormField id="aschild-name" label="取引先名" required>
                  <Input id="aschild-name" defaultValue="株式会社ゴドー" />
                </FormField>
                <FormField id="aschild-code" label="コード" helper="ルータ側が form 要素を持つ">
                  <Input id="aschild-code" defaultValue="BTY-0012" />
                </FormField>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Density · compact / default / comfortable</CardTitle>
            <CardDescription>
              density はフォーム全体の縦方向リズムを変更する。入力サイズやラベル関係は変えない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              {(["compact", "default", "comfortable"] as const).map((density) => (
                <Form key={density} density={density} columns={2}>
                  <FormField id={`density-${density}-name`} label={`${density} · 氏名`}>
                    <Input id={`density-${density}-name`} defaultValue="山田 太郎" />
                  </FormField>
                  <FormField id={`density-${density}-email`} label="メール" helper="連絡先">
                    <Input id={`density-${density}-email`} defaultValue="taro@example.jp" />
                  </FormField>
                </Form>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>選択系 · Select / TreeSelect / Cascader</CardTitle>
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
            <CardTitle level={2}>
              真偽・選択肢系 · Checkbox / CheckboxGroup / RadioGroup / Switch
            </CardTitle>
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
            <CardTitle level={2}>数値・範囲系 · Slider / Rating</CardTitle>
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
            <CardTitle level={2}>日時系 · DatePicker / DatePicker range / TimePicker</CardTitle>
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
              {/* 開始/終了 の対 — 終了は開始より前を選べない。`disabledTime` が列と
                  入力欄の両方を止めるので、キーボードから規則をすり抜けられない。 */}
              <FormField id="f-start" label="開始時刻" required>
                <TimePicker
                  id="f-start"
                  name="start_time"
                  value={startTime}
                  onValueChange={setStartTime}
                  minuteStep={15}
                />
              </FormField>
              <FormField id="f-end" label="終了時刻" required>
                <TimePicker
                  id="f-end"
                  name="end_time"
                  value={endTime}
                  onValueChange={setEndTime}
                  minuteStep={15}
                  disabledTime={() => {
                    const [startHour, startMinute] = startTime.split(":").map(Number);
                    return {
                      disabledHours: () => Array.from({ length: startHour }, (_, hour) => hour),
                      disabledMinutes: (hour) =>
                        hour === startHour
                          ? Array.from({ length: 60 }, (_, minute) => minute).filter(
                              (minute) => minute <= startMinute,
                            )
                          : [],
                    };
                  }}
                />
              </FormField>
              <FormField id="f-period" label="会計期間" colSpan={2}>
                <DatePicker
                  range
                  id="f-period"
                  name="period"
                  value={period}
                  onValueChange={setPeriod}
                  // 土日は選べない。minDate/maxDate では表せない規則。
                  disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>その他 · TagInput / ToggleGroup / InputOTP / Upload</CardTitle>
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

        {/* ════════════════════ 3. EVERY LAYOUT ════════════════════ */}
        <Heading level={2}>3. レイアウト · vertical / horizontal / inline / columns / 混在</Heading>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Vertical（デフォルト）</CardTitle>
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
            <CardTitle level={2}>Horizontal（labelWidth 120 · md未満で縦に折り返し）</CardTitle>
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
            <CardTitle level={2}>
              Inline · フィルターバー（layout=inline · Flex で横並び）
            </CardTitle>
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
            <CardTitle level={2}>Columns（columns=2 · 姓+名ペア · 住所は2列span）</CardTitle>
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
            <CardTitle level={2}>Horizontal · 常時（collapseBelow=false）</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベル長 · 2文字のラベルと3行に折り返すラベルが同じ列に</CardTitle>
            <CardDescription>
              ラベル列の幅は1つしか無いので、「氏名」と「適格請求書発行事業者登録番号…」は必ず
              同じ列に入る。長い方が折り返したとき、1行の入力欄がラベルの1行目に揃うか、
              ブロックの中央に落ちるかでフォーム全体の読みやすさが決まる。labelAlign は end と start
              の両方を並べて比較できるようにした。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Form layout="horizontal" labelWidth="14rem" labelAlign="end">
                <FormField id="len-e-name" label="氏名" required>
                  <Input id="len-e-name" defaultValue="山田 太郎" />
                </FormField>
                <FormField
                  id="len-e-invoice"
                  label="適格請求書発行事業者 登録番号（インボイス制度・国税庁公表サイトと突合）"
                  required
                  helper="T + 13桁"
                >
                  <Input id="len-e-invoice" defaultValue="T1234567890123" />
                </FormField>
                <FormField id="len-e-note" label="略称">
                  <Input id="len-e-note" defaultValue="ゴドー商事" />
                </FormField>
              </Form>
              <Form layout="horizontal" labelWidth="14rem" labelAlign="start">
                <FormField id="len-s-name" label="氏名" required>
                  <Input id="len-s-name" defaultValue="山田 太郎" />
                </FormField>
                <FormField
                  id="len-s-invoice"
                  label="適格請求書発行事業者 登録番号（インボイス制度・国税庁公表サイトと突合）"
                  required
                  helper="T + 13桁"
                >
                  <Input id="len-s-invoice" defaultValue="T1234567890123" />
                </FormField>
                <FormField id="len-s-note" label="略称">
                  <Input id="len-s-note" defaultValue="ゴドー商事" />
                </FormField>
              </Form>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>混在レイアウト · 1つのフォームに horizontal と vertical</CardTitle>
            <CardDescription>
              実画面はどれか1つでは足りない。短い項目は horizontal
              でラベル列に揃え、複合行と自由記述だけは幅いっぱいの vertical に落とす。layout は Form
              に1度書き、はみ出す行だけ FormField 側で上書きする。ここを className
              で殴ると、密度変更やテナントの再テーマでその行だけ取り残される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField id="mix-code" label="取引先コード" required helper="発番後は変更不可">
                <Input id="mix-code" defaultValue="BTY-0012" />
              </FormField>
              <FormField id="mix-name" label="取引先名" required>
                <Input id="mix-name" defaultValue="株式会社ゴドー商事" />
              </FormField>
              <FormField id="mix-pay" label="支払条件">
                <Select
                  id="mix-pay"
                  name="payment_terms"
                  defaultValue="eom30"
                  options={[
                    { value: "eom30", label: "月末締め翌月末払い" },
                    { value: "eom60", label: "月末締め翌々月末払い" },
                    { value: "prepaid", label: "前払い" },
                  ]}
                />
              </FormField>
              {/* 複合行: ラベル列に収めると3欄が潰れるので、この行だけ vertical で幅を取る。 */}
              <FormField id="mix-addr" label="請求書送付先" layout="vertical">
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Flex width="9rem" shrink={false}>
                    <Select
                      id="mix-addr-pref"
                      aria-label="都道府県"
                      defaultValue="JP-13"
                      options={PREFECTURES}
                    />
                  </Flex>
                  <Flex width="11rem" shrink={false}>
                    <Input id="mix-addr-city" aria-label="市区町村" defaultValue="千代田区丸の内" />
                  </Flex>
                  <Flex grow>
                    <Input id="mix-addr-street" aria-label="番地・建物名" defaultValue="1-9-1" />
                  </Flex>
                </Flex>
              </FormField>
              {/* 自由記述も vertical。9rem のラベル列の右に押し込むと1行が短すぎる。 */}
              <FormField
                id="mix-memo"
                label="社内申し送り"
                layout="vertical"
                helper="与信・取引条件の背景を残す"
              >
                <Textarea
                  id="mix-memo"
                  autoGrow
                  minRows={3}
                  maxRows={10}
                  defaultValue="代表者の交代に伴い、2026年4月から請求先部署が経理部に変更。"
                />
              </FormField>
              <FormField id="mix-owner" label="担当者">
                <Input id="mix-owner" defaultValue="佐藤 花子" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              幅 · 狭い項目と広い項目を同じ行に（controlWidth / colSpan）
            </CardTitle>
            <CardDescription>
              郵便番号の欄が住所と同じ幅で伸びていると、7桁しか入らない欄だと見て分からない。
              controlWidth はラベル行の幅を保ったままコントロールだけを狭める（FormField 自体を
              width で縛ると、ラベルとエラー行まで一緒に縮む）。columns グリッドでは広い項目を
              colSpan で跨がせ、スマホ幅では 1 列に畳んで全ての欄が全幅に戻る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Form layout="horizontal" labelWidth="9rem">
                <FormField id="w-zip" label="郵便番号" controlWidth="10rem" helper="7桁">
                  <Input id="w-zip" inputMode="numeric" defaultValue="1000005" />
                </FormField>
                <FormField id="w-qty" label="数量" controlWidth="7rem">
                  <NumberInput id="w-qty" defaultValue={12} min={1} max={999} />
                </FormField>
                <FormField id="w-rate" label="適用税率" controlWidth="7rem">
                  <NumberInput id="w-rate" defaultValue={10} min={0} max={100} suffix="%" />
                </FormField>
                <FormField id="w-addr" label="住所">
                  <Input id="w-addr" defaultValue="東京都千代田区丸の内1-9-1" />
                </FormField>
              </Form>
              <Form columns={2}>
                <FormField id="w-g-zip" label="郵便番号" controlWidth="10rem">
                  <Input id="w-g-zip" inputMode="numeric" defaultValue="1000005" />
                </FormField>
                <FormField id="w-g-pref" label="都道府県" controlWidth="10rem">
                  <Select id="w-g-pref" defaultValue="JP-13" options={PREFECTURES} />
                </FormField>
                <FormField id="w-g-addr" label="住所（2列を跨ぐ）" colSpan={2}>
                  <Input id="w-g-addr" defaultValue="東京都千代田区丸の内1-9-1 18F" />
                </FormField>
              </Form>
            </Flex>
          </CardContent>
        </Card>

        {/* ════════════════════ 4. EVERY STATE ════════════════════ */}
        <Heading level={2}>4. 状態 · pristine / filled / error / disabled / read-only</Heading>

        <Card>
          <CardHeader>
            <CardTitle level={2}>必須エラー · ヘルパー · disabled · read-only</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>ヘルパーの位置 · 答える前に要る注記は label の下へ</CardTitle>
            <CardDescription>
              書式や単位の注記は、入力した後に読んでも遅い。helperPlacement="before"
              はラベルと入力欄の間に置くだけで、id も aria-describedby も変わらない。ラベルを
              ReactNode にして2行目を足すと string ラベルの aria フォールバックを失い、labelAddon
              に押し込むとラベル行が2段に膨らむ。どちらも同じ見た目で壊れ方だけが違う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem">
              <FormField
                id="hp-before"
                label="振込予定日"
                helper="YYYY/MM/DD · 銀行営業日のみ指定できます"
                helperPlacement="before"
                required
              >
                <Input id="hp-before" defaultValue="2026/02/27" />
              </FormField>
              <FormField
                id="hp-after"
                label="振込手数料"
                helper="当社負担の場合は0を入力"
                controlWidth="9rem"
              >
                <NumberInput id="hp-after" defaultValue={330} min={0} prefix="¥" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>staticText · 編集できない値を同じフォームの同じ列に</CardTitle>
            <CardDescription>
              発番済みのコードや作成者は入力欄ですらない。readOnly の Input
              で見せると「押せば直せそう」に見え、別の Descriptions
              ブロックに逃がすとラベル列の幅と行間を手で合わせ直すことになる。staticText
              は制御要素を持たない FormField で、同じ Form の layout · labelAlign · 行間を
              そのまま引き継ぐ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form layout="horizontal" labelWidth="9rem" requiredMark="optional">
              <FormField id="st-code" label="伝票番号" staticText="INV-2026-0001" />
              <FormField id="st-created" label="作成日時" staticText="2026年1月15日 09:32" />
              <FormField id="st-author" label="作成者" staticText="佐藤 花子（経理部）" />
              <FormField id="st-status" label="ステータス" staticText="承認待ち" />
              <FormField id="st-owner" label="承認者" required>
                <Select
                  id="st-owner"
                  name="approver"
                  placeholder="選択してください"
                  options={[
                    { value: "tanaka", label: "田中 一郎（経理部長）" },
                    { value: "suzuki", label: "鈴木 次郎（管理本部長）" },
                  ]}
                />
              </FormField>
              <FormField id="st-memo" label="承認コメント" layout="vertical">
                <Textarea id="st-memo" autoGrow minRows={2} maxRows={6} />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>フォーム全体の無効化 · 送信中と閲覧権限</CardTitle>
            <CardDescription>
              送信中や閲覧のみの権限では、フィールドを1つずつ disabled にして回る必要はない。Form の
              disabled が中のコントロール（ネイティブ要素まで）を まとめて止める。requiredMark を
              false にすると全項目必須の申請フォームでアスタリスクの列が消え、"optional"
              にすると逆に任意項目だけに印が付く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Form layout="horizontal" labelWidth="9rem" disabled>
                <FormField id="dis-name" label="取引先名" required>
                  <Input id="dis-name" defaultValue="株式会社ゴドー商事" />
                </FormField>
                <FormField id="dis-pay" label="支払条件" required>
                  <Select
                    id="dis-pay"
                    defaultValue="eom30"
                    options={[{ value: "eom30", label: "月末締め翌月末払い" }]}
                  />
                </FormField>
                <FormField id="dis-memo" label="社内申し送り" layout="vertical">
                  <Textarea id="dis-memo" rows={2} defaultValue="送信中は編集できません。" />
                </FormField>
              </Form>
              <Form layout="horizontal" labelWidth="9rem" requiredMark={false}>
                <FormField id="nm-name" label="申請者" required>
                  <Input id="nm-name" defaultValue="山田 太郎" />
                </FormField>
                <FormField id="nm-dept" label="所属部署" required>
                  <Input id="nm-dept" defaultValue="営業第一部" />
                </FormField>
                <FormField id="nm-note" label="備考">
                  <Input id="nm-note" placeholder="全項目必須のため印を出さない" />
                </FormField>
              </Form>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              サーバーエラーバッグ · Form errors + FormField name + FormErrors
            </CardTitle>
            <CardDescription>
              Form に errors（Inertia の form.errors）を渡すと、name
              を持つフィールドは自分のメッセージをバッグから自動解決してキーを消費（claim）する。
              FormErrors は残り ·
              隠し・派生フィールド（action_mode、page…）に付いた、どのフィールドにも表示先が無いエラー
              · だけを role=alert のバナーとして表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              layout="horizontal"
              labelWidth={140}
              errors={{
                customer_nm: "顧客名は必須です",
                action_mode: "操作モードが不正です",
                page: ["ページ番号が不正です", "ページ範囲を超えています"],
              }}
            >
              <FormErrors />
              {/* claimed: このフィールドが customer_nm のメッセージを表示するのでバナーには出ない */}
              <FormField name="customer_nm" label="顧客名" required>
                <Input placeholder="株式会社…" />
              </FormField>
              {/* エラーの無いキー: バッグに tel_no が無いのでこのフィールドは無風 */}
              <FormField name="tel_no" label="電話番号" helper="ハイフンなし">
                <Input inputMode="numeric" placeholder="0312345678" />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>兄弟 Form の共有バッグ · FormErrorsProvider</CardTitle>
            <CardDescription>
              編集画面を複数の Card+Form セクションに分けても、サーバーのエラーバッグは 1 つ。 各
              Form に errors を渡す代わりに領域を FormErrorsProvider で包むと、errors を持たない
              Form は外側のレジストリに参加し、全セクションの claim が 1 つの FormErrors
              から差し引かれる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormErrorsProvider
              errors={{
                customer_nm: "顧客名は必須です",
                mail_subject: "件名は必須です",
                source_slip_id: "元伝票が存在しません",
              }}
            >
              <Flex direction="col" gap="md" align="stretch">
                <FormErrors />
                {/* セクション A: errors を渡さない Form — 外側のレジストリに参加する */}
                <Form layout="horizontal" labelWidth={140}>
                  <FormField name="customer_nm" label="顧客名" required>
                    <Input placeholder="株式会社…" />
                  </FormField>
                </Form>
                {/* セクション B: 別の Form でも claim は同じレジストリへ */}
                <Form layout="horizontal" labelWidth={140}>
                  <FormField name="mail_subject" label="件名">
                    <Input placeholder="ご請求書の送付" />
                  </FormField>
                </Form>
                {/* source_slip_id はどのフィールドも claim しないのでバナーに残る */}
              </Flex>
            </FormErrorsProvider>
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
