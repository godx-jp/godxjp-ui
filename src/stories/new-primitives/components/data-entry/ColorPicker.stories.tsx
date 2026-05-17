import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from "../../../../components/data-entry/ColorPicker";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-entry/ColorPicker — decorative
 * color-selection trigger + popover panel.
 *
 * Vocabulary per cardinal rule 23 §B:
 *   `value` / `defaultValue` / `onValueChange` (Radix-style)
 *   `size` ("small" | "default" | "large")
 *   `open` / `defaultOpen` / `onOpenChange` (popover)
 *   `presets`, `showAlpha`, `disabled`
 */

const meta: Meta<typeof ColorPicker> = {
  title: "new-primitives/Components/Data Entry/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof ColorPicker>;

const BRAND_PRESETS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

export const Default: Story = {
  render: () => <ColorPicker defaultValue="#3b82f6" />,
};

export const WithPresets: Story = {
  render: () => (
    <ColorPicker defaultValue="#3b82f6" presets={BRAND_PRESETS} />
  ),
};

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ alignItems: "flex-start" }}>
      <ColorPicker size="small" defaultValue="#3b82f6" />
      <ColorPicker size="default" defaultValue="#10b981" />
      <ColorPicker size="large" defaultValue="#f59e0b" />
    </Flex>
  ),
};

export const Disabled: Story = {
  render: () => <ColorPicker defaultValue="#64748b" disabled />,
};
