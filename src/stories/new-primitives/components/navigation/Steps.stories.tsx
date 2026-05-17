import type { Meta, StoryObj } from "@storybook/react";
import { Steps, Step } from "../../../../components/primitives/Steps";

/**
 * Components/Navigation/Steps — wizard / progress indicator.
 *
 * Vocabulary (§23.B):
 *   - `orientation` — horizontal (default) | vertical
 *   - `current` (number, 0-based) — active step index
 *   - per-step: `title`, `description`, `icon`
 *
 * Reuses `.steps-h` / `.steps-v` CSS atoms from the dxs-kintai canon.
 */

const meta: Meta<typeof Steps> = {
  title: "new-primitives/Components/Navigation/Steps",
  component: Steps,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Steps>;

export const Horizontal: Story = {
  name: "Horizontal · 5 steps · current = 2",
  render: () => (
    <Steps current={2}>
      <Step title="情報入力" description="5/14 09:22" />
      <Step title="確認" description="5/14 09:24" />
      <Step title="承認待ち" description="進行中" />
      <Step title="支払い" description="—" />
      <Step title="完了" description="—" />
    </Steps>
  ),
};

export const HorizontalFirst: Story = {
  name: "Horizontal · current = 0",
  render: () => (
    <Steps current={0}>
      <Step title="会社情報" description="基本情報を入力" />
      <Step title="従業員" description="一括登録" />
      <Step title="シフト" description="テンプレート作成" />
      <Step title="給与連携" description="freee 連携" />
    </Steps>
  ),
};

export const HorizontalLast: Story = {
  name: "Horizontal · final step",
  render: () => (
    <Steps current={3}>
      <Step title="申請" description="完了" />
      <Step title="一次承認" description="完了" />
      <Step title="最終承認" description="完了" />
      <Step title="支払い反映" description="進行中" />
    </Steps>
  ),
};

export const Vertical: Story = {
  name: "Vertical · 4 steps",
  render: () => (
    <Steps orientation="vertical" current={2}>
      <Step
        title="会社情報を入力"
        description="基本情報 · 締め日 · 通貨を設定済み"
      />
      <Step
        title="従業員をインポート"
        description="38 名 · CSV から一括登録"
      />
      <Step
        title="シフトテンプレートを作成"
        description="早番 / 遅番 / 通し のパターンを定義します"
      />
      <Step
        title="給与連携を設定"
        description="freee · マネーフォワードと接続"
      />
    </Steps>
  ),
};
