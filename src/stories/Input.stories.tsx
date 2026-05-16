import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Hash,
  Lock,
  Mail,
  Search,
  User,
  X,
} from "lucide-react";
import { Input, Textarea } from "../components/primitives/Input";
import { Button } from "../components/primitives/Button";
import { Label } from "../components/primitives/Label";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Input** — text field with Ant-Design-shaped slot props.

Visual contract lives entirely in props: \`size\` controls density, \`status\` controls
validation feedback, and the slot props (\`prefix\`, \`suffix\`, \`addonBefore\`, \`addonAfter\`)
let you compose icons, units, or scheme prefixes without breaking the focus ring. The
\`className\` prop is reserved for layout glue, never for re-skinning — every visual
value comes from the \`.input\` / \`.input-shell\` / \`.input-status-*\` classes in
\`tokens.css\`.

When \`prefix\` or \`suffix\` is supplied the input is wrapped in an \`.input-shell\` that
owns the focus ring, so the icon visually sits inside the field while the native
\`<input>\` still receives focus. \`addonBefore\` / \`addonAfter\` form a connected group
(e.g. \`https:// \` + domain).

**Textarea** is exported from the same module and shares \`size\` + \`status\` plus
\`resize\`, \`autoSize\`, \`showCount\`, and \`maxLength\` (Ant-Design parity).

**Accessibility (WCAG 2.1 AA)** — native semantics; pair with \`<Label htmlFor>\` for
screen readers; \`status="error"\` consumers must also wire \`aria-invalid\` +
\`aria-describedby\` to the help/error text node. Focus ring contrast ≥ 3:1.
        `.trim(),
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["small", "default", "large"],
      description: "Density: 28 px / 32 px / 36 px.",
      table: { defaultValue: { summary: "default" } },
    },
    status: {
      control: "inline-radio",
      options: ["default", "error", "warning"],
      description: "Validation feedback border + ring color.",
      table: { defaultValue: { summary: "default" } },
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "url", "number", "tel", "search"],
      table: { defaultValue: { summary: "text" } },
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
    prefix: { control: false, description: "Leading slot (icon / unit)." },
    suffix: { control: false, description: "Trailing slot (icon / counter)." },
    addonBefore: { control: false, description: "Leading addon (scheme, unit)." },
    addonAfter: { control: false, description: "Trailing addon (TLD, unit)." },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  args: {
    placeholder: "メールアドレス",
    size: "default",
    status: "default",
    disabled: false,
    readOnly: false,
  },
};

export const Default: Story = {
  args: { placeholder: "Type something…" },
};

export const Sizes: Story = {
  name: "Sizes — small / default / large",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input size="small" placeholder="Small (28 px)" />
      <Input size="default" placeholder="Default (32 px)" />
      <Input size="large" placeholder="Large (36 px)" />
    </Flex>
  ),
};

export const StatusStates: Story = {
  name: "Status — default / error / warning",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 360 }}>
      <Flex vertical gap="small">
        <Label htmlFor="email-default">メールアドレス</Label>
        <Input id="email-default" defaultValue="yuki@godx.jp" prefix={<Mail size={14} />} />
      </Flex>
      <Flex vertical gap="small">
        <Label htmlFor="email-error">メールアドレス</Label>
        <Input
          id="email-error"
          status="error"
          defaultValue="invalid@"
          prefix={<Mail size={14} />}
          suffix={<X size={14} />}
          aria-invalid
          aria-describedby="email-error-msg"
        />
        <span id="email-error-msg" style={{ color: "var(--destructive)", fontSize: 12 }}>
          Email address is incomplete.
        </span>
      </Flex>
      <Flex vertical gap="small">
        <Label htmlFor="email-warn">メールアドレス</Label>
        <Input
          id="email-warn"
          status="warning"
          defaultValue="yuki@example.test"
          prefix={<Mail size={14} />}
          suffix={<AlertTriangle size={14} />}
        />
        <span style={{ color: "var(--warning, #b45309)", fontSize: 12 }}>
          .test domains never receive mail.
        </span>
      </Flex>
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input disabled placeholder="Disabled empty" />
      <Input disabled defaultValue="Read-only system value" />
      <Input disabled prefix={<Lock size={14} />} defaultValue="Locked by admin" />
    </Flex>
  ),
};

export const ReadOnly: Story = {
  name: "States — readonly",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input readOnly defaultValue="user_01HXY8P9..." prefix={<Hash size={14} />} />
      <Input readOnly defaultValue="yuki@godx.jp" prefix={<Mail size={14} />} />
    </Flex>
  ),
};

export const WithPrefix: Story = {
  name: "Slots — prefix icons",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input prefix={<Search size={14} />} placeholder="Search projects…" />
      <Input prefix={<Mail size={14} />} type="email" placeholder="you@example.com" />
      <Input prefix={<User size={14} />} placeholder="Yuki Tanaka" />
      <Input prefix={<Globe size={14} />} type="url" placeholder="https://godx.jp" />
    </Flex>
  ),
};

export const WithSuffix: Story = {
  name: "Slots — suffix icons",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input suffix={<Search size={14} />} placeholder="Search…" />
      <Input suffix={<CreditCard size={14} />} placeholder="4242 4242 4242 4242" />
      <Input suffix={<CheckCircle2 size={14} />} defaultValue="Available username" />
    </Flex>
  ),
};

function PasswordToggleDemo() {
  const [shown, setShown] = useState(false);
  return (
    <Input
      type={shown ? "text" : "password"}
      placeholder="パスワード"
      prefix={<Lock size={14} />}
      suffix={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          style={{ background: "none", border: 0, cursor: "pointer", color: "inherit", display: "flex" }}
        >
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      }
    />
  );
}

export const PasswordToggle: Story = {
  name: "Slots — password show/hide",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <PasswordToggleDemo />
    </div>
  ),
};

export const WithAddons: Story = {
  name: "Slots — addonBefore / addonAfter",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 360 }}>
      <Input addonBefore="https://" placeholder="example.com" />
      <Input addonAfter=".godx.jp" placeholder="forge" />
      <Input addonBefore="¥" addonAfter="/mo" type="number" defaultValue="9000" />
      <Input addonBefore="@" placeholder="username" />
      <Input addonBefore="https://" addonAfter=".jp" placeholder="my-site" />
    </Flex>
  ),
};

export const Types: Story = {
  name: "HTML types",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input type="email" placeholder="you@example.com" prefix={<Mail size={14} />} />
      <Input type="url" placeholder="https://godx.jp" prefix={<Globe size={14} />} />
      <Input type="number" placeholder="42" />
      <Input type="tel" placeholder="+81 90 1234 5678" />
      <Input type="search" placeholder="Search docs…" prefix={<Search size={14} />} />
      <Input type="password" placeholder="••••••••" prefix={<Lock size={14} />} />
    </Flex>
  ),
};

export const FilterBar: Story = {
  name: "Composition — filter bar",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" align="center" wrap style={{ maxWidth: 640 }}>
      <Input
        prefix={<Search size={14} />}
        placeholder="プロジェクトを検索…"
        style={{ flex: 1, minWidth: 240 }}
      />
      <Button variant="secondary">Filters</Button>
      <Button variant="primary">+ 新規</Button>
    </Flex>
  ),
};

export const LoginForm: Story = {
  name: "Composition — login form",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex
      vertical
      gap="middle"
      style={{
        maxWidth: 360,
        padding: "var(--spacing-6)",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>ログイン</h3>
      <Flex vertical gap="small">
        <Label htmlFor="login-email">メールアドレス</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          prefix={<Mail size={14} />}
          placeholder="you@example.com"
        />
      </Flex>
      <Flex vertical gap="small">
        <Label htmlFor="login-pw">パスワード</Label>
        <Input
          id="login-pw"
          type="password"
          autoComplete="current-password"
          prefix={<Lock size={14} />}
          placeholder="••••••••"
        />
      </Flex>
      <Space size="middle" align="center">
        <Button variant="primary" type="submit">サインイン</Button>
        <Button variant="ghost" size="sm">パスワードを忘れた</Button>
      </Space>
    </Flex>
  ),
};

// ----- Textarea -----

type TextareaStory = StoryObj<typeof Textarea>;

export const TextareaDefault: TextareaStory = {
  name: "Textarea — default",
  parameters: { controls: { disable: true } },
  render: () => (
    <Textarea
      rows={4}
      placeholder="自己紹介を書いてください…"
      style={{ width: 360 }}
    />
  ),
};

export const TextareaSizes: TextareaStory = {
  name: "Textarea — sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea size="small" rows={3} placeholder="Small density" />
      <Textarea size="default" rows={3} placeholder="Default density" />
      <Textarea size="large" rows={3} placeholder="Large density" />
    </Flex>
  ),
};

export const TextareaResize: TextareaStory = {
  name: "Textarea — resize variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} resize="none" placeholder="resize=none (default)" />
      <Textarea rows={3} resize="vertical" placeholder="resize=vertical" />
      <Textarea rows={3} resize="horizontal" placeholder="resize=horizontal" />
      <Textarea rows={3} resize="both" placeholder="resize=both" />
    </Flex>
  ),
};

function TextareaAutoSizeDemo() {
  const [v, setV] = useState("Type more lines…\nThe textarea grows up to 6 rows then scrolls.");
  return (
    <Textarea
      autoSize={{ minRows: 2, maxRows: 6 }}
      value={v}
      onChange={(e) => setV(e.target.value)}
      style={{ width: 360 }}
    />
  );
}

export const TextareaAutoSize: TextareaStory = {
  name: "Textarea — autoSize",
  parameters: { controls: { disable: true } },
  render: () => <TextareaAutoSizeDemo />,
};

function TextareaShowCountDemo() {
  const [v, setV] = useState("A short bio in under 140 characters.");
  return (
    <Textarea
      rows={4}
      maxLength={140}
      showCount
      value={v}
      onChange={(e) => setV(e.target.value)}
      style={{ width: 360 }}
    />
  );
}

export const TextareaShowCount: TextareaStory = {
  name: "Textarea — showCount + maxLength",
  parameters: { controls: { disable: true } },
  render: () => <TextareaShowCountDemo />,
};

export const TextareaStatus: TextareaStory = {
  name: "Textarea — status states",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} status="default" defaultValue="Default" />
      <Textarea rows={3} status="warning" defaultValue="近すぎる単語" />
      <Textarea rows={3} status="error" defaultValue="Required field is empty" aria-invalid />
    </Flex>
  ),
};

export const TextareaDisabled: TextareaStory = {
  name: "Textarea — disabled / readonly",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Textarea rows={3} disabled defaultValue="Disabled state — cannot edit." />
      <Textarea rows={3} readOnly defaultValue="Read-only — selectable but immutable." />
    </Flex>
  ),
};
