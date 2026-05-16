import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { Separator } from "../components/primitives/Separator";
import { Flex, Space, Row, Col } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Axis of the divider line.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    decorative: {
      control: "boolean",
      description:
        "When true, the separator is hidden from assistive tech (purely visual). When false, Radix emits `role='separator'` so screen readers announce the break.",
      table: { defaultValue: { summary: "true" } },
    },
    className: {
      control: false,
      description: "Layout-only className glue (margins / spans).",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
**Separator** — horizontal or vertical divider, backed by Radix UI Separator.

The primitive maps to the canonical \`.divider\` styling in
\`tokens.css\` (1 px border, theme-aware color). The vertical
variant inlines \`width: 1px; height: 100%; background: var(--border)\`
since flex / inline-flex contexts need an explicit width to render.

| Prop | Type | Notes |
|---|---|---|
| \`orientation\` | \`"horizontal" \\| "vertical"\` | Default \`"horizontal"\`. |
| \`decorative\` | \`boolean\` | Default \`true\`. Set \`false\` when the divider conveys document structure (e.g. between major article sections) so AT announces it. |

**Accessibility (WCAG 2.1 AA).** Decorative mode renders
\`aria-orientation\` only; semantic mode adds \`role="separator"\`.
Don't use a separator where a heading / landmark would communicate
the structure better.

**When NOT to use a separator.** Inside a \`<Card>\` the card's
internal padding + \`actions\` slot already adds a footer divider for
you. Reach for \`<Separator>\` when composing your own surface (a
floating panel, a custom dialog body) where no parent owns the
divider.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Separator>;

// ─────────────────────────────────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: { orientation: "horizontal", decorative: true },
  render: (args) => (
    <div style={{ width: 360 }}>
      <p style={{ margin: 0 }}>Section above</p>
      <Separator {...args} style={args.orientation === "vertical" ? { height: 24, display: "inline-block", margin: "0 8px" } : { margin: "12px 0" }} />
      <p style={{ margin: 0 }}>Section below</p>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Horizontal
// ─────────────────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  name: "Default — horizontal",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 360 }}>
      <p style={{ margin: "0 0 8px" }}>2026-05-15 — Released forge-service shell alignment</p>
      <Separator />
      <p style={{ margin: "8px 0 0" }}>2026-05-14 — Merged me-service Phase Z overview</p>
    </div>
  ),
};

export const HorizontalThickness: Story = {
  name: "Variants — horizontal thickness (token override)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Thickness is owned by the token CSS class (1 px default). For an emphasis variant, override the inline `borderTopWidth` — but treat that as a one-off, not a per-screen pattern.",
      },
    },
  },
  render: () => (
    <Flex vertical gap="middle" style={{ width: 360 }}>
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>1 px (default)</p>
        <Separator />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>2 px (emphasis)</p>
        <Separator style={{ borderTopWidth: 2 }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>Dashed (custom)</p>
        <Separator style={{ borderTopStyle: "dashed" }} />
      </div>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Vertical
// ─────────────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  name: "Default — vertical",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex align="center" gap="middle" style={{ height: 32 }}>
      <span>Tokyo</span>
      <Separator orientation="vertical" />
      <span>Asia/Tokyo</span>
      <Separator orientation="vertical" />
      <span>JPY</span>
      <Separator orientation="vertical" />
      <span>ja-JP</span>
    </Flex>
  ),
};

export const VerticalBetweenButtons: Story = {
  name: "Variants — vertical between buttons",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex align="center" gap="small" style={{ height: 32 }}>
      <Button size="sm" variant="ghost">Bold</Button>
      <Button size="sm" variant="ghost">Italic</Button>
      <Separator orientation="vertical" style={{ height: 20 }} />
      <Button size="sm" variant="ghost">Left</Button>
      <Button size="sm" variant="ghost">Center</Button>
      <Button size="sm" variant="ghost">Right</Button>
      <Separator orientation="vertical" style={{ height: 20 }} />
      <Button size="sm" variant="ghost">Link</Button>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// With label in the middle (composed)
// ─────────────────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: "Variants — label in the middle (composed)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The primitive doesn't ship a label slot — compose one with `<Flex align='center' gap='small'>` plus two separators on either side of a muted label.",
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <Flex align="center" gap="small">
        <Separator style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>or sign in with</span>
        <Separator style={{ flex: 1 }} />
      </Flex>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Decorative vs semantic
// ─────────────────────────────────────────────────────────────────────────

export const Semantic: Story = {
  name: "Variants — semantic (decorative={false})",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "When the divider marks a meaningful structural boundary (a new article section, a major topic shift), pass `decorative={false}` so Radix emits `role='separator'` and assistive tech announces the break.",
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <h3 style={{ margin: "0 0 8px" }}>Section 1 — Introduction</h3>
      <p style={{ margin: "0 0 16px" }}>Background on the godx platform.</p>
      <Separator decorative={false} />
      <h3 style={{ margin: "16px 0 8px" }}>Section 2 — Architecture</h3>
      <p style={{ margin: 0 }}>Hexagonal layout, service catalog, plan-driven workflow.</p>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Horizontal" size="small">
          <p style={{ margin: "0 0 8px" }}>Above</p>
          <Separator />
          <p style={{ margin: "8px 0 0" }}>Below</p>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Vertical" size="small">
          <Flex align="center" gap="middle" style={{ height: 32 }}>
            <span>A</span>
            <Separator orientation="vertical" />
            <span>B</span>
            <Separator orientation="vertical" />
            <span>C</span>
          </Flex>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Thickness override" size="small">
          <Separator style={{ borderTopWidth: 2 }} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="With label" size="small">
          <Flex align="center" gap="small">
            <Separator style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>or</span>
            <Separator style={{ flex: 1 }} />
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic composition — Card footer with primary/secondary actions
// ─────────────────────────────────────────────────────────────────────────

export const CardFooterDivider: Story = {
  name: "Composition — Card footer with action buttons",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Card
        title="Confirm release"
        subtitle="Release godx-admin@v1.42.0 to dev"
      >
        <Flex vertical gap="middle">
          <p style={{ margin: 0 }}>
            This will tag <code>v1.42.0</code>, build the godxjp-ui pin, and deploy to dev.
          </p>
          <Space size="middle" split={<Separator orientation="vertical" />} align="center">
            <Space size="small" align="center"><CalendarDays size={13} /> 2026-05-15 09:30 JST</Space>
            <Space size="small" align="center"><MapPin size={13} /> tokyo</Space>
            <Space size="small" align="center"><ShieldCheck size={13} /> Audit on</Space>
          </Space>
          <Tag color="warning">Plan #38 V15 smoke required before promote</Tag>
        </Flex>
        <Separator style={{ margin: "16px 0 12px" }} />
        <Flex justify="end" gap="small">
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" variant="secondary">Save draft</Button>
          <Button size="sm" variant="primary">Release to dev</Button>
        </Flex>
      </Card>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Toolbar composition (vertical separators between groups)
// ─────────────────────────────────────────────────────────────────────────

export const ToolbarGroups: Story = {
  name: "Composition — toolbar with vertical separators",
  parameters: { controls: { disable: true } },
  render: () => (
    <Card variant="filled" size="small">
      <Flex align="center" gap="small" style={{ height: 36 }}>
        <Space size="small">
          <Button size="sm" variant="ghost">Undo</Button>
          <Button size="sm" variant="ghost">Redo</Button>
        </Space>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Space size="small">
          <Button size="sm" variant="ghost">Bold</Button>
          <Button size="sm" variant="ghost">Italic</Button>
          <Button size="sm" variant="ghost">Underline</Button>
        </Space>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Space size="small">
          <Button size="sm" variant="ghost">Bullet list</Button>
          <Button size="sm" variant="ghost">Numbered list</Button>
        </Space>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Button size="sm" variant="ghost">Link</Button>
      </Flex>
    </Card>
  ),
};
