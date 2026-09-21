import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  Masonry,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
  type MasonryItemProp,
} from "@godxjp/ui/layout";
import { Bot, Images, Inbox, MessageSquare, Settings } from "lucide-react";

import coverTerrain from "../assets/cover-terrain.svg";
import shotPortrait from "../assets/shot-portrait.svg";

/**
 * Masonry — Ant Design `Masonry` (6.0.0). A real inbox of mixed-height notes, not a tidy row of
 * equal cards: the tidy demo is the one that hides every defect this layout actually has.
 *
 * Every card on this page is an EDGE:
 * — a one-line note beside a twelve-line one, in the same run;
 * — an IMAGE tile whose height is declared so the columns do not jump when it decodes;
 * — a CJK tile of real Japanese prose at --line-height-body 1.7, which is taller per character
 *   than the Latin beside it;
 * — the single-column case, which is what every narrow viewport collapses to;
 * — a tile PINNED to the first column, which is where reading order and visual order part company;
 * — a responsive `columns` map, driven live by the viewport.
 *
 * Composed only from real @godxjp/ui components.
 */
const sections: SidebarSectionProp[] = [
  {
    label: "受信",
    items: [
      { id: "inbox", label: "メモ", icon: Inbox },
      { id: "gallery", label: "素材", icon: Images },
      { id: "chat", label: "やりとり", icon: MessageSquare },
      { id: "agents", label: "エージェント", icon: Bot },
    ],
  },
  { label: "管理", items: [{ id: "settings", label: "設定", icon: Settings }] },
];

/** A one-line note. The shortest thing this layout ever has to place. */
function ShortNote({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text size="sm">{body}</Text>
      </CardContent>
    </Card>
  );
}

const LONG_BODY = [
  "The rule the team keeps re-deriving: a masonry has two orders and they do not agree.",
  "DOM order is the order of `items`, always, because every tile is absolutely positioned and",
  "nothing reorders the markup. Visual order is the packing: tile four lands under whichever of",
  "the first three columns is shortest, so it can paint ABOVE a tile that precedes it in the",
  "source. That is the form, and the consequence is one line long: order the items by importance,",
  "never by height.",
  "",
  "It matters most for the keyboard. Tab visits this card before the short one beside it even",
  "when this card's top edge sits lower on the screen, and a screen reader reads them in the same",
  "sequence. The alternative implementation, CSS `column-count`, is worse on exactly that axis:",
  "it fills the first column to the bottom before starting the second, so in a thirty-tile feed",
  "the second tile in the DOM paints at the bottom-left corner of the viewport.",
].join(" ");

const JA_BODY =
  "日本語の本文は 1 文字あたりの高さが欧文より大きい。全角の仮名と漢字が em ボックスを埋めるので、" +
  "--line-height-body の 1.7 がそのまま行の高さに効く。同じ文字数でも、欧文の隣に置くと列の高さが" +
  "先に伸びるのはそのためで、段組みの詰め方はこの差をそのまま受け取る。短い注記と長い注記を同じ列に" +
  "並べたときに、どちらが先に読まれるかは見た目ではなく items の順序が決める。ここを取り違えると、" +
  "画面では上にあるカードが、読み上げでは最後に来る。";

export default function MasonryDoc() {
  const [columns, setColumns] = useState(3);
  const [placed, setPlaced] = useState<number[]>([]);

  const feed: MasonryItemProp[] = [
    {
      key: "one-line",
      children: <ShortNote title="請求書 #4821" body="承認済み。" />,
    },
    {
      key: "image",
      // The declared height is what keeps the columns still while the image decodes: without it
      // every tile below this one jumps the moment the bytes land.
      height: 268,
      children: (
        <Card>
          <CardContent>
            <Thumbnail src={coverTerrain} width={480} height={270} alt="" />
            <Text size="xs" tone="muted">
              cover-terrain.svg · 480×270
            </Text>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "long",
      children: (
        <Card>
          <CardHeader>
            <CardTitle>Reading order vs visual order</CardTitle>
            <CardDescription>Twelve lines, beside a one-line card.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm">{LONG_BODY}</Text>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "ja",
      children: (
        <Card>
          <CardHeader>
            <CardTitle>行の高さは言語で変わる</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="sm">{JA_BODY}</Text>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "badge",
      children: (
        <Card>
          <CardContent>
            <Flex gap="sm" wrap>
              <Badge>下書き</Badge>
              <Badge variant="secondary">保留</Badge>
              <Badge variant="outline">期限切れ</Badge>
            </Flex>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "pinned",
      // PINNED. It stays fifth in the reading order whatever the packing does with it.
      column: 0,
      children: (
        <Card>
          <CardHeader>
            <CardTitle>column: 0</CardTitle>
            <CardDescription>
              最初の列に固定。読み上げの順番は五番目のまま動かない。
            </CardDescription>
          </CardHeader>
        </Card>
      ),
    },
    {
      key: "portrait",
      height: 232,
      children: (
        <Card>
          <CardContent>
            <Thumbnail src={shotPortrait} width={360} height={640} alt="モバイル版の一覧画面" />
          </CardContent>
        </Card>
      ),
    },
    {
      key: "two-line",
      children: (
        <ShortNote
          title="経費精算"
          body="領収書が二枚不足しています。差し戻し前に担当者へ確認してください。"
        />
      ),
    },
    {
      key: "shortest",
      children: <ShortNote title="勤怠" body="—" />,
    },
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="inbox"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreDesk", role: "メモ", color: "hsl(var(--primary))" }}
        />
      }
      topbar={<Topbar />}
    >
      <PageContainer
        title="段組みメモ"
        subtitle="Masonry · 高さの揃わないカードを、そのつど一番低い列へ落としていく"
      >
        {/* THE REAL SCREEN. Responsive columns, a mixed feed, and the layout report. */}
        <Flex direction="col" gap="sm">
          <Flex gap="sm" align="center" wrap>
            <Text size="sm" weight="medium">
              columns · {columns} · fresh
            </Text>
            {[1, 2, 3, 4].map((count) => (
              <Button
                key={count}
                size="sm"
                variant={count === columns ? "default" : "outline"}
                onClick={() => setColumns(count)}
              >
                {count}
              </Button>
            ))}
            <Text size="xs" tone="muted">
              {placed.length === 0
                ? "onLayoutChange 待ち"
                : `onLayoutChange · 列ごとの枚数 ${placed.join(" / ")}`}
            </Text>
          </Flex>
          {/* `fresh` is ON here, and the reason is a measurement, not a preference: at 390px the
              long English card re-wraps by one line AFTER the pass that measured it, and with the
              container observer alone (antd's default) nothing notices — the container reported
              2472.2px while its own content ended at 2489.7px. `fresh` observes each tile, so the
              two agree. A feed with images and a live column count is exactly what it is for. */}
          <Masonry
            fresh
            columns={columns}
            gap="md"
            items={feed}
            onLayoutChange={(layout) => {
              const perColumn = new Array<number>(columns).fill(0);
              for (const entry of layout) perColumn[entry.column] += 1;
              setPlaced(perColumn);
            }}
          />
        </Flex>

        {/* THE NARROW CASE, on purpose and at full width: one column is what every phone gets,
            and it is the arrangement a three-column demo never shows. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            単一列 · columns={1}
          </Text>
          <Text size="xs" tone="muted">
            狭い画面はここに収束する。段組みが消えても読み上げの順番は同じ。DOM の順序は items
            の順序のまま。
          </Text>
          <Masonry columns={1} gap="sm" items={feed.slice(0, 4)} />
        </Flex>

        {/* THE VIEWPORT MAP. `columns` takes the same step names Flex direction does. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            columns={"{ base: 1, sm: 2, md: 3, xl: 4 }"}
          </Text>
          <Text size="xs" tone="muted">
            sm 40rem · md 48rem · lg 64rem · xl 80rem。Ant Design の `xs` はここでは `base`、`xxl`
            はない。
          </Text>
          <Masonry columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap="md" items={feed.slice(2)} />
        </Flex>

        {/* NO GAP AT ALL — Ant Design's own default, which is what a token-less masonry looks
            like. Worth seeing once so the `gap` step is a decision rather than a habit. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            gap 省略 · Ant Design の既定は 0
          </Text>
          <Masonry columns={3} items={feed.slice(0, 5)} />
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
