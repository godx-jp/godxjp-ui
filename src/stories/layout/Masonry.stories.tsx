import type { Meta, StoryObj } from "@storybook/react";
import { Masonry, MasonryItem } from "../../components/layout";
import { Card } from "../../components/data-display/Card";
import { Tag } from "../../components/data-display/Tag";
import { Flex } from "../../components/layout";

/**
 * layout/Masonry — Pinterest-style
 * staggered column flow.
 *
 * Items of varying heights pack naturally into N columns without
 * gaps. Built on CSS `column-count` (cross-browser stable since
 * 2017). Per cardinal rule 23 §A `<Masonry>` (container) and
 * `<MasonryItem>` (child-must-not-split) are separate concepts /
 * separate primitives.
 *
 * Per cardinal rule 23 §B `gap` uses the same vocabulary as
 * Flex / Grid.
 */

const meta: Meta<typeof Masonry> = {
  title: "Layout/Masonry",
  component: Masonry,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Masonry** — staggered column flow. Children of varying heights
pack into N columns without gaps. Wrap each child in
\`<MasonryItem>\` so it doesn't break across columns.

Cross-browser stable via CSS \`column-count\` / \`break-inside:
avoid\`. Native CSS Grid Level 3 \`masonry\` mode is in Firefox +
Safari preview but not Chromium yet — switch to that when stable.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Masonry>;

const COPY = [
  { t: "短いカード", h: 60 },
  { t: "中サイズのカード", h: 100, body: "勤怠データの月次サマリーをここに表示します。" },
  { t: "長文カード", h: 160, body: "システムメンテナンスのお知らせです。2026年5月25日 02:00〜04:00 (UTC) の間、勤怠ダッシュボードが利用できなくなります。予定停止時間は約 10 分間です。影響範囲: 全店舗。" },
  { t: "Stat card", h: 90, stat: "¥1,234,567" },
  { t: "短", h: 50 },
  { t: "申請承認", h: 110, body: "新規申請が 3 件保留中です。週末までに確認してください。" },
  { t: "Health", h: 80, body: "API · 正常稼働 · 遅延 142ms" },
  { t: "シフト", h: 140, body: "月 火 水 木 金 土 日 のシフト一覧をここに表示します。クリックで詳細を開きます。" },
  { t: "Empty", h: 70 },
  { t: "プロフィール", h: 130, body: "田中 美咲 · 店長 · 渋谷本店" },
];

export const ThreeCols: Story = {
  name: "3 columns (default)",
  render: () => (
    <Masonry cols={3} gap="default">
      {COPY.map((c, i) => (
        <MasonryItem key={i}>
          <Card padding="default" title={c.t} meta={`item ${i + 1}`}>
            {c.stat && <span className="stat">{c.stat}</span>}
            {c.body && <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>{c.body}</span>}
            {!c.stat && !c.body && <Tag>—</Tag>}
          </Card>
        </MasonryItem>
      ))}
    </Masonry>
  ),
};

export const FourCols: Story = {
  name: "4 columns",
  render: () => (
    <Masonry cols={4} gap="default">
      {COPY.map((c, i) => (
        <MasonryItem key={i}>
          <Card padding="tight" title={c.t}>
            {c.stat && <span className="stat">{c.stat}</span>}
            {c.body && <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>{c.body}</span>}
            {!c.stat && !c.body && <Tag>—</Tag>}
          </Card>
        </MasonryItem>
      ))}
    </Masonry>
  ),
};

export const GapVariants: Story = {
  name: "Gap axis (small / middle / large)",
  render: () => (
    <Flex vertical gap="default">
      {(["small", "default", "large"] as const).map((g) => (
        <Card key={g} padding="tight" title={`gap="${g}"`}>
          <Masonry cols={3} gap={g}>
            {COPY.slice(0, 6).map((c, i) => (
              <MasonryItem key={i}>
                <Card padding="tight" title={c.t}>
                  {c.body && <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>{c.body}</span>}
                  {!c.body && <Tag>—</Tag>}
                </Card>
              </MasonryItem>
            ))}
          </Masonry>
        </Card>
      ))}
    </Flex>
  ),
};
