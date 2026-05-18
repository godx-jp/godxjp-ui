import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Label } from "../../components/data-entry/Label";
import { Input } from "../../components/data-entry/Input";
import { Field } from "../../components/data-entry/Field";
import { Flex } from "../../components/layout";

/**
 * data-entry/Label — Radix-backed form-field label.
 *
 * Documented props (per `Label.tsx`):
 *   Re-exports Radix Label.Root props — `htmlFor`, standard HTML
 *   attributes. Maps to the `.label` style in tokens.css and gives
 *   click-to-focus for free.
 *
 * Per cardinal rule 25 stories show Label paired with an Input;
 * visual contract lives in `.label` + `.help` classes.
 */

const meta: Meta<typeof Label> = {
  title: "Data Entry/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Label** — Radix Label wrapper. Pair with \`Input\` via \`htmlFor\`
for click-to-focus. Compose with \`Field\` help when the
input needs a description, or use directly for a bare label + input
pair.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Label>;

// ─── Default — label + input pair ────────────────────────────────

export const Default: Story = {
  name: "Default · label + input",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label htmlFor="display-name">表示名</Label>
      <Input id="display-name" placeholder="田中 美咲" />
    </Flex>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clicking the label focuses the associated input", async () => {
      const label = canvas.getByText("表示名");
      const input = canvas.getByPlaceholderText("田中 美咲") as HTMLInputElement;
      await userEvent.click(label);
      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });
  },
};

// ─── Required — visible asterisk ─────────────────────────────────

export const Required: Story = {
  name: "Required · visible asterisk",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label htmlFor="email-required">
        メールアドレス{" "}
        <span aria-hidden style={{ color: "var(--destructive)" }}>
          *
        </span>
      </Label>
      <Input
        id="email-required"
        type="email"
        required
        placeholder="tanaka.misaki@example.com"
      />
    </Flex>
  ),
};

// ─── Disabled — paired with disabled input ───────────────────────

export const Disabled: Story = {
  name: "Disabled · paired with disabled input",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label htmlFor="employee-id" style={{ opacity: 0.5 }}>
        従業員番号
      </Label>
      <Input id="employee-id" disabled defaultValue="EMP-0024" />
    </Flex>
  ),
};

// ─── WithDescription — label + input + help text ─────────────────

export const WithDescription: Story = {
  name: "WithDescription · label + input + help line",
  render: () => (
    <Field style={{ maxWidth: 360 }} help="所属メンバーに公開されます。">
      <Label htmlFor="display-name-help">表示名</Label>
      <Input id="display-name-help" placeholder="田中 美咲" />
    </Field>
  ),
};
