import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Select } from "../../components/data-entry/Select";
import { Flex } from "../../components/layout";

/**
 * data-entry/Select — Radix-backed dropdown.
 *
 * Data API: pass `options` and let the primitive render trigger,
 * content, grouped labels, separators, and items.
 *
 * Cardinal rules honoured:
 *   §3  — Radix Select for keyboard / portal / ARIA.
 *   §22 — every literal token-pinned via `.input` / `.select-*` classes.
 *   §23 — vocabulary: trigger size inherits `.input-size-{small|large}`
 *          via className; `value` / `defaultValue` / `onValueChange`
 *          per Radix-canonical names.
 *   §25 — story is docs; primitive is the UI.
 */

const meta: Meta<typeof Select> = {
  title: "Data Entry/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Select** — Radix-backed dropdown field. Single-component API:

\`\`\`tsx
<Select
  defaultValue="tokyo"
  placeholder="拠点を選択"
  options={[{ value: "tokyo", label: "東京" }]}
/>
\`\`\`

Trigger reuses \`.input\` + \`.select-trigger\` so the three input
sizes (\`.input-size-small\` / default / \`.input-size-large\`)
work via \`triggerClassName\`. Grouped options render labels and
separators from the same \`options\` prop.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Select>;

// ─── Default — data-driven via `options` prop ───────────────────

export const Default: Story = {
  name: "Default · options prop (Ant / MUI canonical)",
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Select
        defaultValue="tokyo"
        placeholder="拠点を選択"
        options={[
          { value: "tokyo", label: "東京本社" },
          { value: "osaka", label: "大阪支社" },
          { value: "nagoya", label: "名古屋支社" },
          { value: "fukuoka", label: "福岡支社" },
          { value: "sapporo", label: "札幌支社" },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("trigger renders with default value", async () => {
      const trigger = canvas.getByRole("combobox");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("clicking trigger opens listbox with options", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
      const options = within(portal).getAllByRole("option");
      await expect(options.length).toBeGreaterThanOrEqual(5);
    });
  },
};

// ─── Grouped — labels + separator ───────────────────────────────

export const Grouped: Story = {
  name: "Grouped · labels + separator",
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <Select
        placeholder="部署を選択"
        options={[
          {
            label: "本社",
            options: [
              { value: "engineering", label: "エンジニアリング" },
              { value: "design", label: "デザイン" },
              { value: "product", label: "プロダクト" },
            ],
          },
          {
            label: "コーポレート",
            options: [
              { value: "hr", label: "人事" },
              { value: "finance", label: "経理" },
              { value: "legal", label: "法務" },
            ],
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("selecting an item closes the listbox", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
      const option = within(portal).getByRole("option", { name: /人事/ });
      await userEvent.click(option);
      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "false");
      });
    });
  },
};

// ─── Sizes — small / default / large ────────────────────────────

export const Sizes: Story = {
  name: "Sizes · small / default / large",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 240 }}>
      <Select
        defaultValue="a"
        placeholder="small"
        triggerClassName="input-size-small"
        options={[
          { value: "a", label: "小サイズ A" },
          { value: "b", label: "小サイズ B" },
        ]}
      />
      <Select
        defaultValue="a"
        placeholder="default"
        options={[
          { value: "a", label: "既定 A" },
          { value: "b", label: "既定 B" },
        ]}
      />
      <Select
        defaultValue="a"
        placeholder="large"
        triggerClassName="input-size-large"
        options={[
          { value: "a", label: "大サイズ A" },
          { value: "b", label: "大サイズ B" },
        ]}
      />
    </Flex>
  ),
};

// ─── Disabled — whole select + per-item ─────────────────────────

export const Disabled: Story = {
  name: "Disabled · trigger and per-item",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 260 }}>
      <Select
        defaultValue="tokyo"
        disabled
        options={[{ value: "tokyo", label: "東京本社" }]}
      />

      <Select
        placeholder="権限の状態"
        options={[
          { value: "active", label: "有効" },
          { value: "suspended", label: "停止中 (選択不可)", disabled: true },
          { value: "archived", label: "アーカイブ" },
        ]}
      />
    </Flex>
  ),
};

// ─── WithPlaceholder — uncontrolled, no defaultValue ────────────

export const WithPlaceholder: Story = {
  name: "WithPlaceholder · uncontrolled empty state",
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Select
        placeholder="未選択 — 言語を選んでください"
        options={[
          { value: "ja", label: "日本語" },
          { value: "en", label: "English" },
          { value: "ko", label: "한국어" },
          { value: "zh", label: "中文" },
        ]}
      />
    </div>
  ),
};
