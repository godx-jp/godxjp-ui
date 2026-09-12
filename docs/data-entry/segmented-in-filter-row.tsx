import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Segmented } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * The composition a consumer actually filters a list with: a Segmented that carries a count badge
 * per option, sharing a WRAPPING flex row with the other filter controls, inside a Card.
 *
 * It is a separate frame from `segmented.tsx` because the row is the variable. `#four-with-counts`
 * over there puts the track directly in a CardContent, where it is a block box and shrinks to the
 * column; here it is a FLEX ITEM, and a flex item's `min-inline-size` defaults to `auto` — its
 * max-content width — so nothing makes it give ground to the row.
 */
const OPTIONS = [
  { value: "all", label: "すべて", count: 133 },
  { value: "ginou", label: "技能実習", count: 82 },
  { value: "tokutei", label: "特定技能", count: 51 },
  { value: "ikusei", label: "育成就労", count: 0 },
];

export default function SegmentedInFilterRow() {
  return (
    <PageContainer title="Segmented in a filter row" subtitle="4 択 + 件数バッジ · Flex wrap の中">
      <Card id="four-in-wrap-row">
        <CardHeader>
          <CardTitle level={2}>制度の絞り込み</CardTitle>
          <CardDescription>
            `check:segmented-wrap` がこのカードも測ります。トラックは行の中でも縮み、393px
            でラベルも件数も切り詰めません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex gap="sm" align="center" wrap>
            <Segmented aria-label="制度" defaultValue="all" options={OPTIONS} />
            <Button variant="outline" size="sm">
              絞り込みを解除
            </Button>
          </Flex>
        </CardContent>
      </Card>

      <Card id="four-in-wrap-row-alone">
        <CardHeader>
          <CardTitle level={2}>同じトラック、行の中に一つだけ</CardTitle>
          <CardDescription>
            <Text size="sm" tone="muted">
              兄弟が無くても行は行。フレックス項目としての縮み方を切り分けるための対照。
            </Text>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex gap="sm" align="center" wrap>
            <Segmented aria-label="制度（単独）" defaultValue="all" options={OPTIONS} />
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
