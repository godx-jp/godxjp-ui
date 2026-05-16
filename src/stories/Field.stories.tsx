import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlertTriangle, HelpCircle, Info } from "lucide-react";
import { Field } from "../components/primitives/Field";
import { Input, Textarea } from "../components/primitives/Input";
import { Row, Col, Flex } from "../components/primitives/layout";

const meta: Meta<typeof Field> = {
  title: "Primitives/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Field / Field.Label / Field.Help / Field.Count / Field.RowHelp** —
the canonical label-plus-control vertical group from
\`design-handoff/.../preview/comp-inputs.html:45-62\`.

Compose explicitly:

\`\`\`tsx
<Field>
  <Field.Label required info={<Tooltip />}>従業員コード</Field.Label>
  <Input placeholder="EMP-0001" />
  <Field.Help>英数字 4–8 文字</Field.Help>
</Field>
\`\`\`

\`Field.Count\` flips tone:
- \`current >= 90 % * max\` → \`warn\` (amber)
- \`current > max\`         → \`over\` (destructive)

Tone props on \`Field.Help\` map to the canonical \`.help.err\` /
\`.help.warn\` / \`.help.info\` / \`.help.ok\` modifiers — pass either
\`tone="error"\` (verbose) or \`error\` (shortcut).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Basic: Story = {
  name: "Basic — label + input + help",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 360 }}>
      <Field>
        <Field.Label required>従業員コード</Field.Label>
        <Input placeholder="EMP-0001" defaultValue="EMP-0042" />
        <Field.Help>英数字 4–8 文字 · 例: EMP-0042</Field.Help>
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  name: "Variant — error",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 360 }}>
      <Field>
        <Field.Label required>会社メール</Field.Label>
        <Input
          status="error"
          defaultValue="m.tanaka@famgia"
          aria-invalid="true"
        />
        <Field.Help error icon={<AlertTriangle size={12} />}>
          ドメインが不正です — @famgia.co.jp で終わる必要があります
        </Field.Help>
      </Field>
    </div>
  ),
};

export const WithWarning: Story = {
  name: "Variant — warning (non-blocking)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 360 }}>
      <Field>
        <Field.Label required>時給</Field.Label>
        <Input
          status="warning"
          defaultValue="1,050"
          prefix="¥"
          suffix="/ 時"
        />
        <Field.Help warning icon={<AlertTriangle size={12} />}>
          東京都の最低時給 ¥1,113 を下回っています — 続行可能ですが要確認
        </Field.Help>
      </Field>
    </div>
  ),
};

export const WithInfo: Story = {
  name: "Variant — info help",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 360 }}>
      <Field>
        <Field.Label>対象期間</Field.Label>
        <Input type="month" defaultValue="2026-05" />
        <Field.Help info icon={<Info size={12} />}>
          2026年5月の勤怠を集計します (2026/04/26 – 2026/05/25)
        </Field.Help>
      </Field>
    </div>
  ),
};

export const WithCount: Story = {
  name: "Variant — with character count",
  parameters: { controls: { disable: true } },
  render: () => {
    const [v, setV] = useState(
      "体調不良のため、本日 15:00 に早退しました。明日は通常通り出勤予定です。",
    );
    return (
      <div style={{ width: 460 }}>
        <Field>
          <Field.Label optional>早退理由</Field.Label>
          <Textarea
            rows={3}
            value={v}
            onChange={(e) => setV(e.target.value)}
            maxLength={200}
          />
          <Field.RowHelp>
            <Field.Help>承認者 (店長) のみ閲覧可</Field.Help>
            <Field.Count current={v.length} max={200} />
          </Field.RowHelp>
        </Field>
      </div>
    );
  },
};

export const LabelExtras: Story = {
  name: "Label — required / optional / info / extra",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ width: 360 }}>
      <Field>
        <Field.Label required>名前</Field.Label>
        <Input placeholder="山田 太郎" />
      </Field>
      <Field>
        <Field.Label optional>ニックネーム</Field.Label>
        <Input placeholder="(任意)" />
      </Field>
      <Field>
        <Field.Label
          required
          info={
            <span title="残業手当・各種手当を含まない月額の基本給。賞与算定の基準となります。">
              <HelpCircle size={14} />
            </span>
          }
        >
          基本給
        </Field.Label>
        <Input prefix="¥" defaultValue="245,000" />
      </Field>
      <Field>
        <Field.Label
          required
          extra={<a href="#">お忘れですか?</a>}
        >
          パスワード
        </Field.Label>
        <Input type="password" defaultValue="••••••••" />
      </Field>
    </Flex>
  ),
};

export const Grid: Story = {
  name: "Composition — 2-column form grid",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 14]} style={{ width: 720 }}>
      <Col span={12}>
        <Field>
          <Field.Label required>従業員コード</Field.Label>
          <Input defaultValue="EMP-0042" />
          <Field.Help>英数字 4–8 文字</Field.Help>
        </Field>
      </Col>
      <Col span={12}>
        <Field>
          <Field.Label>携帯電話</Field.Label>
          <Input defaultValue="090-1234-5678" />
          <Field.Help success>SMS 認証済み · 2026/05/03 14:22</Field.Help>
        </Field>
      </Col>
      <Col span={12}>
        <Field>
          <Field.Label required>会社メール</Field.Label>
          <Input status="error" defaultValue="m.tanaka@famgia" />
          <Field.Help error>ドメインが不正です</Field.Help>
        </Field>
      </Col>
      <Col span={12}>
        <Field>
          <Field.Label optional>所属</Field.Label>
          <Input placeholder="渋谷店" />
        </Field>
      </Col>
    </Row>
  ),
};
