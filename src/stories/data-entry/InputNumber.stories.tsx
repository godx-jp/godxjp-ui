import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { InputNumber } from "../../components/data-entry/InputNumber";
import { Flex } from "../../components/layout";

/**
 * data-entry/InputNumber — numeric input atom.
 *
 * Cardinal rules honoured:
 *   §14 — native `<input type="text" inputMode="decimal">` (no Radix
 *          needed; HTML `type="number"` has well-known quirks around
 *          locale, formatter, scroll).
 *   §21 — all four axes (theme/accent/density/font-size) flow through
 *          the inherited `.input` class.
 *   §22 — every literal token-pinned through `.input-number-wrap` +
 *          `.input-number-step` rules in `30-input.css`.
 *   §23 — vocabulary: `value` / `defaultValue` / `onValueChange`
 *          (Radix-style), `size`, `status`. NOT Ant's
 *          `controls` / `formatter` / `parser`; a single optional
 *          `format` callback handles display, optional `parse`
 *          handles inverse.
 *   §25 — stories are docs; tweaking via primitive only.
 */

const meta: Meta<typeof InputNumber> = {
  title: "Data Entry/InputNumber",
  component: InputNumber,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**InputNumber** — numeric input with optional ± stepper buttons and
optional \`format\` / \`parse\` display callbacks.

Vocabulary per cardinal rule 23 §B:
- \`value\` / \`defaultValue\` / \`onValueChange\` (Radix-style)
- \`size\`: \`"small" | "default" | "large"\` (shared with Input)
- \`status\`: \`"default" | "success" | "warning" | "error"\`

Step buttons fire on \`ArrowUp\` / \`ArrowDown\` for keyboard parity.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InputNumber>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={3} placeholder="数量" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("input renders with default value 3", async () => {
      const input = canvas.getByDisplayValue("3") as HTMLInputElement;
      await expect(input).toBeInTheDocument();
    });

    await step("ArrowUp increments the value", async () => {
      const input = canvas.getByDisplayValue("3") as HTMLInputElement;
      await userEvent.click(input);
      await userEvent.keyboard("{ArrowUp}");
      await waitFor(() => {
        expect(input.value).toBe("4");
      });
    });
  },
};

// ─── WithFormat — ¥ + 桁区切り ──────────────────────────────────

export const WithFormat: Story = {
  name: "WithFormat · ¥ + commas",
  render: function WithFormat() {
    const [value, setValue] = useState<number | null>(2900);
    return (
      <Flex vertical gap="small" style={{ maxWidth: 220 }}>
        <InputNumber
          value={value ?? undefined}
          onValueChange={setValue}
          step={100}
          min={0}
          format={(n) => `¥${n.toLocaleString("ja-JP")}`}
          parse={(t) => {
            const cleaned = t.replace(/[¥,\s]/g, "");
            if (!cleaned) return null;
            const n = Number(cleaned);
            return Number.isNaN(n) ? null : n;
          }}
        />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          現在の値: {value ?? "(空)"}
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("formatter renders the ¥ + comma display value", async () => {
      const input = canvas.getByDisplayValue("¥2,900") as HTMLInputElement;
      await expect(input).toBeInTheDocument();
    });

    await step("ArrowUp steps by 100; blur re-applies the formatter", async () => {
      const input = canvas.getByDisplayValue("¥2,900") as HTMLInputElement;
      await userEvent.click(input);
      await userEvent.keyboard("{ArrowUp}");
      // While focused the raw numeric string shows; blurring reformats.
      await userEvent.tab();
      await waitFor(() => {
        expect(input.value).toBe("¥3,000");
      });
    });
  },
};

// ─── MinMax ─────────────────────────────────────────────────────

export const MinMax: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={5} min={0} max={10} step={1} />
      <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
        範囲: 0 〜 10
      </span>
    </Flex>
  ),
};

// ─── Decimal — precision=2 ──────────────────────────────────────

export const Decimal: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={3.14} step={0.01} precision={2} />
      <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
        小数点 2 桁まで
      </span>
    </Flex>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={42} disabled />
    </div>
  ),
};

// ─── Status — error ─────────────────────────────────────────────

export const Status_Error: Story = {
  name: "Status · error",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={-1} min={0} status="error" />
      <span style={{ fontSize: "var(--text-2xs)", color: "var(--destructive)" }}>
        0 以上を入力してください
      </span>
    </Flex>
  ),
};

// ─── NoStepper ──────────────────────────────────────────────────

export const NoStepper: Story = {
  render: () => (
    <div style={{ maxWidth: 200 }}>
      <InputNumber defaultValue={2024} showStepper={false} placeholder="年" />
    </div>
  ),
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <InputNumber size="small" defaultValue={1} />
      <InputNumber size="default" defaultValue={2} />
      <InputNumber size="large" defaultValue={3} />
    </Flex>
  ),
};
