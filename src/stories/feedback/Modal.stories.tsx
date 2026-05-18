import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Dialog } from "../../components/feedback/Dialog";
import { Button } from "../../components/general/Button";
import { Input } from "../../components/data-entry/Input";
import { Field } from "../../components/data-entry/Field";
import { Space } from "../../components/layout";

/**
 * Feedback/Modal — modal surface built on the Dialog
 * primitive (Radix Dialog under the hood).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `open` / `defaultOpen` / `onOpenChange` — Radix-canonical
 *    overlay state. NEVER `visible` / `isOpen` / `shown`.
 *
 * Use Modal for tasks that take focus + need a confirm action.
 * For irreversible delete-style confirmations prefer Popconfirm.
 */

const meta: Meta = {
  title: "Feedback/Modal",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal surface — wraps the Dialog primitive. Use for focused " +
          "tasks; use Popconfirm for destructive confirmations and " +
          "Drawer (Sheet) for side-anchored editing.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Dialog
      trigger={<Button variant="primary">シフトを編集</Button>}
      title="シフトを編集"
      description="5月17日 (土) のシフト時間を変更します。"
      footer={
        <>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="primary">保存</Button>
        </>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Field label="開始時刻">
          <Input defaultValue="08:00" />
        </Field>
        <Field label="終了時刻">
          <Input defaultValue="17:00" />
        </Field>
      </Space>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("trigger opens dialog", async () => {
      const trigger = canvas.getByRole("button", { name: /シフトを編集/ });
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByRole("dialog")).toBeVisible();
      });
      // Title is a heading inside the dialog — disambiguates from the trigger button text.
      await expect(
        within(portal).getByRole("heading", { name: /シフトを編集/ }),
      ).toBeVisible();
    });

    await step("pressing Escape closes the dialog", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => {
        expect(within(portal).queryByRole("dialog")).toBeNull();
      });
    });
  },
};

export const Confirmation: Story = {
  name: "Confirmation — discard unsaved changes",
  render: () => (
    <Dialog
      trigger={<Button variant="destructive">閉じる</Button>}
      title="保存せずに閉じますか?"
      description="未保存の変更は失われます。続行するには「破棄」を選んでください。"
      footer={
        <>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="destructive">破棄</Button>
        </>
      }
    />
  ),
};
