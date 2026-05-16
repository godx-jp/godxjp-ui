import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "../components/primitives/Checkbox";
import { Label } from "../components/primitives/Label";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Checkbox** — tri-state boolean (checked / unchecked / indeterminate), Radix-backed.

Wraps \`@radix-ui/react-checkbox\` so keyboard navigation, focus ring, and
\`role="checkbox"\` semantics are handled for free. Visual contract lives in
\`.checkbox-root\` / \`.checkbox-indicator\` in \`tokens.css\`. \`className\` is layout glue,
never re-skinning.

**State** is controlled via \`checked\` (\`true | false | "indeterminate"\`) or
uncontrolled via \`defaultChecked\`. Indeterminate is intentional UI for "some of N
children selected" (use sparingly — pair with a parent group).

**Accessibility (WCAG 2.1 AA)** — Radix handles \`role="checkbox"\`,
\`aria-checked={mixed|true|false}\`, focus management, and keyboard
(\`Space\` to toggle). Always pair with a \`<Label htmlFor>\` or wrap the Checkbox in
the Label for click-to-toggle and screen-reader naming. Disabled state is
\`aria-disabled\` via the native \`disabled\` attribute.
        `.trim(),
      },
    },
  },
  argTypes: {
    checked: {
      control: "inline-radio",
      options: [false, true, "indeterminate"],
      description: "Controlled checked state.",
    },
    defaultChecked: { control: "boolean", description: "Uncontrolled initial state." },
    disabled: { control: "boolean" },
    required: { control: "boolean", description: "Form-validation required flag." },
    id: { control: "text" },
    name: { control: "text" },
    value: { control: "text" },
    onCheckedChange: { action: "checkedChange" },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: { id: "playground", defaultChecked: false, disabled: false },
  render: (args) => (
    <Space size="middle" align="center">
      <Checkbox {...args} />
      <Label htmlFor={args.id ?? "playground"}>Click to toggle</Label>
    </Space>
  ),
};

export const Unchecked: Story = { args: { id: "unchecked" } };
export const Checked: Story = { args: { id: "checked", defaultChecked: true } };
export const Indeterminate: Story = {
  args: { id: "indeterminate", checked: "indeterminate" },
};

export const States: Story = {
  name: "Showcase — all states",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <Space size="middle" align="center">
        <Checkbox id="s-uncheck" />
        <Label htmlFor="s-uncheck">Unchecked</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="s-check" defaultChecked />
        <Label htmlFor="s-check">Checked</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="s-indet" checked="indeterminate" />
        <Label htmlFor="s-indet">Indeterminate</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="s-disabled-u" disabled />
        <Label htmlFor="s-disabled-u">Disabled unchecked</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="s-disabled-c" disabled defaultChecked />
        <Label htmlFor="s-disabled-c">Disabled checked</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="s-disabled-i" disabled checked="indeterminate" />
        <Label htmlFor="s-disabled-i">Disabled indeterminate</Label>
      </Space>
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small">
      <Space size="middle" align="center">
        <Checkbox id="d1" disabled />
        <Label htmlFor="d1">Disabled unchecked</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="d2" disabled defaultChecked />
        <Label htmlFor="d2">Disabled checked</Label>
      </Space>
    </Flex>
  ),
};

interface Permission {
  id: string;
  label: string;
}
const PERMS: Permission[] = [
  { id: "p-read", label: "プロジェクトを閲覧" },
  { id: "p-write", label: "プロジェクトを編集" },
  { id: "p-deploy", label: "本番環境にデプロイ" },
  { id: "p-billing", label: "請求情報を管理" },
];

function ParentChildGroupDemo() {
  const [picked, setPicked] = useState<Record<string, boolean>>({
    "p-read": true,
    "p-write": true,
    "p-deploy": false,
    "p-billing": false,
  });
  const total = PERMS.length;
  const checkedCount = Object.values(picked).filter(Boolean).length;
  const parentState: boolean | "indeterminate" =
    checkedCount === 0 ? false : checkedCount === total ? true : "indeterminate";

  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Space size="middle" align="center">
        <Checkbox
          id="parent"
          checked={parentState}
          onCheckedChange={(v) => {
            const next = v === true;
            setPicked(Object.fromEntries(PERMS.map((p) => [p.id, next])));
          }}
        />
        <Label htmlFor="parent">
          <strong>すべての権限</strong>
          <span style={{ color: "var(--muted-foreground)", marginLeft: 6 }}>
            ({checkedCount}/{total})
          </span>
        </Label>
      </Space>
      <Flex vertical gap="small" style={{ paddingLeft: 28 }}>
        {PERMS.map((p) => (
          <Space key={p.id} size="middle" align="center">
            <Checkbox
              id={p.id}
              checked={picked[p.id] ?? false}
              onCheckedChange={(v) =>
                setPicked((prev) => ({ ...prev, [p.id]: v === true }))
              }
            />
            <Label htmlFor={p.id}>{p.label}</Label>
          </Space>
        ))}
      </Flex>
    </Flex>
  );
}

export const ParentChildGroup: Story = {
  name: "Composition — parent/child group (indeterminate)",
  parameters: { controls: { disable: true } },
  render: () => <ParentChildGroupDemo />,
};

export const TermsAccept: Story = {
  name: "Composition — terms acceptance",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 360 }}>
      <Space size="middle" align="center">
        <Checkbox id="accept-tos" />
        <Label htmlFor="accept-tos">
          <a href="#tos" style={{ color: "var(--primary)" }}>利用規約</a>
          {" "}と{" "}
          <a href="#privacy" style={{ color: "var(--primary)" }}>プライバシーポリシー</a>
          {" "}に同意します
        </Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="accept-marketing" />
        <Label htmlFor="accept-marketing">製品アップデートを受け取る</Label>
      </Space>
    </Flex>
  ),
};

export const InForm: Story = {
  name: "Composition — settings panel",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex
      vertical
      gap="middle"
      style={{
        maxWidth: 360,
        padding: "var(--spacing-6)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <h4 style={{ margin: 0, fontWeight: 600 }}>通知設定</h4>
      <Space size="middle" align="center">
        <Checkbox id="n-mention" defaultChecked />
        <Label htmlFor="n-mention">メンションされたとき</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="n-assign" defaultChecked />
        <Label htmlFor="n-assign">タスクが割り当てられたとき</Label>
      </Space>
      <Space size="middle" align="center">
        <Checkbox id="n-deploy" />
        <Label htmlFor="n-deploy">デプロイが完了したとき</Label>
      </Space>
    </Flex>
  ),
};
