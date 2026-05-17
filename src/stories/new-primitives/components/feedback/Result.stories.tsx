import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import { Result } from "../../../../components/primitives/Result";
import { Button } from "../../../../components/primitives/Button";

/**
 * Components/Feedback/Result — page-level outcome surface.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `color`       — semantic role (`default` / `info` / `success` /
 *                    `warning` / `destructive`). Ant's `status` is
 *                    NOT exposed — HTTP-status overload is dropped;
 *                    consumers wire their own icon when needed.
 *  - `title`       — primary headline slot.
 *  - `description` — secondary body slot (matches Alert vocabulary;
 *                    NOT `subTitle`).
 *  - `icon`        — leading visual; omit to auto-pick a semantic icon.
 *  - `extra`       — action area below the description (matches Card).
 */

const meta: Meta<typeof Result> = {
  title: "new-primitives/Components/Feedback/Result",
  component: Result,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Page-level outcome surface. Use after a multi-step flow " +
          "completes (success), when a fatal error blocks the page " +
          "(destructive), when access is gated (warning), or when a " +
          "section has no data yet (info). For inline notices see Alert.",
      },
    },
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["default", "info", "success", "warning", "destructive"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Result>;

export const Success: Story = {
  render: () => (
    <Result
      color="success"
      title="ご注文が完了しました"
      description="番号 No. 2026-05-17-0042 でお手元に届きます。"
      extra={<Button variant="primary">注文履歴を見る</Button>}
    />
  ),
};

export const Error_500: Story = {
  name: "Error — server error (was Ant status=500)",
  render: () => (
    <Result
      color="destructive"
      title="サーバーエラー"
      description="しばらくしてから再度お試しください。サポートチームに通知済みです。"
      extra={
        <>
          <Button variant="primary">もう一度試す</Button>
          <Button variant="outline">サポートに連絡</Button>
        </>
      }
    />
  ),
};

export const Warning_403: Story = {
  name: "Warning — access denied (was Ant status=403)",
  render: () => (
    <Result
      color="warning"
      title="アクセス権限がありません"
      description="この画面を見るには管理者権限が必要です。"
      extra={<Button variant="outline">管理者に依頼</Button>}
    />
  ),
};

export const Info_NoData: Story = {
  name: "Info — empty section",
  render: () => (
    <Result
      color="info"
      title="まだデータがありません"
      description="従業員を追加するとここに表示されます。"
      extra={<Button variant="primary">従業員を追加</Button>}
    />
  ),
};

export const Custom_Icon: Story = {
  name: "Custom icon — Sparkles",
  render: () => (
    <Result
      color="success"
      icon={<Sparkles aria-hidden="true" width={64} height={64} />}
      title="完了!"
      description="今月の目標を達成しました。引き続きよろしくお願いします。"
    />
  ),
};
