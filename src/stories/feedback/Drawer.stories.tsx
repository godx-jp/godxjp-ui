import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Sheet as Drawer } from "../../components/feedback/Sheet";
import { Button } from "../../components/general/Button";
import { Input } from "../../components/data-entry/Input";
import { Space } from "../../components/layout";
import { Menu } from "../../components/navigation/Menu";

/**
 * Feedback/Drawer — side-anchored panel built on the
 * Sheet primitive (Radix Dialog under the hood, positioned via
 * `data-side`).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `open` / `defaultOpen` / `onOpenChange` — Radix-canonical
 *    overlay state. NEVER `visible` / `isOpen` / `shown`.
 *  - `side` — `left` / `right` / `top` / `bottom`.
 */

const meta: Meta = {
  title: "Feedback/Drawer",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Side-anchored drawer. Aliases the Sheet primitive; same " +
          "accessibility model (focus trap, ESC close, ARIA via Radix).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Right: Story = {
  render: () => (
    <Drawer
      trigger={<Button variant="primary">右から開く</Button>}
      side="right"
      title="シフトを編集"
      description="5月17日 (土) のシフトを変更します。"
      footer={
        <>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="primary">保存</Button>
        </>
      }
    >
        <Space direction="vertical" size="default" style={{ width: "100%" }}>
          <label className="field">
            <span>開始時刻</span>
            <Input defaultValue="08:00" />
          </label>
          <label className="field">
            <span>終了時刻</span>
            <Input defaultValue="17:00" />
          </label>
        </Space>
    </Drawer>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("clicking trigger opens drawer", async () => {
      const trigger = canvas.getByRole("button", { name: /右から開く/ });
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByRole("dialog")).toBeVisible();
      });
      await expect(within(portal).getByText("シフトを編集")).toBeVisible();
    });
  },
};

export const Left: Story = {
  render: () => (
    <Drawer
      trigger={<Button variant="primary">左から開く</Button>}
      side="left"
      title="メニュー"
      description="主要セクションへのナビゲーション。"
    >
        <Menu
          items={[
            {
              type: "group",
              label: "ナビゲーション",
              items: [
                { value: "dashboard", label: "ダッシュボード" },
                { value: "attendance", label: "勤怠" },
                { value: "shift", label: "シフト" },
                { value: "requests", label: "申請" },
              ],
            },
          ]}
        />
    </Drawer>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Drawer
      trigger={<Button variant="primary">下から開く</Button>}
      side="bottom"
      title="クイックアクション"
      description="よく使う操作にすぐアクセスできます。"
    >
        <Space size="small" wrap>
          <Button variant="secondary">打刻する</Button>
          <Button variant="secondary">シフトを見る</Button>
          <Button variant="secondary">申請を作成</Button>
          <Button variant="secondary">承認待ち</Button>
        </Space>
    </Drawer>
  ),
};
