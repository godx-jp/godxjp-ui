import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Popover } from "../../components/data-display/Popover";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

const meta: Meta<typeof Popover> = {
  title: "Data Display/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover trigger={<Button variant="secondary">詳細</Button>}>
      <div style={{ maxWidth: 220 }}>
        勤怠申請の詳細条件をここに表示します。
      </div>
    </Popover>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;
    await step("clicking trigger opens popover", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "詳細" }));
      await waitFor(() => {
        expect(within(portal).getByText(/勤怠申請/)).toBeVisible();
      });
    });
  },
};

export const FormContent: Story = {
  render: () => (
    <Popover trigger={<Button variant="outline">条件</Button>} align="start">
      <Flex vertical gap="small" style={{ minWidth: 240 }}>
        <strong>詳細条件</strong>
        <label className="field">
          <span>期間</span>
          <input className="input" defaultValue="2026/05/01–05/31" />
        </label>
        <Button size="small" variant="primary">適用</Button>
      </Flex>
    </Popover>
  ),
};

export const Placements: Story = {
  render: () => (
    <Flex gap="middle" wrap style={{ padding: 80 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover
          key={side}
          side={side}
          trigger={<Button variant="outline">{side}</Button>}
        >
          {side} に表示
        </Popover>
      ))}
    </Flex>
  ),
};
