import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Radio, RadioGroup } from "../../components/data-entry/Radio";
import { Flex } from "../../components/layout";

/**
 * data-entry/Radio — single-select group.
 *
 * Cardinal rules:
 *   §3  — Radix @radix-ui/react-radio-group.
 *   §23 — `value` / `defaultValue` / `onValueChange`; never `activeKey`.
 *          `size` ∈ small | default | large.
 *   §25 — story is documentation; primitive owns the UI.
 */

const meta: Meta<typeof RadioGroup> = {
  title: "Data Entry/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup
      defaultValue="weekly"
      options={[
        { value: "daily", label: "毎日" },
        { value: "weekly", label: "毎週" },
        { value: "monthly", label: "毎月" },
      ]}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("default selection reflects defaultValue", async () => {
      const weekly = canvas.getByRole("radio", { name: /毎週/ });
      await expect(weekly).toHaveAttribute("aria-checked", "true");
    });

    await step("clicking a different option moves selection", async () => {
      const monthly = canvas.getByRole("radio", { name: /毎月/ });
      await userEvent.click(monthly);
      await waitFor(() => {
        expect(monthly).toHaveAttribute("aria-checked", "true");
      });
      const weekly = canvas.getByRole("radio", { name: /毎週/ });
      await expect(weekly).toHaveAttribute("aria-checked", "false");
    });
  },
};

export const Vertical: Story = {
  render: () => (
    <RadioGroup
      orientation="vertical"
      defaultValue="standard"
      options={[
        { value: "free", label: "Free — ¥0 / 月" },
        { value: "standard", label: "Standard — ¥980 / 月" },
        { value: "pro", label: "Pro — ¥2,900 / 月" },
      ]}
    />
  ),
};

export const WithSizes: Story = {
  name: "With sizes",
  render: () => (
    <Flex vertical gap="default">
      <RadioGroup
        size="small"
        defaultValue="a"
        options={[
          { value: "a", label: "small A" },
          { value: "b", label: "small B" },
        ]}
      />
      <RadioGroup
        size="default"
        defaultValue="a"
        options={[
          { value: "a", label: "default A" },
          { value: "b", label: "default B" },
        ]}
      />
      <RadioGroup
        size="large"
        defaultValue="a"
        options={[
          { value: "a", label: "large A" },
          { value: "b", label: "large B" },
        ]}
      />
    </Flex>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Flex vertical gap="small">
      <RadioGroup
        disabled
        defaultValue="b"
        options={[
          { value: "a", label: "選択肢 A" },
          { value: "b", label: "選択肢 B(選択中)" },
          { value: "c", label: "選択肢 C" },
        ]}
      />
      <RadioGroup defaultValue="a">
        <Radio value="a">通常項目</Radio>
        <Radio value="b" disabled>無効な項目</Radio>
        <Radio value="c">通常項目</Radio>
      </RadioGroup>
    </Flex>
  ),
};

export const Controlled: Story = {
  render: function Controlled() {
    const [value, setValue] = useState("standard");
    return (
      <Flex vertical gap="small">
        <RadioGroup
          value={value}
          onValueChange={setValue}
          options={[
            { value: "free", label: "Free" },
            { value: "standard", label: "Standard" },
            { value: "pro", label: "Pro" },
          ]}
        />
        <code className="mono" style={{ fontSize: "var(--text-xs)" }}>{value}</code>
      </Flex>
    );
  },
};
