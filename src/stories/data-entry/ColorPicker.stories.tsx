import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ColorPicker } from "../../components/data-entry/ColorPicker";
import { Flex } from "../../components/layout";

/**
 * data-entry/ColorPicker — decorative
 * color-selection trigger + popover panel.
 *
 * Vocabulary per cardinal rule 23 §B:
 *   `value` / `defaultValue` / `onValueChange` (Radix-style)
 *   `size` ("small" | "default" | "large")
 *   `open` / `defaultOpen` / `onOpenChange` (popover)
 *   `presets`, `showAlpha`, `disabled`
 */

const meta: Meta<typeof ColorPicker> = {
  title: "Data Entry/ColorPicker",
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("trigger renders", async () => {
      const trigger = canvas.getByRole("button");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("click opens the picker popover", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
      await expect(within(portal).getByRole("dialog")).toBeInTheDocument();
    });
  },
};

export const WithPresets: Story = {
  render: () => (
    <ColorPicker defaultValue="#3b82f6" presets={BRAND_PRESETS} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("clicking a preset updates the trigger hex label", async () => {
      const trigger = canvas.getByRole("button", { name: /Choose color/i });
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByRole("listbox", { name: /Preset colors/i })).toBeInTheDocument();
      });
      const greenPreset = within(portal).getByRole("option", { name: /#10b981/i });
      await userEvent.click(greenPreset);
      await waitFor(() => {
        expect(trigger).toHaveTextContent("#10b981");
      });
    });
  },
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

// ─── ThemePalette · 4 brand colors side by side ─────────────────

export const ThemePalette: Story = {
  name: "Theme palette · primary + accent + success + danger",
  render: () => (
    <Flex gap="middle" align="center">
      <Flex vertical gap="small" align="center">
        <ColorPicker defaultValue="#3b82f6" presets={BRAND_PRESETS} />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          Primary
        </span>
      </Flex>
      <Flex vertical gap="small" align="center">
        <ColorPicker defaultValue="#10b981" presets={BRAND_PRESETS} />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          Accent
        </span>
      </Flex>
      <Flex vertical gap="small" align="center">
        <ColorPicker defaultValue="#22c55e" presets={BRAND_PRESETS} />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          Success
        </span>
      </Flex>
      <Flex vertical gap="small" align="center">
        <ColorPicker defaultValue="#ef4444" presets={BRAND_PRESETS} />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          Danger
        </span>
      </Flex>
    </Flex>
  ),
};

// ─── ChartSeries · assign color per data series ─────────────────

const CHART_PRESETS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

export const ChartSeries: Story = {
  name: "Chart series · color per dataset",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      {[
        ["売上 (¥)", "#3b82f6"],
        ["利益率 (%)", "#10b981"],
        ["返品数", "#f59e0b"],
        ["新規顧客", "#ec4899"],
      ].map(([label, color]) => (
        <Flex key={label as string} align="center" justify="space-between">
          <span style={{ fontSize: "var(--text-sm)" }}>{label}</span>
          <ColorPicker defaultValue={color as string} presets={CHART_PRESETS} size="small" />
        </Flex>
      ))}
    </Flex>
  ),
};

// ─── WithAlpha · RGBA picker ────────────────────────────────────

export const WithAlpha: Story = {
  name: "With alpha · RGBA picker",
  render: () => (
    <Flex vertical gap="small" align="start">
      <ColorPicker defaultValue="#3b82f680" showAlpha />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        透明度スライダーが追加されます
      </span>
    </Flex>
  ),
};
