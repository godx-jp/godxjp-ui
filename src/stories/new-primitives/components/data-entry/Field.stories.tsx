import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Info } from "lucide-react";
import { Field } from "../../../../components/primitives/Field";
import { Input, Textarea } from "../../../../components/primitives/Input";
import { Flex } from "../../../../components/primitives/layout";

/**
 * new-primitives/components/data-entry/Field — label + control + help.
 *
 * Compositional primitive: `<Field>` is the vertical group container;
 * `Field.Label` / `Field.Help` / `Field.Count` / `Field.RowHelp` are
 * structural sub-atoms. Mirrors the canonical `.field` shape from the
 * dxs-kintai design canon.
 *
 * Cardinal rules honoured:
 *   §22 — visual contract lives in `.field` / `.help` / `.count` CSS.
 *   §23 — `required` / `optional` are boolean axes on Field.Label.
 *   §25 — story is docs; primitive is the UI.
 */

const meta: Meta<typeof Field> = {
  title: "new-primitives/Components/Data Entry/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Field** — label + control + help vertical group. Compositional API:

\`\`\`tsx
<Field>
  <Field.Label required>従業員コード</Field.Label>
  <Input placeholder="EMP-0001" />
  <Field.Help>英数字 4–8 文字</Field.Help>
</Field>
\`\`\`

\`Field.RowHelp\` lays help + count on one row. \`Field.Count\` shows
\`current / max\` with a built-in warn threshold at 90%.

Note (story author): the primitive doesn't ship a built-in horizontal
("label on the left, control on the right") layout — the "Horizontal"
story uses Flex composition rather than extending the primitive.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Field>;

// ─── Default — label + input + help ─────────────────────────────

export const Default: Story = {
  name: "Default · label + input + help",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field>
        <Field.Label>従業員コード</Field.Label>
        <Input placeholder="EMP-0001" />
        <Field.Help>英数字 4–8 文字で入力してください。</Field.Help>
      </Field>
    </div>
  ),
};

// ─── Required — asterisk + info icon ────────────────────────────

export const Required: Story = {
  name: "Required · asterisk + info hint",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field>
        <Field.Label
          required
          info={<Info size={12} aria-hidden />}
        >
          メールアドレス
        </Field.Label>
        <Input type="email" placeholder="name@famgia.com" />
        <Field.Help>業務連絡で使用するアドレスを入力。</Field.Help>
      </Field>
    </div>
  ),
};

// ─── WithError — error tone on help line ────────────────────────

export const WithError: Story = {
  name: "WithError · status=error + help tone",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field>
        <Field.Label required>パスワード</Field.Label>
        <Input
          type="password"
          status="error"
          defaultValue="weak"
        />
        <Field.Help error>
          8 文字以上、英数字+記号を含めてください。
        </Field.Help>
      </Field>
    </div>
  ),
};

// ─── WithCount — textarea + character count ─────────────────────

function CountDemo() {
  const [value, setValue] = useState(
    "承認時に表示するコメントを記入してください。",
  );
  return (
    <Field>
      <Field.Label optional>承認コメント</Field.Label>
      <Textarea
        rows={4}
        maxLength={200}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Field.RowHelp>
        <Field.Help>承認者のみ閲覧できます。</Field.Help>
        <Field.Count current={value.length} max={200} />
      </Field.RowHelp>
    </Field>
  );
}

export const WithCount: Story = {
  name: "WithCount · textarea + Field.Count",
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <CountDemo />
    </div>
  ),
};

// ─── Horizontal — label-left, control-right via Flex ────────────

export const Horizontal: Story = {
  name: "Horizontal · Flex row composition",
  parameters: {
    docs: {
      description: {
        story:
          "Field primitive does not expose a built-in `orientation` prop; horizontal layouts compose Flex + an explicit `<label>` next to the control. Documenting here rather than extending the primitive (cardinal rule 25).",
      },
    },
  },
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 480 }}>
      <Flex align="center" gap="middle">
        <label
          htmlFor="hz-name"
          style={{
            flex: "0 0 120px",
            fontSize: "var(--text-sm)",
            color: "var(--foreground)",
          }}
        >
          氏名
        </label>
        <Input
          id="hz-name"
          placeholder="山田 太郎"
          style={{ flex: 1 }}
        />
      </Flex>
      <Flex align="center" gap="middle">
        <label
          htmlFor="hz-dept"
          style={{
            flex: "0 0 120px",
            fontSize: "var(--text-sm)",
            color: "var(--foreground)",
          }}
        >
          所属部署
        </label>
        <Input
          id="hz-dept"
          placeholder="エンジニアリング"
          style={{ flex: 1 }}
        />
      </Flex>
    </Flex>
  ),
};
