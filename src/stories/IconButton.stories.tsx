import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Bell,
  Check,
  Download,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { IconButton } from "../components/primitives/IconButton";
import { Flex, Row, Col, Space } from "../components/primitives/layout";

const meta: Meta<typeof IconButton> = {
  title: "Primitives/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**IconButton** — square icon-only button.

Mirrors the canonical \`.icon-btn\` family at
\`design-handoff/.../preview/comp-pageheader.html:14-17\`. 32 × 32 by
default (radius-sm hairline border + background fill).

Variants:
- \`secondary\` (default) — hairline border + neutral background.
- \`ghost\` — borderless transparent; hovers reveal an accent fill.
- \`primary\` — filled brand color, for the rare focal icon action.

Sizes \`sm\` (28) / \`default\` (32) / \`lg\` (36) map to the same
density tokens used elsewhere.

\`aria-label\` is required — icon-only controls must carry a name.
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["secondary", "ghost", "primary"],
    },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "secondary",
    size: "default",
    disabled: false,
    "aria-label": "Settings",
  },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  render: (args) => (
    <IconButton {...args}>
      <Settings size={14} />
    </IconButton>
  ),
};

export const Variants: Story = {
  name: "Variants — secondary / ghost / primary",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle">
      <IconButton aria-label="Settings" variant="secondary">
        <Settings size={14} />
      </IconButton>
      <IconButton aria-label="Settings" variant="ghost">
        <Settings size={14} />
      </IconButton>
      <IconButton aria-label="Settings" variant="primary">
        <Settings size={14} />
      </IconButton>
    </Space>
  ),
};

export const Sizes: Story = {
  name: "Sizes — sm / default / lg",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle" align="center">
      <IconButton aria-label="Search" size="sm">
        <Search size={12} />
      </IconButton>
      <IconButton aria-label="Search">
        <Search size={14} />
      </IconButton>
      <IconButton aria-label="Search" size="lg">
        <Search size={16} />
      </IconButton>
    </Space>
  ),
};

export const VariantsBySize: Story = {
  name: "Showcase — variants × sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Row key={size} gutter={[12, 12]} align="middle">
          <Col span={4}>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              size={size}
            </span>
          </Col>
          <Col span={20}>
            <Space size="small">
              <IconButton size={size} variant="secondary" aria-label="Filter">
                <Filter size={size === "lg" ? 16 : 14} />
              </IconButton>
              <IconButton size={size} variant="ghost" aria-label="Filter">
                <Filter size={size === "lg" ? 16 : 14} />
              </IconButton>
              <IconButton size={size} variant="primary" aria-label="Save">
                <Check size={size === "lg" ? 16 : 14} />
              </IconButton>
            </Space>
          </Col>
        </Row>
      ))}
    </Flex>
  ),
};

export const ToolbarRow: Story = {
  name: "Composition — toolbar row",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="small">
      <IconButton variant="ghost" aria-label="戻る">
        <ArrowLeft size={14} />
      </IconButton>
      <IconButton aria-label="フィルタ">
        <Filter size={14} />
      </IconButton>
      <IconButton aria-label="エクスポート">
        <Download size={14} />
      </IconButton>
      <IconButton aria-label="編集">
        <Pencil size={14} />
      </IconButton>
      <IconButton aria-label="お気に入り">
        <Star size={14} />
      </IconButton>
      <IconButton aria-label="削除">
        <Trash2 size={14} />
      </IconButton>
      <IconButton aria-label="その他">
        <MoreHorizontal size={14} />
      </IconButton>
    </Space>
  ),
};

export const Disabled: Story = {
  name: "State — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle">
      <IconButton aria-label="Disabled" disabled>
        <Plus size={14} />
      </IconButton>
      <IconButton aria-label="Disabled" variant="ghost" disabled>
        <Plus size={14} />
      </IconButton>
      <IconButton aria-label="Disabled" variant="primary" disabled>
        <Plus size={14} />
      </IconButton>
    </Space>
  ),
};

export const WithIndicator: Story = {
  name: "Composition — with notification indicator",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle">
      <span style={{ position: "relative", display: "inline-block" }}>
        <IconButton variant="ghost" aria-label="Notifications">
          <Bell size={14} />
        </IconButton>
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--attention)",
          }}
        />
      </span>
      <IconButton variant="ghost" aria-label="Close">
        <X size={14} />
      </IconButton>
    </Space>
  ),
};
