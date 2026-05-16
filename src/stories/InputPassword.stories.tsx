import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InputPassword } from "../components/primitives/InputPassword";
import { Checklist } from "../components/primitives/Checklist";
import { Field } from "../components/primitives/Field";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof InputPassword> = {
  title: "Primitives/Input — Password",
  component: InputPassword,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**InputPassword** — Input subtype with show / hide toggle.

Mirrors the canonical password reveal at
\`design-handoff/.../preview/comp-inputs.html:184-201\` — a
\`.pass-toggle\` button absolute-positioned at \`right:6px\` flips the
underlying \`<input>\` type between \`password\` and \`text\`.

Wraps \`<Input>\` so every base prop pass-through works (\`size\`,
\`status\`, \`prefix\`, \`addonBefore\`, etc.). The strength meter slot
accepts any node — pair with \`<Checklist>\` to render password-rule
hints.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InputPassword>;

export const Default: Story = {
  name: "Default — hidden by default",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <InputPassword placeholder="••••••••••" defaultValue="hunter2hunter2" />
    </div>
  ),
};

export const Revealed: Story = {
  name: "State — revealed",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <InputPassword defaultRevealed defaultValue="MyP@ssw0rd!" />
    </div>
  ),
};

export const WithStrengthMeter: Story = {
  name: "Composition — with strength meter",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("Pa55");
    const ok8 = value.length >= 8;
    const okCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
    const okSym = /[^a-zA-Z0-9]/.test(value);
    return (
      <div style={{ width: 360 }}>
        <Field>
          <Field.Label required>パスワード</Field.Label>
          <InputPassword
            value={value}
            onChange={(e) => setValue(e.target.value)}
            strengthMeter={
              <Checklist
                items={[
                  { ok: ok8, label: "8 文字以上" },
                  { ok: okCase, label: "大文字・小文字を含む" },
                  { ok: okSym, label: "記号 (! @ # …) を 1 つ以上" },
                ]}
              />
            }
          />
        </Field>
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "Sizes — small / default / large",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ width: 320 }}>
      <InputPassword size="small" defaultValue="••••" />
      <InputPassword defaultValue="••••••••" />
      <InputPassword size="large" defaultValue="••••••••••" />
    </Flex>
  ),
};

export const ErrorState: Story = {
  name: "State — error",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <Field>
        <Field.Label required>パスワード</Field.Label>
        <InputPassword status="error" defaultValue="abc" />
        <Field.Help error>8 文字以上である必要があります</Field.Help>
      </Field>
    </div>
  ),
};

export const ControlledReveal: Story = {
  name: "Behavior — controlled reveal",
  parameters: { controls: { disable: true } },
  render: () => {
    const [revealed, setRevealed] = useState(false);
    return (
      <Space size="middle" align="center">
        <InputPassword
          revealed={revealed}
          onRevealChange={setRevealed}
          defaultValue="ControlledPassword"
        />
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          revealed={String(revealed)}
        </span>
      </Space>
    );
  },
};
