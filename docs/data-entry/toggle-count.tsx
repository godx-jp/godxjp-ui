import { useState } from "react";
import { Eye, PartyPopper, ThumbsUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
} from "@godxjp/ui/data-display";
import { Toggle, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Toggle `count` — the counted, PRESSED chip (gh#312).
 *
 * `Button` owns the counter-pill vocabulary (`count` / `overflowCount` / `showZero`) and `Toggle`
 * owns the pressed state, so a faceted filter chip ("未対応 42", selected or not) and a reaction
 * chip had no primitive: `<Button aria-pressed>` paints no state, a hand-written `<span>` inside a
 * Toggle re-derives the Intl formatting and the cap page-side, and a nested `Badge` double-borders
 * the chip. Toggle now carries the SAME vocabulary, so the chip is one control with one accessible
 * name and one focus ring.
 *
 * Composed only from real @godxjp/ui components.
 */

type Ticket = {
  id: string;
  subject: string;
  status: "open" | "waiting" | "closed";
  assignee: string;
  updatedAt: string;
};

const TICKETS: Ticket[] = [
  {
    id: "TCK-1042",
    subject: "請求書の消費税区分が誤っている",
    status: "open",
    assignee: "佐藤",
    updatedAt: "2026-08-28",
  },
  {
    id: "TCK-1041",
    subject: "口座振替の初回引落日について",
    status: "waiting",
    assignee: "鈴木",
    updatedAt: "2026-08-28",
  },
  {
    id: "TCK-1039",
    subject: "年末調整の書類提出期限を延長したい",
    status: "open",
    assignee: "高橋",
    updatedAt: "2026-08-27",
  },
  {
    id: "TCK-1035",
    subject: "退職者の social insurance 資格喪失届",
    status: "closed",
    assignee: "田中",
    updatedAt: "2026-08-26",
  },
  {
    id: "TCK-1031",
    subject: "支店追加に伴う権限設定の依頼",
    status: "waiting",
    assignee: "佐藤",
    updatedAt: "2026-08-25",
  },
];

const STATUS_LABEL: Record<Ticket["status"], string> = {
  open: "未対応",
  waiting: "保留中",
  closed: "対応済み",
};

const COLUMNS = [
  { key: "id", header: "番号", width: "8rem", priority: "meta" as const },
  { key: "subject", header: "件名", priority: "primary" as const },
  {
    key: "status",
    header: "状態",
    width: "8rem",
    priority: "secondary" as const,
    render: (row: Ticket) => STATUS_LABEL[row.status],
  },
  { key: "assignee", header: "担当", width: "8rem", priority: "secondary" as const },
  { key: "updatedAt", header: "更新日", width: "10rem", priority: "meta" as const },
];

export default function Demo() {
  // Faceted filter chips — pressed = the facet is applied. Counts are the facet sizes.
  const [facets, setFacets] = useState<string[]>(["open"]);
  // A reaction row: the count is how many people reacted, the pressed state is whether YOU did.
  const [reactions, setReactions] = useState<string[]>(["thumbsup"]);
  const [pinned, setPinned] = useState(true);

  const counts = {
    open: TICKETS.filter((t) => t.status === "open").length,
    waiting: TICKETS.filter((t) => t.status === "waiting").length,
    closed: TICKETS.filter((t) => t.status === "closed").length,
  };
  const rows = facets.length === 0 ? TICKETS : TICKETS.filter((t) => facets.includes(t.status));

  return (
    <PageContainer
      title="Toggle count"
      subtitle="カウント付きの押下チップ · faceted filter · リアクション"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>問い合わせ受信箱</CardTitle>
            <CardDescription>
              ToggleGroup type=&quot;multiple&quot; の各アイテムが count
              を持つファセットチップ。variant/size はグループの context から届き、数字だけが item
              ごとのデータ。押下状態は aria-pressed
              が担い、色だけに依存しない（押下でチップが反転し、ピルも反転する）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="sm"
                value={facets}
                onValueChange={setFacets}
                aria-label="状態で絞り込み"
              >
                <ToggleGroupItem value="open" count={counts.open} countLabel="件">
                  未対応
                </ToggleGroupItem>
                <ToggleGroupItem value="waiting" count={counts.waiting} countLabel="件">
                  保留中
                </ToggleGroupItem>
                <ToggleGroupItem value="closed" count={counts.closed} countLabel="件">
                  対応済み
                </ToggleGroupItem>
                <ToggleGroupItem value="escalated" count={0} showZero={false} countLabel="件">
                  エスカレーション
                </ToggleGroupItem>
              </ToggleGroup>
              <Text tone="muted" size="sm">
                「エスカレーション」は count=0 かつ showZero=false
                なのでピルが出ない。0件のファセットを常に見せたい場合は showZero を既定の true
                のままにする。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardContent flush>
            <DataTable data={rows} columns={COLUMNS} getRowId={(row: Ticket) => row.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>リアクション</CardTitle>
            <CardDescription>
              絵文字ラベルには aria-label が要る。aria-label
              があると内容はアクセシブル名から外れるので、count はラベル側に畳み込まれ 「いいね, 12
              件」と読み上げられる。数字の読み上げは 1 回だけで、count が変わっても live region
              では通知しない（他人のリアクションはこのコントロールの状態ではない）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" wrap align="center">
              <ToggleGroup
                type="multiple"
                size="sm"
                value={reactions}
                onValueChange={setReactions}
                aria-label="この投稿へのリアクション"
              >
                <ToggleGroupItem
                  value="thumbsup"
                  aria-label="いいね"
                  count={reactions.includes("thumbsup") ? 12 : 11}
                  countLabel="件"
                >
                  <ThumbsUp aria-hidden="true" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="party"
                  aria-label="おめでとう"
                  count={reactions.includes("party") ? 4 : 3}
                  countLabel="件"
                >
                  <PartyPopper aria-hidden="true" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="eyes"
                  aria-label="確認中"
                  count={reactions.includes("eyes") ? 1240 : 1239}
                  overflowCount={999}
                  countLabel="件"
                >
                  <Eye aria-hidden="true" />
                </ToggleGroupItem>
              </ToggleGroup>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Button の count と同じ語彙</CardTitle>
            <CardDescription>
              count / overflowCount / showZero は Button から一字一句そのまま。ピルの寸法
              （min-width 16px・左右パディング 4px・12.47px・角 pill・tabular-nums）も Button と
              完全に一致し、トークン同値テストで固定してある。色だけは分けている： Toggle
              のピルは押下で反転する面の上に乗るので、押下時 5.04:1（light）/ 7.05:1（dark）、
              非押下時 14.18:1 / 12.44:1 と別に実測している。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="center" wrap>
              <Button variant="outline" count={1240} overflowCount={999}>
                受信箱
              </Button>
              <Toggle
                variant="outline"
                count={1240}
                overflowCount={999}
                countLabel="件"
                pressed={pinned}
                onPressedChange={setPinned}
              >
                受信箱
              </Toggle>
              <Text tone="muted" size="sm">
                どちらも Intl.NumberFormat でロケール整形され、overflowCount を超えると
                「999+」になる。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>サイズと variant</CardTitle>
            <CardDescription>
              sm / md / lg × default / outline。数字は tabular-nums で桁が動かず、min-width
              があるので 1 桁でもピルが潰れない。粗いポインタでは --control-height が 44px
              以上に上がるので、チップの行がタップの地雷原にならない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="md" align="center" wrap>
                <Toggle size="sm" count={3} countLabel="件" defaultPressed>
                  小
                </Toggle>
                <Toggle size="md" count={42} countLabel="件" defaultPressed>
                  標準
                </Toggle>
                <Toggle size="lg" count={1000} countLabel="件" defaultPressed>
                  大
                </Toggle>
              </Flex>
              <Flex direction="row" gap="md" align="center" wrap>
                <Toggle variant="outline" size="sm" count={3} countLabel="件">
                  小
                </Toggle>
                <Toggle variant="outline" size="md" count={42} countLabel="件">
                  標準
                </Toggle>
                <Toggle variant="outline" size="lg" count={1000} countLabel="件">
                  大
                </Toggle>
              </Flex>
              <Flex direction="row" gap="md" align="center" wrap>
                <Toggle count={7} countLabel="件" pressed disabled>
                  締め済み（押下・無効）
                </Toggle>
                <Toggle count={7} countLabel="件" disabled>
                  締め済み（無効）
                </Toggle>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
