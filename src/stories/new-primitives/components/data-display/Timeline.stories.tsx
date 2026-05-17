import type { Meta, StoryObj } from "@storybook/react";
import { Timeline, TimelineItem } from "../../../../components/data-display/Timeline";
import { Avatar } from "../../../../components/data-display/Avatar";

/**
 * new-primitives/components/data-display/Timeline — chronological rail.
 *
 * Three variants, all backed by existing CSS atoms in
 * `src/styles/shell/80-card-sections.css`:
 *   - `"list"` — vertical rail (`.tl-list` + `.tl-item`). Default.
 *   - `"branching"` — approval-pipeline shape (`.tl-br`).
 *   - `"feed"` — avatar feed (`.tl-feed`).
 *
 * Documented props (per `Timeline.tsx`):
 *   Timeline: variant, reverse, pending, className
 *   TimelineItem: color, current, time, avatar, title, description
 *
 * Stories use the documented APIs only — no inline visual overrides
 * (cardinal rule 25: stories are docs; the primitive is the canon).
 */

const meta: Meta<typeof Timeline> = {
  title: "new-primitives/Components/Data Display/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Timeline** — chronological event rail with three visual shapes.

- **\`list\`** (default) — compact vertical rail with semantic markers.
- **\`branching\`** — left-aligned timestamp + central rail + body.
- **\`feed\`** — social-style avatar feed.

Colour vocabulary (cardinal rule 23 §B): \`default\` / \`primary\` /
\`success\` / \`warning\` / \`destructive\` / \`info\` / \`attention\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Timeline>;

// ─── List · default vertical rail ────────────────────────────────

export const ListDefault: Story = {
  name: "List · default vertical rail",
  render: () => (
    <Timeline>
      <TimelineItem
        color="success"
        title="申請を提出"
        time="09:30"
        description="2026年5月10日 月曜日"
      />
      <TimelineItem
        color="success"
        title="部長確認"
        time="10:15"
        description="経理部 田中部長"
      />
      <TimelineItem
        color="primary"
        current
        title="承認待ち"
        time="進行中"
        description="役員審査 — 概ね2営業日"
      />
      <TimelineItem
        color="default"
        title="支給予定"
        description="承認後の月末に振込"
      />
      <TimelineItem
        color="default"
        title="完了"
        description="経費清算終了"
      />
    </Timeline>
  ),
};

// ─── Branching · approval pipeline ───────────────────────────────

export const Branching: Story = {
  name: "Branching · approval pipeline",
  render: () => (
    <Timeline variant="branching">
      <TimelineItem
        color="success"
        time="05/08 09:30"
        title="申請受領"
        description="申請ID #2847 を受領しました"
      />
      <TimelineItem
        color="success"
        time="05/08 11:02"
        title="一次承認"
        description="マネージャー 山田 健 によって承認"
      />
      <TimelineItem
        color="primary"
        current
        time="05/09 14:30"
        title="役員審査中"
        description="財務担当 佐藤専務が確認中"
      />
      <TimelineItem
        color="attention"
        time="予定"
        title="経理処理"
        description="承認後 翌営業日"
      />
      <TimelineItem
        color="default"
        time="予定"
        title="支給"
        description="月末締め払い"
      />
    </Timeline>
  ),
};

// ─── Feed · social-style avatar timeline ─────────────────────────

export const Feed: Story = {
  name: "Feed · avatar event feed",
  render: () => (
    <Timeline variant="feed">
      <TimelineItem
        avatar={<Avatar name="田中 美香" size="sm" />}
        title="田中 美香 が新規プロジェクトを作成しました"
        time="2時間前"
        description="「2026年Q3 渋谷店リニューアル」"
      />
      <TimelineItem
        avatar={<Avatar name="鈴木 健太" size="sm" />}
        title="鈴木 健太 がコメントしました"
        time="4時間前"
        description="工事スケジュールについて確認お願いします。"
      />
      <TimelineItem
        avatar={<Avatar name="佐藤 桜" size="sm" />}
        title="佐藤 桜 がファイルをアップロードしました"
        time="昨日"
        description="平面図_v3.pdf を共有しました"
      />
      <TimelineItem
        avatar={<Avatar name="山田 太郎" size="sm" />}
        title="山田 太郎 がタスクを完了"
        time="2日前"
        description="UIモック作成 → 完了"
      />
    </Timeline>
  ),
};

// ─── Reverse — newest first ──────────────────────────────────────

export const Reverse: Story = {
  name: "Reverse · newest first",
  render: () => (
    <Timeline reverse>
      <TimelineItem
        color="success"
        title="ステップ 1"
        time="09:00"
        description="開始"
      />
      <TimelineItem
        color="success"
        title="ステップ 2"
        time="10:30"
        description="中間レビュー"
      />
      <TimelineItem
        color="primary"
        current
        title="ステップ 3"
        time="11:45"
        description="現在の作業"
      />
    </Timeline>
  ),
};

// ─── WithPending — trailing "ongoing" marker ─────────────────────

export const WithPending: Story = {
  name: "WithPending · ongoing trailing item",
  render: () => (
    <Timeline pending="次の同期を待機中…">
      <TimelineItem
        color="success"
        title="データベース同期"
        time="08:00"
        description="本日初回同期 — 1,283件処理"
      />
      <TimelineItem
        color="success"
        title="バックアップ作成"
        time="08:15"
        description="フルバックアップ完了"
      />
      <TimelineItem
        color="success"
        title="検証スクリプト実行"
        time="08:20"
        description="整合性チェック合格"
      />
    </Timeline>
  ),
};
