import type { Meta, StoryObj } from "@storybook/react";
import { Watermark } from "../../../../components/feedback/Watermark";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardSubtitle,
} from "../../../../components/data-display/Card";

/**
 * Components/Feedback/Watermark — repeating SVG-tile overlay used to
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
  title: "new-primitives/Components/Feedback/Watermark",
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
        <CardHeader>
          <CardTitle>5月度 勤怠サマリー</CardTitle>
          <CardSubtitle>確定前のドラフトです</CardSubtitle>
        </CardHeader>
        <CardBody>
          <p>承認: 山田 太郎</p>
          <p>合計勤務時間: 168h 30m</p>
          <p>残業: 12h 45m</p>
        </CardBody>
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
        <CardHeader>
          <CardTitle>個人配布資料</CardTitle>
          <CardSubtitle>本資料は閲覧者本人のみが利用できます</CardSubtitle>
        </CardHeader>
        <CardBody>
          <p>所有者ごとに透かしを焼き込んでから配布します。</p>
        </CardBody>
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
        <CardHeader>
          <CardTitle>申請書(下書き)</CardTitle>
          <CardSubtitle>送信前 · 承認は走っていません</CardSubtitle>
        </CardHeader>
        <CardBody>
          <p>件名: 出張旅費精算</p>
          <p>金額: ¥38,420</p>
        </CardBody>
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
        <CardHeader>
          <CardTitle>密度高めの透かし</CardTitle>
          <CardSubtitle>細かいタイルを敷き詰める</CardSubtitle>
        </CardHeader>
        <CardBody>
          <p>サンプル · 画像書き出し前のプレビュー用</p>
        </CardBody>
      </Card>
    </Watermark>
  ),
};
