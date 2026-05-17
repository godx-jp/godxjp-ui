import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../../components/feedback/toaster";
import { Button } from "../../components/general/Button";
import { Space } from "../../components/layout";

/**
 * Feedback/Message — ephemeral inline feedback toasts.
 *
 * Backed by the `toast` engine from sonner; default appearance is
 * a compact text-only toast (`Notification` shows the rich variant
 * with description + action).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - No `visible` / `isOpen` / `shown`. Use `toast()` /
 *    `toast.success(…)` / `toast.error(…)` / `toast.warning(…)` /
 *    `toast.promise(…)`.
 */

const meta: Meta = {
  title: "Feedback/Message",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Compact ephemeral feedback. Use for short status confirmations " +
          "(saved / synced / submitted). For richer body + action, see " +
          "Notification. For blocking confirms, see Popconfirm.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Info: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button variant="primary" onClick={() => toast("通知を確認しました")}>
        info を表示
      </Button>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="primary"
        onClick={() => toast.success("変更を保存しました")}
      >
        success を表示
      </Button>
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="secondary"
        onClick={() => toast.warning("再起動が必要です")}
      >
        warning を表示
      </Button>
    </div>
  ),
};

export const Error_: Story = {
  name: "Error",
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="destructive"
        onClick={() => toast.error("接続できませんでした")}
      >
        error を表示
      </Button>
    </div>
  ),
};

export const Loading_Promise: Story = {
  name: "Promise — loading → success / error",
  render: () => (
    <div>
      <Toaster />
      <Space size="small">
        <Button
          variant="primary"
          onClick={() => {
            const p = new Promise<void>((resolve) =>
              setTimeout(() => resolve(), 1500),
            );
            toast.promise(p, {
              loading: "保存中…",
              success: "保存しました",
              error: "保存に失敗しました",
            });
          }}
        >
          成功 (1.5s)
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const p = new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error("network")), 1500),
            );
            toast.promise(p, {
              loading: "保存中…",
              success: "保存しました",
              error: "保存に失敗しました",
            });
          }}
        >
          失敗 (1.5s)
        </Button>
      </Space>
    </div>
  ),
};
