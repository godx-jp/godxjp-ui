import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/primitives/Dialog";
import { Button } from "../../../../components/primitives/Button";
import { Input } from "../../../../components/primitives/Input";
import { Field, FieldLabel } from "../../../../components/primitives/Field";
import { Space } from "../../../../components/primitives/layout";

/**
 * Components/Feedback/Modal — modal surface built on the Dialog
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
  title: "new-primitives/Components/Feedback/Modal",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">シフトを編集</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>シフトを編集</DialogTitle>
          <DialogDescription>
            5月17日 (土) のシフト時間を変更します。
          </DialogDescription>
        </DialogHeader>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Field>
            <FieldLabel>開始時刻</FieldLabel>
            <Input defaultValue="08:00" />
          </Field>
          <Field>
            <FieldLabel>終了時刻</FieldLabel>
            <Input defaultValue="17:00" />
          </Field>
        </Space>
        <DialogFooter>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="primary">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  name: "Confirmation — discard unsaved changes",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">閉じる</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存せずに閉じますか?</DialogTitle>
          <DialogDescription>
            未保存の変更は失われます。続行するには「破棄」を選んでください。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="destructive">破棄</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
