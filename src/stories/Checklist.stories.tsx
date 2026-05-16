import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Clock } from "lucide-react";
import { Checklist } from "../components/primitives/Checklist";
import { Input } from "../components/primitives/Input";
import { Field } from "../components/primitives/Field";
import { Flex } from "../components/primitives/layout";

const meta: Meta<typeof Checklist> = {
  title: "Primitives/Checklist",
  component: Checklist,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Checklist** — vertical list of pass/fail rules with per-row icon.

Mirrors the canonical \`.checklist\` pattern at
\`design-handoff/.../preview/comp-inputs.html:196-200\` (password
hints). Each row carries a leading icon (Check or X by default) and a
label, with semantic tone:

- \`ok: true\`  → \`--success\`
- \`ok: false\` → \`--destructive\`
- \`ok: null\`  → \`--muted-foreground\` (neutral / pending)

Pair with \`<InputPassword>\` to render password-rule meters, or use
generically for validation summaries.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Checklist>;

export const PasswordRules: Story = {
  name: "Composition — password strength meter",
  parameters: { controls: { disable: true } },
  render: () => {
    const [v, setV] = useState("Pa5");
    return (
      <div style={{ width: 360 }}>
        <Field>
          <Field.Label required>パスワード</Field.Label>
          <Input
            type="password"
            value={v}
            onChange={(e) => setV(e.target.value)}
          />
          <Checklist
            items={[
              { ok: v.length >= 8, label: "8 文字以上" },
              {
                ok: /[a-z]/.test(v) && /[A-Z]/.test(v),
                label: "大文字・小文字を含む",
              },
              {
                ok: /[^a-zA-Z0-9]/.test(v),
                label: "記号 (! @ # …) を 1 つ以上",
              },
            ]}
          />
        </Field>
      </div>
    );
  },
};

export const Default: Story = {
  name: "Default — static rules",
  parameters: { controls: { disable: true } },
  render: () => (
    <Checklist
      items={[
        { ok: true, label: "8 文字以上" },
        { ok: true, label: "大文字・小文字を含む" },
        { ok: false, label: "記号 (! @ # …) を 1 つ以上" },
      ]}
    />
  ),
};

export const PendingState: Story = {
  name: "Variant — with pending (neutral) rows",
  parameters: { controls: { disable: true } },
  render: () => (
    <Checklist
      items={[
        { ok: true, label: "Plan approved" },
        { ok: null, label: "Awaiting review", icon: <Clock size={11} /> },
        { ok: null, label: "Budget allocated", icon: <Clock size={11} /> },
        { ok: false, label: "Budget exceeded" },
      ]}
    />
  ),
};

export const WithHints: Story = {
  name: "Variant — with trailing hints",
  parameters: { controls: { disable: true } },
  render: () => (
    <Checklist
      items={[
        { ok: true, label: "Plan approved", hint: "2026-05-12" },
        { ok: true, label: "Reviewed", hint: "yuki" },
        { ok: false, label: "Tests passing", hint: "3 failures" },
      ]}
    />
  ),
};

export const AllStates: Story = {
  name: "Showcase — all states",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="large">
      <Checklist
        items={[
          { ok: true, label: "ok / success" },
          { ok: false, label: "bad / destructive" },
          { ok: null, label: "pending / neutral" },
        ]}
      />
    </Flex>
  ),
};
