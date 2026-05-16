import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Mail,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "../components/primitives/Button";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Button** — the canonical action atom for every godx surface.

The Ant-Design-shaped prop philosophy: \`variant\` and \`size\` props own the visual
contract; \`className\` is for layout glue only (margins, grid placement) and never
for re-skinning. Visual values come from \`.btn\` / \`.btn-{variant}\` / \`.btn-{size}\`
classes in \`tokens.css\` — change a token, every Button on every surface updates.

**Variants**

- \`primary\` — filled, brand-accent, default action ("Save", "Continue").
- \`secondary\` — bordered, neutral surface, side-by-side with primary.
- \`ghost\` — transparent until hover; toolbar / inline actions.
- \`danger\` — destructive accent; "Delete", "Revoke".

**Sizes** map onto density tokens: \`sm\` 28 px, \`md\` 32 px (default), \`lg\` 36 px.

**Accessibility (WCAG 2.1 AA)** — \`<button>\` semantics by default; \`asChild\` swaps to
a Radix Slot so the visual contract wraps a \`<Link>\` or arbitrary element without
nested-button violations. Focus ring uses the design system's \`--ring\` token
(3:1 contrast against every background). Disabled state sets \`aria-disabled\`
implicitly via the native \`disabled\` attribute.
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "danger"],
      description: "Visual style of the action.",
      table: { defaultValue: { summary: "primary" } },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Height + padding density.",
      table: { defaultValue: { summary: "md" } },
    },
    disabled: {
      control: "boolean",
      description: "Disable interactions; lowers opacity + removes focus ring.",
    },
    asChild: {
      control: "boolean",
      description: "Render via Radix Slot — wrap a Link / anchor without nesting.",
      table: { defaultValue: { summary: "false" } },
    },
    type: {
      control: "inline-radio",
      options: ["button", "submit", "reset"],
      description: "HTML button type (ignored when `asChild`).",
      table: { defaultValue: { summary: "button" } },
    },
    children: { control: "text", description: "Label / icon content." },
    onClick: { action: "click" },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    children: "Save",
    variant: "primary",
    size: "md",
    disabled: false,
  },
};

export const Primary: Story = { args: { children: "Save", variant: "primary" } };
export const Secondary: Story = { args: { children: "Cancel", variant: "secondary" } };
export const Ghost: Story = { args: { children: "More options", variant: "ghost" } };
export const Danger: Story = { args: { children: "Delete project", variant: "danger" } };

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      <Flex gap="small" align="center">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Flex>
      <Flex gap="small" align="center">
        <Button variant="primary" disabled>Primary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="ghost" disabled>Ghost</Button>
        <Button variant="danger" disabled>Danger</Button>
      </Flex>
    </Flex>
  ),
};

export const AllSizes: Story = {
  name: "Showcase — all sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      <Flex gap="small" align="center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Flex>
      <Flex gap="small" align="center">
        <Button size="sm" variant="secondary">Small</Button>
        <Button size="md" variant="secondary">Medium</Button>
        <Button size="lg" variant="secondary">Large</Button>
      </Flex>
      <Flex gap="small" align="center">
        <Button size="sm" variant="ghost">Small</Button>
        <Button size="md" variant="ghost">Medium</Button>
        <Button size="lg" variant="ghost">Large</Button>
      </Flex>
      <Flex gap="small" align="center">
        <Button size="sm" variant="danger">Small</Button>
        <Button size="md" variant="danger">Medium</Button>
        <Button size="lg" variant="danger">Large</Button>
      </Flex>
    </Flex>
  ),
};

export const WithLeadingIcon: Story = {
  name: "With icon — leading",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" wrap align="center">
      <Button variant="primary"><Save size={14} /> 保存する</Button>
      <Button variant="secondary"><Plus size={14} /> Add member</Button>
      <Button variant="ghost"><Settings size={14} /> Settings</Button>
      <Button variant="danger"><Trash2 size={14} /> Delete</Button>
    </Flex>
  ),
};

export const WithTrailingIcon: Story = {
  name: "With icon — trailing",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" wrap align="center">
      <Button variant="primary">Continue <ArrowRight size={14} /></Button>
      <Button variant="secondary">Next step <ChevronRight size={14} /></Button>
      <Button variant="ghost">Open inbox <Mail size={14} /></Button>
    </Flex>
  ),
};

export const IconOnly: Story = {
  name: "Icon-only (with aria-label)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" align="center">
      <Button variant="primary" aria-label="Save" size="sm"><Save size={14} /></Button>
      <Button variant="secondary" aria-label="Add" size="md"><Plus size={14} /></Button>
      <Button variant="ghost" aria-label="Settings" size="lg"><Settings size={16} /></Button>
      <Button variant="danger" aria-label="Delete" size="md"><Trash2 size={14} /></Button>
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" align="center">
      <Button variant="primary" disabled>Save</Button>
      <Button variant="secondary" disabled>Cancel</Button>
      <Button variant="ghost" disabled>More</Button>
      <Button variant="danger" disabled>Delete</Button>
    </Flex>
  ),
};

function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <Space size="middle" align="center">
      <Button
        variant="primary"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
        disabled={loading}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {loading ? "Uploading…" : "Upload file"}
      </Button>
      <Button variant="secondary" disabled>
        <Loader2 size={14} className="animate-spin" />
        Always loading
      </Button>
    </Space>
  );
}

export const Loading: Story = {
  name: "States — loading",
  parameters: { controls: { disable: true } },
  render: () => <LoadingButtonDemo />,
};

export const AsChildLink: Story = {
  name: "asChild — wraps anchor",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex gap="small" align="center">
      <Button asChild variant="primary">
        <a href="https://godx.jp" target="_blank" rel="noreferrer">
          Visit godx.jp <ArrowRight size={14} />
        </a>
      </Button>
      <Button asChild variant="ghost">
        <a href="#docs">Read the docs</a>
      </Button>
    </Flex>
  ),
};

export const ActionBar: Story = {
  name: "Composition — action bar",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex justify="space-between" align="center" gap="middle">
      <Button variant="ghost"><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back</Button>
      <Space size="middle">
        <Button variant="secondary">Save draft</Button>
        <Button variant="primary"><Check size={14} /> 公開する</Button>
      </Space>
    </Flex>
  ),
};

export const DestructiveConfirm: Story = {
  name: "Composition — destructive confirm",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 360 }}>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Delete project?</div>
        <div style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          このプロジェクトとすべての履歴が削除されます。元に戻せません。
        </div>
      </div>
      <Flex justify="end" gap="small">
        <Button variant="ghost" size="sm">キャンセル</Button>
        <Button variant="danger" size="sm"><Trash2 size={14} /> 削除する</Button>
      </Flex>
    </Flex>
  ),
};
