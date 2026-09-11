import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { FormField, Segmented } from "@godxjp/ui/data-entry";
import { Text, VisuallyHidden } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { CalendarDays, Columns3, LayoutList, Monitor, Moon, Sun } from "lucide-react";

/**
 * Segmented — one-of-N from a small, closed, always-visible set. The enterprise Segmented drawn on Radix
 * RadioGroup: a recessed track with the chosen item as a lifted slab, radiogroup semantics, arrow
 * keys between members. The track measures exactly --control-height, so it sits level with an
 * Input or a Button on the same row.
 */
export default function Demo() {
  const [theme, setTheme] = useState("system");
  const [view, setView] = useState("list");
  const [range, setRange] = useState("week");

  return (
    <PageContainer title="Segmented" subtitle="閉じた選択肢からひとつだけ · テーマ・表示形式・期間">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベルのみ</CardTitle>
            <CardDescription>
              選択肢が 2〜4 個で、すべて画面に出せるときは Select ではなくこちら。ひとつは必ず
              選ばれている状態なので、ToggleGroup ではなく radiogroup として読み上げられます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Segmented
                aria-label="期間"
                value={range}
                onValueChange={setRange}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "週" },
                  { value: "month", label: "月" },
                ]}
              />
              <Text size="xs" tone="muted">
                選択中: {range}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>アイコン付き</CardTitle>
            <CardDescription>
              `icon` は aria-hidden で描かれ、読み上げ名は `label` のままです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Segmented
                aria-label="テーマ"
                value={theme}
                onValueChange={setTheme}
                options={[
                  { value: "light", label: "ライト", icon: <Sun aria-hidden="true" /> },
                  { value: "dark", label: "ダーク", icon: <Moon aria-hidden="true" /> },
                  { value: "system", label: "システム", icon: <Monitor aria-hidden="true" /> },
                ]}
              />
              <Segmented
                aria-label="表示形式"
                value={view}
                onValueChange={setView}
                options={[
                  { value: "list", label: "一覧", icon: <LayoutList aria-hidden="true" /> },
                  { value: "board", label: "ボード", icon: <Columns3 aria-hidden="true" /> },
                  {
                    value: "calendar",
                    label: "カレンダー",
                    icon: <CalendarDays aria-hidden="true" />,
                  },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card id="four-with-counts">
          <CardHeader>
            <CardTitle level={2}>4 択 + 件数（スマホ幅では折り返す）</CardTitle>
            <CardDescription>
              一覧の上の状態フィルター。4 つが 1 行に収まらない幅では、トラックが 2 行目に折り返し
              ます — ラベルも件数も切り詰めません。`check:segmented-wrap` がこのカードを測ります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Segmented
              aria-label="状態"
              defaultValue="all"
              options={[
                { value: "all", label: "すべて", count: 128 },
                { value: "active", label: "実習中", count: 96 },
                { value: "pending", label: "申請中", count: 12 },
                { value: "gone", label: "失踪・帰国", count: 0 },
              ].map(({ value, label, count }) => ({
                value,
                label: (
                  <>
                    {label}
                    <Badge as="span" variant="secondary">
                      {count}
                    </Badge>
                  </>
                ),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · vertical · block</CardTitle>
            <CardDescription>
              size は 3 段（sm / md / lg）。トラックの高さは --control-height そのもので、
              MobileShell のようにその変数をスコープする領域では自動的にタッチ段（44px）になります。
              vertical では 1 行ぶんが 1 コントロールの高さになります — 横 1 行のときだけトラック
              内側の余白を引くので、積んだときは引きません。block は幅いっぱいに広げます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md" align="start">
              <Segmented
                aria-label="サイズ sm"
                size="sm"
                defaultValue="a"
                options={[
                  { value: "a", label: "小" },
                  { value: "b", label: "中" },
                  { value: "c", label: "大" },
                ]}
              />
              <Segmented
                aria-label="サイズ md"
                defaultValue="b"
                options={[
                  { value: "a", label: "小" },
                  { value: "b", label: "中" },
                  { value: "c", label: "大" },
                ]}
              />
              <Segmented
                aria-label="サイズ lg"
                size="lg"
                defaultValue="c"
                options={[
                  { value: "a", label: "小" },
                  { value: "b", label: "中" },
                  { value: "c", label: "大" },
                ]}
              />
              <Segmented
                aria-label="縦積み"
                vertical
                block
                defaultValue="ok"
                options={[
                  { value: "ok", label: "実施" },
                  { value: "warn", label: "要改善" },
                  { value: "none", label: "未実施" },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>短い記号を出して、長い名前を読ませる</CardTitle>
            <CardDescription>
              `label` は ReactNode なので、見える記号を aria-hidden にして VisuallyHidden に
              読み上げ名を置けます。専用の prop は要りません。○ と読み上げられても意味が伝わらない
              ため、色や記号だけに意味を持たせないという WCAG 1.4.1 の要求そのものです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Segmented
              aria-label="監査結果"
              defaultValue="ok"
              options={[
                {
                  value: "ok",
                  label: (
                    <>
                      <span aria-hidden="true">○</span>
                      <VisuallyHidden>実施</VisuallyHidden>
                    </>
                  ),
                },
                {
                  value: "warn",
                  label: (
                    <>
                      <span aria-hidden="true">△</span>
                      <VisuallyHidden>要改善</VisuallyHidden>
                    </>
                  ),
                },
                {
                  value: "none",
                  label: (
                    <>
                      <span aria-hidden="true">×</span>
                      <VisuallyHidden>未実施</VisuallyHidden>
                    </>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>フォームの中で</CardTitle>
            <CardDescription>
              `name` を渡すとネイティブフォームで送信されます。無効化は選択肢ごとにも、グループ
              全体にもかけられます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="segmented-plan" label="プラン">
                <Segmented
                  id="segmented-plan"
                  name="plan"
                  defaultValue="standard"
                  options={[
                    { value: "light", label: "ライト" },
                    { value: "standard", label: "スタンダード" },
                    { value: "enterprise", label: "エンタープライズ", disabled: true },
                  ]}
                />
              </FormField>
              <Segmented
                aria-label="無効化されたグループ"
                defaultValue="a"
                disabled
                options={[
                  { value: "a", label: "A" },
                  { value: "b", label: "B" },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
