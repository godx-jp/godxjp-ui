import type { Meta, StoryObj } from "@storybook/react";
import { Megaphone } from "lucide-react";
import { Alert } from "../../../../components/feedback/Alert";
import { Button } from "../../../../components/general/Button";
import { Space } from "../../../../components/layout";

/**
 * Components/Feedback/Alert — banner-style notice.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `color`       — semantic role (`default` / `info` / `success` /
 *                    `warning` / `destructive`).
 *  - `variant`     — `outlined` (default card) or `banner` (full-width).
 *  - `title`       — primary message slot.
 *  - `description` — secondary body slot.
 *  - `actions`     — footer action slot (matches Card vocabulary).
 *  - `closable` + `onClose` — render a × close button.
 *  - `icon`        — leading icon; omit to auto-pick a semantic icon.
 */

const meta: Meta<typeof Alert> = {
  title: "new-primitives/Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Banner-style notice. Use for in-page status, deadlines, " +
          "and reminders. For ephemeral feedback see Toaster; for blocking " +
          "confirmation see AlertDialog.",
      },
    },
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["default", "info", "success", "warning", "destructive"],
    },
    variant: {
      control: { type: "select" },
      options: ["outlined", "banner"],
    },
    closable: { control: { type: "boolean" } },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert
      color="info"
      title="5月度の締めは 5/31 (土) 23:59 です"
      description="期限後の修正には承認が必要になります。"
    />
  ),
};

export const Colors_Sweep: Story = {
  name: "Colors — success / info / warning / destructive",
  render: () => (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Alert
        color="success"
        title="4月度の勤怠が確定しました"
        description="承認者: 山田 太郎 / 確定日時: 5/1 09:12"
        closable
      />
      <Alert
        color="info"
        title="5月度の締めは 5/31 (土) 23:59 です"
        description="締め後の修正は申請が必要です。"
        closable
      />
      <Alert
        color="warning"
        title="3 件の打刻漏れがあります"
        description="本日中に確認しないと月次集計に反映されません。"
        closable
      />
      <Alert
        color="destructive"
        title="勤怠データの同期に失敗しました"
        description="サポートに問い合わせるか、再同期を実行してください。"
        closable
      />
    </Space>
  ),
};

export const Banner_Variant: Story = {
  name: "Banner — full-width borderless",
  render: () => (
    <Alert
      variant="banner"
      color="info"
      title="5/20 (火) 22:00 〜 23:00 にメンテナンスを実施します。"
    />
  ),
};

export const WithActions: Story = {
  name: "With actions — dismiss + view details",
  render: () => (
    <Alert
      color="warning"
      title="3 件の打刻漏れがあります"
      description="本日中に確認してください。"
      actions={
        <>
          <Button size="small" variant="primary">
            確認する
          </Button>
          <Button size="small" variant="ghost">
            後で
          </Button>
        </>
      }
    />
  ),
};

export const Title_Only: Story = {
  name: "Title only — minimal closable",
  render: () => (
    <Alert
      color="info"
      title="5月度の締めは 5/31 (土) 23:59 です"
      closable
    />
  ),
};

export const WithCustomIcon: Story = {
  name: "Custom icon — Megaphone",
  render: () => (
    <Alert
      color="info"
      icon={<Megaphone aria-hidden="true" width={16} height={16} />}
      title="新機能リリースのお知らせ"
      description="勤怠ダッシュボードに月次サマリーが追加されました。"
    />
  ),
};

export const WithoutIcon: Story = {
  name: "Without icon — text only",
  render: () => (
    <Alert
      color="success"
      icon={null}
      title="4月度の勤怠が確定しました"
      description="承認者: 山田 太郎"
    />
  ),
};
