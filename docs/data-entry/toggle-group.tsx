import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** A folder's tag facets — more chips than any rail is wide, which is the `wrap` case (gh#741). */
const folderTags = [
  { value: "design", label: "設計", count: 12 },
  { value: "runbook", label: "運用手順", count: 148 },
  { value: "security", label: "セキュリティ", count: 37 },
  { value: "onboarding", label: "オンボーディング", count: 9 },
  { value: "incident", label: "障害報告", count: 64 },
  { value: "contract", label: "契約", count: 21 },
  { value: "billing", label: "請求", count: 83 },
  { value: "release", label: "リリース", count: 156 },
  { value: "meeting", label: "議事録", count: 402 },
  { value: "hr", label: "人事", count: 18 },
  { value: "legal", label: "法務", count: 6 },
  { value: "archive", label: "アーカイブ", count: 311 },
];

/** A one-of-N setting: a list always has A sort order, so this row may never be empty (gh#744). */
const sortOrders = [
  { value: "updated", label: "更新日" },
  { value: "created", label: "作成日" },
  { value: "name", label: "名前" },
  { value: "size", label: "サイズ" },
  { value: "owner", label: "所有者" },
  { value: "relevance", label: "関連度" },
];

/**
 * ToggleGroup — single or multi-select toggle set. type='single' for mutually
 * exclusive modes; type='multiple' for independent selections. Never raw radio
 * buttons for this pattern. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [period, setPeriod] = useState<string>("monthly");
  const [formats, setFormats] = useState<string[]>(["pdf"]);
  const [view, setView] = useState<string>("list");
  const [tags, setTags] = useState<string[]>(["design", "runbook"]);
  const [facet, setFacet] = useState<string>("design");
  const [sort, setSort] = useState<string>("updated");

  return (
    <PageContainer
      title="ToggleGroup"
      subtitle="Single or multi-select toggle set · toolbar modes, output formats"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Single selection (type=“single”)</CardTitle>
            <CardDescription>
              Mutually exclusive · switching fiscal period. value is string, onValueChange receives
              string.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="period" label="集計期間">
              <ToggleGroup
                type="single"
                disallowEmptySelection
                value={period}
                onValueChange={setPeriod}
              >
                <ToggleGroupItem value="daily">日次</ToggleGroupItem>
                <ToggleGroupItem value="monthly">月次</ToggleGroupItem>
                <ToggleGroupItem value="quarterly">四半期</ToggleGroupItem>
                <ToggleGroupItem value="yearly">年次</ToggleGroupItem>
              </ToggleGroup>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>disallowEmptySelection · 空を許すかどうかが role を決める</CardTitle>
            <CardDescription>
              ARIA には「もう一度押して選択を外す」という radio
              がない。選択のある radiogroup には必ずちょうど一つ checked
              な項目があるので、ユーザーが今押したばかりの radiogroup
              が空になった状態はスクリーンリーダーが読み上げられない。だから空を許すかどうかが
              role を決める（gh#744）。既定（空を許す）は role=&quot;group&quot; ＋ 各項目
              aria-pressed で、同じチップをもう一度押せば選択が外れ onValueChange(&quot;&quot;)
              が飛ぶ。disallowEmptySelection を付けると role=&quot;radiogroup&quot; ＋
              role=&quot;radio&quot; / aria-checked になり、選択中の項目をもう一度押しても外れず、矢印キーが
              APG の radio group どおり選択ごと動く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  既定（空を許す）· タグ絞り込み · role=&quot;group&quot; ＋
                  aria-pressed。矢印キーはフォーカスだけを動かす
                </Text>
                <ToggleGroup
                  type="single"
                  variant="soft"
                  shape="pill"
                  wrap
                  value={facet}
                  onValueChange={(v) => setFacet(v as string)}
                  aria-label="ファセット絞り込み"
                >
                  {folderTags.slice(0, 6).map((tag) => (
                    <ToggleGroupItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Text as="p" size="sm" tone="muted">
                  選択中: {facet === "" ? "なし" : facet}
                </Text>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  disallowEmptySelection · 並び替え · role=&quot;radiogroup&quot; ＋
                  aria-checked。タブ位置は選択中の項目ひとつ、矢印キーが選択ごと動く
                </Text>
                <ToggleGroup
                  type="single"
                  variant="soft"
                  shape="pill"
                  wrap
                  disallowEmptySelection
                  value={sort}
                  onValueChange={(v) => setSort(v as string)}
                  aria-label="並び替え"
                >
                  {sortOrders.map((order) => (
                    <ToggleGroupItem key={order.value} value={order.value}>
                      {order.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Text as="p" size="sm" tone="muted">
                  選択中: {sort === "" ? "なし" : sort}
                </Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Multiple selection (type=“multiple”)</CardTitle>
            <CardDescription>
              Independent toggles · output format selection. value is string[], onValueChange
              receives string[].
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="formats" label="出力形式">
              <ToggleGroup
                type="multiple"
                value={formats}
                onValueChange={(v) => setFormats(v as string[])}
              >
                <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                <ToggleGroupItem value="mail">メール</ToggleGroupItem>
              </ToggleGroup>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>View density switcher</CardTitle>
            <CardDescription>
              Common use case: switching between display modes in a list or dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              disallowEmptySelection
              value={view}
              onValueChange={setView}
            >
              <ToggleGroupItem value="list">一覧</ToggleGroupItem>
              <ToggleGroupItem value="card">カード</ToggleGroupItem>
              <ToggleGroupItem value="compact">コンパクト</ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>variant · default / outline / soft</CardTitle>
            <CardDescription>
              variant は ToggleGroup にだけ指定すれば全アイテムへ伝播する（各 ToggleGroupItem
              への繰り返し指定は不要）。default は選択時に背景が塗られ、outline は枠線で示す。soft
              は休止時から --secondary で塗られるので、チップの列に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;default&quot;
                </Text>
                <ToggleGroup type="single" variant="default" defaultValue="pdf">
                  <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                  <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;outline&quot;
                </Text>
                <ToggleGroup type="single" variant="outline" defaultValue="pdf">
                  <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                  <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;soft&quot;
                </Text>
                <ToggleGroup type="single" variant="soft" defaultValue="pdf">
                  <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                  <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>shape · default / pill / sharp</CardTitle>
            <CardDescription>
              shape も variant / size と同じく行の決定なので、ToggleGroup
              に一度書けば全アイテムへ伝播する。値は Button / Badge と同じ三つで、読む radius
              トークンも同じ。チップの列は soft + pill。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {(["default", "pill", "sharp"] as const).map((shape) => (
                <Flex key={shape} direction="col" gap="sm">
                  <Text as="p" size="sm" tone="muted">
                    shape=&quot;{shape}&quot;
                  </Text>
                  <ToggleGroup type="single" variant="soft" shape={shape} defaultValue="pdf">
                    <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                    <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                    <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                  </ToggleGroup>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>wrap · 折り返すタグ絞り込みの行</CardTitle>
            <CardDescription>
              wrap
              を付けた行は、レールに収まらなくなった時点で次の行へ折り返す（gh#741）。名前も真偽値も
              data-wrap 属性も Flex と同じ。既定は false で、variant
              によって既定を変えることはしない。320px のレールで測ると 4 項目のセグメントは wrap
              の有無に関わらず 1 行 32px
              のままで、変わるのは元から溢れていた行だけだからである。折り返しても gap は 1
              つなので、行間と列間は同じ 4px になる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  wrap · variant=&quot;soft&quot; shape=&quot;pill&quot; size=&quot;xs&quot; ·
                  タグが 12 個あっても ToggleGroup は 1 つのまま（value / onValueChange も 1
                  つ、矢印キーは折り返した行をまたいで DOM 順に進む）
                </Text>
                <ToggleGroup
                  type="multiple"
                  variant="soft"
                  shape="pill"
                  size="xs"
                  wrap
                  value={tags}
                  onValueChange={(v) => setTags(v as string[])}
                  aria-label="タグで絞り込み"
                >
                  {folderTags.map((tag) => (
                    <ToggleGroupItem
                      key={tag.value}
                      value={tag.value}
                      count={tag.count}
                      countLabel="ページ"
                    >
                      {tag.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Text as="p" size="sm" tone="muted">
                  選択中: {tags.length === 0 ? "なし" : tags.join(" / ")}
                </Text>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  wrap なし（既定）· セグメントは 1 行 32px のまま、何も変わらない
                </Text>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  defaultValue="daily"
                  aria-label="集計単位"
                >
                  <ToggleGroupItem value="daily">日次</ToggleGroupItem>
                  <ToggleGroupItem value="monthly">月次</ToggleGroupItem>
                  <ToggleGroupItem value="quarterly">四半期</ToggleGroupItem>
                  <ToggleGroupItem value="yearly">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · xs / sm / md / lg</CardTitle>
            <CardDescription>
              size も ToggleGroup にだけ指定すれば全アイテムへ伝播する。md が既定。xs 24px / sm 28px
              / md 32px / lg 36px はすべて --control-height
              の同じ段なので、行の高さが先に決まっている場所ではその段を選ぶ。xs は 24px
              の密な行にセグメントを載せるための段。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;xs&quot; · 24px の密な行
                </Text>
                <ToggleGroup type="single" size="xs" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;sm&quot;
                </Text>
                <ToggleGroup type="single" size="sm" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;md&quot;
                </Text>
                <ToggleGroup type="single" size="md" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;lg&quot;
                </Text>
                <ToggleGroup type="single" size="lg" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>継承と上書き（group → item）</CardTitle>
            <CardDescription>
              group の variant / size は全アイテムへ伝播し、item 側で明示した prop
              が常に優先される。group だけ・item だけ・両方に指定した 3
              つの書き方はすべて同じ描画になる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  group size=&quot;sm&quot; · 中央のみ item size=&quot;lg&quot; で上書き
                </Text>
                <ToggleGroup type="single" size="sm" variant="outline" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month" size="lg">
                    月次
                  </ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  group にのみ指定（伝播）
                </Text>
                <ToggleGroup type="single" size="lg" variant="outline" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  item にのみ指定（従来の書き方・描画は不変）
                </Text>
                <ToggleGroup type="single" defaultValue="day">
                  <ToggleGroupItem value="day" size="lg" variant="outline">
                    日次
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" size="lg" variant="outline">
                    月次
                  </ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
