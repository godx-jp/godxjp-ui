import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../components/data-entry/Select";
import { Flex } from "../../components/layout";

/**
 * data-entry/Select — Radix-backed dropdown.
 *
 * Compositional API: Radix Select with `<SelectTrigger>` styled as
 * `.input` + `.select-trigger`, content styled as `.select-content`,
 * items as `.select-item`. Stories below render the documented variants.
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
**Select** — Radix-backed dropdown field. Compositional API:

\`\`\`tsx
<Select defaultValue="tokyo">
  <SelectTrigger>
    <SelectValue placeholder="拠点を選択" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="tokyo">東京</SelectItem>
  </SelectContent>
</Select>
\`\`\`

Trigger reuses \`.input\` + \`.select-trigger\` so the three input
sizes (\`.input-size-small\` / default / \`.input-size-large\`)
work via \`className\`. \`SelectGroup\` + \`SelectLabel\` +
\`SelectSeparator\` for grouped option lists.
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
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="部署を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>本社</SelectLabel>
            <SelectItem value="engineering">エンジニアリング</SelectItem>
            <SelectItem value="design">デザイン</SelectItem>
            <SelectItem value="product">プロダクト</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>コーポレート</SelectLabel>
            <SelectItem value="hr">人事</SelectItem>
            <SelectItem value="finance">経理</SelectItem>
            <SelectItem value="legal">法務</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
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
      <Select defaultValue="a">
        <SelectTrigger className="input-size-small">
          <SelectValue placeholder="small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">小サイズ A</SelectItem>
          <SelectItem value="b">小サイズ B</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="a">
        <SelectTrigger>
          <SelectValue placeholder="default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">既定 A</SelectItem>
          <SelectItem value="b">既定 B</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="a">
        <SelectTrigger className="input-size-large">
          <SelectValue placeholder="large" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">大サイズ A</SelectItem>
          <SelectItem value="b">大サイズ B</SelectItem>
        </SelectContent>
      </Select>
    </Flex>
  ),
};

// ─── Disabled — whole select + per-item ─────────────────────────

export const Disabled: Story = {
  name: "Disabled · trigger and per-item",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 260 }}>
      <Select defaultValue="tokyo" disabled>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tokyo">東京本社</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger>
          <SelectValue placeholder="権限の状態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">有効</SelectItem>
          <SelectItem value="suspended" disabled>
            停止中 (選択不可)
          </SelectItem>
          <SelectItem value="archived">アーカイブ</SelectItem>
        </SelectContent>
      </Select>
    </Flex>
  ),
};

// ─── WithPlaceholder — uncontrolled, no defaultValue ────────────

export const WithPlaceholder: Story = {
  name: "WithPlaceholder · uncontrolled empty state",
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="未選択 — 言語を選んでください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
