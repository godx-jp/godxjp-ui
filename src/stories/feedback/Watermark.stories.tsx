import type { Meta, StoryObj } from "@storybook/react";
import { Watermark } from "../../components/feedback/Watermark";
import { Card } from "../../components/data-display/Card";

/**
 * Feedback/Watermark — repeating SVG-tile overlay used to
 * mark a region as confidential / draft / preview / personal copy.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `content`    — single line or multi-line array (no synonym).
 *  - `rotate`     — degrees, default -22.
 *  - `gap`        — tile gap `[x, y]` in px, default [120, 80].
 *  - `fontSize`   — px, default 14.
 *  - `fontFamily` — defaults to inherited system stack.
 *  - `opacity`    — 0-1, default 0.12.
 *
 * Theme-aware via `currentColor` (read from `--muted-foreground`).
 */

const meta: Meta<typeof Watermark> = {
  title: "Feedback/Watermark",
  component: Watermark,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Repeating SVG-tile overlay. Use for confidential / draft / " +
          "personal-copy regions. The tile inherits the muted-foreground " +
          "colour so light + dark themes both read correctly.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Watermark>;

export const Default: Story = {
  render: () => (
    <Watermark content="Famgia · Confidential" style={{ padding: 24 }}>
      <Card style={{ width: 480 }}>
        <div className="card-header-stack">
          <h3 className="card-title">5月度 勤怠サマリー</h3>
          <span className="card-subtitle">確定前のドラフトです</span>
        </div>
        <div className="card-body">
          <p>承認: 山田 太郎</p>
          <p>合計勤務時間: 168h 30m</p>
          <p>残業: 12h 45m</p>
        </div>
      </Card>
    </Watermark>
  ),
};

export const MultiLine: Story = {
  render: () => (
    <Watermark
      content={["田中 美咲", "famgia@example.com", "2026/05/17"]}
      style={{ padding: 24, minHeight: 320 }}
    >
      <Card style={{ width: 480 }}>
        <div className="card-header-stack">
          <h3 className="card-title">個人配布資料</h3>
          <span className="card-subtitle">
            本資料は閲覧者本人のみが利用できます
          </span>
        </div>
        <div className="card-body">
          <p>所有者ごとに透かしを焼き込んでから配布します。</p>
        </div>
      </Card>
    </Watermark>
  ),
};

export const Sparse: Story = {
  render: () => (
    <Watermark
      content="DRAFT"
      gap={[200, 140]}
      fontSize={22}
      style={{ padding: 24, minHeight: 320, width: 640 }}
    >
      <Card>
        <div className="card-header-stack">
          <h3 className="card-title">申請書(下書き)</h3>
          <span className="card-subtitle">送信前 · 承認は走っていません</span>
        </div>
        <div className="card-body">
          <p>件名: 出張旅費精算</p>
          <p>金額: ¥38,420</p>
        </div>
      </Card>
    </Watermark>
  ),
};

export const Dense: Story = {
  render: () => (
    <Watermark
      content="©"
      gap={[40, 40]}
      fontSize={10}
      style={{ padding: 24, minHeight: 240, width: 480 }}
    >
      <Card>
        <div className="card-header-stack">
          <h3 className="card-title">密度高めの透かし</h3>
          <span className="card-subtitle">細かいタイルを敷き詰める</span>
        </div>
        <div className="card-body">
          <p>サンプル · 画像書き出し前のプレビュー用</p>
        </div>
      </Card>
    </Watermark>
  ),
};
