import type { Meta, StoryObj } from "@storybook/react";
import { Popconfirm } from "../../components/feedback/Popconfirm";
import { Button } from "../../components/general/Button";

/**
 * Feedback/Popconfirm — compact confirm-or-cancel
 * wrapper over `AlertDialog*`. Same accessibility model (modal,
 * focus trap, ARIA via Radix); a smaller API for the common case.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `open` / `defaultOpen` / `onOpenChange` — Radix-canonical
 *    overlay state. NEVER `visible` / `isOpen` / `shown`.
 *  - `confirmVariant` — `primary` (default) or `destructive`.
 *  - `children`       — the trigger element (rendered via `asChild`).
 */

const meta: Meta<typeof Popconfirm> = {
  title: "Feedback/Popconfirm",
  component: Popconfirm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Compact wrapper over AlertDialog for the common " +
          "confirm-or-cancel flow. Use for destructive or " +
          "irreversible actions where the user must opt-in twice.",
      },
    },
  },
  argTypes: {
    confirmVariant: {
      control: { type: "select" },
      options: ["primary", "destructive"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Popconfirm>;

export const Default: Story = {
  render: () => (
    <Popconfirm
      title="削除しますか?"
      description="このアイテムは復元できません。"
      confirmVariant="destructive"
      confirmLabel="削除"
    >
      <Button variant="destructive">削除</Button>
    </Popconfirm>
  ),
};

export const Simple: Story = {
  render: () => (
    <Popconfirm title="続行しますか?">
      <Button variant="primary">続行</Button>
    </Popconfirm>
  ),
};

export const Custom_Labels: Story = {
  name: "Custom labels — approve / go back",
  render: () => (
    <Popconfirm
      title="申請を承認しますか?"
      confirmLabel="承認"
      cancelLabel="戻る"
    >
      <Button variant="primary">承認</Button>
    </Popconfirm>
  ),
};
