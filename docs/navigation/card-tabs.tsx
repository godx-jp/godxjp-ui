import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Tabs } from "@godxjp/ui/navigation";

/**
 * CARD TABS — the strip and its panel as ONE object (gh#762).
 *
 * The screen this page is built from is the one the issue draws in ASCII: a saved-view strip over
 * a list, antd `type="editable-card"` shaped — closable views, a `+`, an action parked on the
 * trailing edge of the bar, and a body that the open tab opens INTO rather than sits above.
 *
 * Everything here is `Tabs` with documented props. There is no page-local CSS and no wrapper box
 * around the panel: the point of `bodied` is that the consumer no longer has to guess which box
 * to put underneath, because all three guesses were wrong (`<Card>` added a second 1px border at
 * a 9.708px radius over an 8px gap; `<Card variant="borderless">` and no box at all left the same
 * 8px gap). Measured after: 0px of gap, one continuous 1px line, and no line at all across the
 * active tab.
 */

type SavedView = {
  value: string;
  label: string;
  count: number;
  /** antd `Tab.closable` — 「すべての課題」 is the system view and cannot be deleted. */
  closable?: boolean;
  rows: string[];
};

const INITIAL_VIEWS: SavedView[] = [
  {
    value: "all",
    label: "すべての課題",
    count: 340,
    closable: false,
    rows: [
      "TASK-1042 · 請求書の様式を更新",
      "TASK-1041 · 監査ログの保存期間",
      "TASK-1038 · 権限表の棚卸",
    ],
  },
  {
    value: "mine",
    label: "自分の担当",
    count: 12,
    rows: ["TASK-1042 · 請求書の様式を更新", "TASK-1029 · 締め処理の手順書"],
  },
  {
    value: "review",
    label: "レビュー待ち",
    count: 0,
    rows: [],
  },
];

/** The list body a saved view opens into — a real panel, not a placeholder paragraph. */
function ViewBody({ view }: { view: SavedView }) {
  if (view.rows.length === 0) {
    return (
      <Text as="p" tone="muted">
        この条件に一致する課題はありません。
      </Text>
    );
  }
  return (
    <Flex direction="col" gap="sm">
      {view.rows.map((row) => (
        <Text key={row} as="p">
          {row}
        </Text>
      ))}
    </Flex>
  );
}

const PLACEMENT_ITEMS = [
  { value: "summary", label: "サマリ", content: <Text as="p">当月の売上合計 ¥4,820,000</Text> },
  { value: "detail", label: "明細", content: <Text as="p">明細 24 件 · 未承認 2 件</Text> },
  { value: "audit", label: "監査", content: <Text as="p">監査ログ 96 件</Text> },
];

const COUNT_ITEMS = [
  {
    value: "open",
    label: "未対応",
    count: 12,
    countLabel: "件の課題",
    content: <Text as="p">未対応 12 件</Text>,
  },
  {
    value: "doing",
    label: "対応中",
    count: 340,
    overflowCount: 999,
    countLabel: "件の課題",
    content: <Text as="p">対応中 340 件</Text>,
  },
  {
    value: "capped",
    label: "全期間",
    count: 1280,
    countLabel: "件の課題",
    content: <Text as="p">全期間 1,280 件 · 既定の overflowCount は 99</Text>,
  },
  {
    value: "empty",
    label: "保留",
    count: 0,
    countLabel: "件の課題",
    content: <Text as="p">保留 0 件</Text>,
  },
  {
    value: "hidden-zero",
    label: "却下",
    count: 0,
    showZero: false,
    countLabel: "件の課題",
    content: <Text as="p">showZero={"{false}"} なので 0 のピルは描かれない</Text>,
  },
  {
    value: "off",
    label: "アーカイブ",
    disabled: true,
    count: 7,
    countLabel: "件の課題",
    content: <Text as="p">アーカイブ</Text>,
  },
];

export default function Demo() {
  const [views, setViews] = useState(INITIAL_VIEWS);
  const [activeView, setActiveView] = useState("all");
  const [nextView, setNextView] = useState(1);

  return (
    <PageContainer
      title="カードタブ"
      subtitle="ストリップとパネルをひとつの箱にする bodied と、タブの件数バッジ。"
    >
      <Flex direction="col" gap="lg">
        {/* THE SCREEN THE ISSUE DRAWS — saved views over a list. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>保存したビュー · editable-card + bodied</CardTitle>
            <CardDescription>
              antd の <code>type=&quot;editable-card&quot;</code> と同じ形。
              <code>bodied</code> がパネルの枠・角丸・背景を描くので、ストリップとパネルが
              ひとつの箱として読める。「すべての課題」は <code>closable: false</code>
              なので × が出ない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              id="saved-views"
              variant="editable-card"
              bodied
              value={activeView}
              onValueChange={setActiveView}
              extra={
                <Button size="sm" variant="outline">
                  フィルタを保存
                </Button>
              }
              onEdit={(target, action) => {
                if (action === "add") {
                  const value = `view-${nextView}`;
                  setViews((prev) => [
                    ...prev,
                    { value, label: `新しいビュー ${nextView}`, count: 0, rows: [] },
                  ]);
                  setNextView((n) => n + 1);
                  setActiveView(value);
                  return;
                }
                const key = String(target);
                setViews((prev) => prev.filter((view) => view.value !== key));
                setActiveView((current) =>
                  current === key ? (views.find((v) => v.value !== key)?.value ?? "all") : current,
                );
              }}
              items={views.map((view) => ({
                value: view.value,
                label: view.label,
                closable: view.closable,
                count: view.count,
                overflowCount: 999,
                countLabel: "件の課題",
                content: <ViewBody view={view} />,
              }))}
            />
          </CardContent>
        </Card>

        {/* THE DEFECT, SIDE BY SIDE. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>bodied なし / あり</CardTitle>
            <CardDescription>
              <code>bodied</code> なしの card ストリップは 8px 離れた透明なパネルの上に浮く —「card
              と tab が 1 つに融合していない」と報告された形。あり側は隙間 0px、 線は 1
              本、アクティブなタブの下辺だけが開いている。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  bodied なし（28.0.0 まで）
                </Text>
                <Tabs
                  id="card-unbodied"
                  defaultValue="summary"
                  variant="card"
                  items={PLACEMENT_ITEMS}
                />
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  bodied
                </Text>
                <Tabs
                  id="card-bodied"
                  defaultValue="summary"
                  variant="card"
                  bodied
                  items={PLACEMENT_ITEMS}
                />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* EVERY PLACEMENT — the joined edge follows the strip. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>bodied × tabPlacement</CardTitle>
            <CardDescription>
              角丸が落ちる辺・枠が重なる辺は、ストリップの位置に従う。
              <code>start</code> / <code>end</code> は論理値なので RTL でも反転する （48rem 以下では
              top / bottom に折り返す）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              {(["top", "bottom", "start", "end"] as const).map((placement) => (
                <Flex key={placement} direction="col" gap="sm">
                  <Text as="p" size="sm" tone="muted">
                    tabPlacement=&quot;{placement}&quot;
                  </Text>
                  <Tabs
                    id={`card-bodied-${placement}`}
                    defaultValue="summary"
                    variant="card"
                    bodied
                    tabPlacement={placement}
                    items={PLACEMENT_ITEMS}
                  />
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* THE COUNT. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>タブの件数バッジ · count / countLabel</CardTitle>
            <CardDescription>
              <code>count</code> は Button・Toggle と同じカウンタ語彙で、
              <code>Intl.NumberFormat</code> でロケール整形される。読み上げ名は 「未対応, 12
              件の課題」 — 数字が直接ラベルに連結しないよう、ピルは <code>aria-hidden</code>、
              読み上げ用の文だけが <code>sr-only</code> で隣に置かれる。 既定の上限は 99（
              <code>overflowCount</code> で変更）、 0 を隠すには <code>showZero={"{false}"}</code>。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;line&quot;
                </Text>
                <Tabs id="count-line" defaultValue="open" variant="line" items={COUNT_ITEMS} />
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;card&quot; + bodied
                </Text>
                <Tabs
                  id="count-card"
                  defaultValue="open"
                  variant="card"
                  bodied
                  items={COUNT_ITEMS}
                />
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;sm&quot; / &quot;md&quot; / &quot;lg&quot;
                </Text>
                {(["sm", "md", "lg"] as const).map((size) => (
                  <Tabs
                    key={size}
                    id={`count-${size}`}
                    defaultValue="open"
                    variant="line"
                    size={size}
                    items={COUNT_ITEMS.slice(0, 3)}
                  />
                ))}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* The other joined pair the package already ships. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>もうひとつの「ひとつの箱」· Card tabList</CardTitle>
            <CardDescription>
              ストリップがカードの見出しの下に入る形は <code>Card tabList</code> が担当する （antd
              `Card` の <code>tabList</code>）。枠はカードのもので、
              <code>bodied</code> は要らない。card 系のストリップを単体で置くときだけ
              <code>bodied</code> を使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card
              tabList={[
                { key: "all", tab: "すべての課題", closable: false },
                { key: "mine", tab: "自分の担当" },
              ]}
            >
              <CardContent>
                <Text as="p">カードの枠がそのままパネルの枠になる。</Text>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
