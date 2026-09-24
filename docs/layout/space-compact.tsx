import { useState } from "react";
import { Flex, PageContainer, SpaceCompact } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import {
  FormField,
  Input,
  NumberInput,
  SearchInput,
  Select,
  Textarea,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Search, Send } from "lucide-react";

/**
 * SpaceCompact · weld a row of controls into ONE box.
 *
 * Shows: the recurrence row the component was built for (毎[N][週▾]ごと), a search field welded to
 * its button, a unit-suffixed amount, and the vertical axis with its documented limit.
 *
 * WHY THIS IS A COMPONENT AND NOT A RECIPE. Zeroing the inner corners and collapsing the shared
 * border seam needs `[&>*:not(:first-child)]`-shaped selectors, which `ui-audit`'s
 * `no-utility-layout` rule blocks at the call site. Everything else here is real primitives.
 *
 * ONE LABEL FOR THE PAIR. A `FormField` wrapping a `SpaceCompact` lands its label on the row, and a
 * named row with no explicit `role` becomes `role="group"` — a `<div>` has no role to lose, so the
 * name has somewhere to live. Each control inside keeps its own accessible name.
 */

const WEEK_UNITS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

const CURRENCIES = [
  { value: "JPY", label: "JPY" },
  { value: "USD", label: "USD" },
  { value: "VND", label: "VND" },
];

export default function SpaceCompactShowcase() {
  const [every, setEvery] = useState(2);
  const [unit, setUnit] = useState("week");
  const [amount, setAmount] = useState(48000);
  const [currency, setCurrency] = useState("JPY");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");

  return (
    <PageContainer
      title="SpaceCompact"
      subtitle="くっつけた1つの箱として読ませる — 繰り返し設定・検索・単位つき金額"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>繰り返し（毎 N 週ごと）</CardTitle>
            <CardDescription>
              数値と単位はひとつの設定なので、ひとつの箱に見せます。ラベルは
              FormField が行に付けるので、読み上げは「繰り返し、グループ」から始まり、中の
              コントロールはそれぞれの名前を保ちます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField label="繰り返し" helper="請求書を自動発行する間隔です。">
                <SpaceCompact>
                  <NumberInput
                    value={every}
                    onValueChange={(next) => setEvery(next ?? 1)}
                    min={1}
                    max={52}
                    aria-label="間隔"
                  />
                  <Select
                    value={unit}
                    onValueChange={(next: string | string[] | undefined) => setUnit(next as string)}
                    options={WEEK_UNITS}
                    aria-label="単位"
                  />
                </SpaceCompact>
              </FormField>

              <Descriptions
                items={[
                  { label: "読み方", children: `毎 ${every} ${unit === "day" ? "日" : unit === "week" ? "週" : "月"}ごと` },
                  { label: "role", children: "group（名前が付いた行のみ）" },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>検索とボタン</CardTitle>
            <CardDescription>
              入力と実行は一続きの操作なので継ぎ目をなくします。ボタンは本物の Button のままなので、
              フォーカスリングも disabled もそのまま効きます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpaceCompact aria-label="社員を検索">
              <SearchInput
                value={query}
                onValueChange={setQuery}
                placeholder="氏名・社員番号"
                aria-label="検索語"
              />
              <Button aria-label="検索する">
                <Search aria-hidden="true" />
              </Button>
            </SpaceCompact>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>金額と通貨、そして fullWidth</CardTitle>
            <CardDescription>
              `fullWidth` は行を親の幅いっぱいに広げます（antd の `block`）。中の比率は各コントロールの
              ままなので、狭い画面でも桁が潰れません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField label="請求金額">
              <SpaceCompact fullWidth>
                <NumberInput
                  value={amount}
                  onValueChange={(next) => setAmount(next ?? 0)}
                  min={0}
                  step={1000}
                  aria-label="金額"
                />
                <Select
                  value={currency}
                  onValueChange={(next: string | string[] | undefined) => setCurrency(next as string)}
                  options={CURRENCIES}
                  aria-label="通貨"
                />
              </SpaceCompact>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>orientation=&quot;vertical&quot; — 書かれた上での部分対応</CardTitle>
            <CardDescription>
              縦積みは共有の境界線を潰しますが、角の丸めは今のところ横方向だけです。Input と
              トリガーの角トークンが inline 方向にしか無いためで、黙って欠けているのではなく
              フォローアップとして書いてあります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <SpaceCompact orientation="vertical" aria-label="メモと送信">
                <Textarea
                  value={note}
                  onValueChange={setNote}
                  placeholder="申し送り事項"
                  aria-label="申し送り事項"
                />
                <Button aria-label="送信する">
                  <Send aria-hidden="true" />
                  送信
                </Button>
              </SpaceCompact>
              <Text tone="muted" size="sm">
                `vertical` は antd 互換の真偽値スペルです。`orientation` と両方指定すると
                `orientation` が勝ちます。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>くっつけない方がよい場合</CardTitle>
            <CardDescription>
              ひとつの設定ではないものを繋ぐと、関係のない値が同じ箱に見えます。別々の
              FormField に分けてください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField label="部署コード">
                <Input placeholder="D-1024" aria-label="部署コード" />
              </FormField>
              <FormField label="内線">
                <Input placeholder="2831" aria-label="内線" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
