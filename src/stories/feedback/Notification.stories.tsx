import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../../components/feedback/toaster";
import { Button } from "../../components/general/Button";

/**
 * Feedback/Notification — rich toast: title + description
 * + optional action button. Backed by the same `toast` engine as
 * Message; the difference is presentation density (Message is
 * single-line, Notification is multi-region).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - No `visible` / `isOpen` / `shown`. Use the `toast()` API with
 *    `description` / `action` / `duration` options.
 */

const meta: Meta = {
  title: "Feedback/Notification",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Rich toast with title + description + optional action. Use " +
          "for asynchronous events that the user may want to undo or " +
          "follow up on.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const WithDescription: Story = {
  name: "With description — title + body",
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="primary"
        onClick={() =>
          toast("シフトが更新されました", {
            description: "5月 17日 (土) · 8:00–17:00",
          })
        }
      >
        description つきで表示
      </Button>
    </div>
  ),
};

export const WithAction: Story = {
  name: "With action — undo button",
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="primary"
        onClick={() =>
          toast("申請を取り下げました", {
            description: "5月 17日 (土) の有給申請",
            action: {
              label: "元に戻す",
              onClick: () => toast.success("申請を再送信しました"),
            },
          })
        }
      >
        action つきで表示
      </Button>
    </div>
  ),
};

export const Custom_Duration: Story = {
  name: "Custom duration — stays 6 seconds",
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="secondary"
        onClick={() =>
          toast("レポートのエクスポートが完了しました", {
            description: "ダウンロードリンクは 24 時間有効です。",
            duration: 6000,
          })
        }
      >
        6 秒間表示
      </Button>
    </div>
  ),
};
