import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Sheet as Drawer,
  SheetContent as DrawerContent,
  SheetDescription as DrawerDescription,
  SheetFooter as DrawerFooter,
  SheetHeader as DrawerHeader,
  SheetTitle as DrawerTitle,
  SheetTrigger as DrawerTrigger,
} from "../../components/feedback/Sheet";
import { Button } from "../../components/general/Button";
import { Input } from "../../components/data-entry/Input";
import { Field, FieldLabel } from "../../components/data-entry/Field";
import { Space } from "../../components/layout";
import { Menu, MenuItem, MenuGroup } from "../../components/navigation/Menu";

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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="primary">右から開く</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>シフトを編集</DrawerTitle>
          <DrawerDescription>
            5月17日 (土) のシフトを変更します。
          </DrawerDescription>
        </DrawerHeader>
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
        <DrawerFooter>
          <Button variant="ghost">キャンセル</Button>
          <Button variant="primary">保存</Button>
        </DrawerFooter>
      </DrawerContent>
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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="primary">左から開く</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>メニュー</DrawerTitle>
          <DrawerDescription>
            主要セクションへのナビゲーション。
          </DrawerDescription>
        </DrawerHeader>
        <Menu>
          <MenuGroup label="ナビゲーション">
            <MenuItem value="dashboard">ダッシュボード</MenuItem>
            <MenuItem value="attendance">勤怠</MenuItem>
            <MenuItem value="shift">シフト</MenuItem>
            <MenuItem value="requests">申請</MenuItem>
          </MenuGroup>
        </Menu>
      </DrawerContent>
    </Drawer>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="primary">下から開く</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom">
        <DrawerHeader>
          <DrawerTitle>クイックアクション</DrawerTitle>
          <DrawerDescription>
            よく使う操作にすぐアクセスできます。
          </DrawerDescription>
        </DrawerHeader>
        <Space size="small" wrap>
          <Button variant="secondary">打刻する</Button>
          <Button variant="secondary">シフトを見る</Button>
          <Button variant="secondary">申請を作成</Button>
          <Button variant="secondary">承認待ち</Button>
        </Space>
      </DrawerContent>
    </Drawer>
  ),
};
