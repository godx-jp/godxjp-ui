import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "../components/primitives/Spinner";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Flex, Row, Col, Space } from "../components/primitives/layout";

const meta: Meta<typeof Spinner> = {
  title: "Primitives/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Spinner** — 10 / 12 / 16 px circular spinner.

Mirrors the canonical inline spinner from
\`design-handoff/.../preview/comp-inputs.html:70-71\`:
\`border-top-color: var(--info)\` rotating at 0.8s linear infinite.

Use inline with help text (\`sm\`), in input suffix slots (\`md\`,
default), or paired with button copy (\`lg\`). Tones re-target the
rotating arc to one of the semantic role colors.

Respects \`prefers-reduced-motion\` — animation duration slows to 2s.
        `.trim(),
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: {
      control: "select",
      options: ["info", "muted", "primary", "success", "warning", "destructive"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = { args: { size: "md", tone: "info" } };

export const Sizes: Story = {
  name: "Sizes — sm / md / lg",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle" align="center">
      <Spinner size="sm" aria-label="Loading" />
      <Spinner size="md" aria-label="Loading" />
      <Spinner size="lg" aria-label="Loading" />
    </Space>
  ),
};

export const Tones: Story = {
  name: "Tones — every semantic role",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 12]} align="middle">
      {(
        [
          "info",
          "muted",
          "primary",
          "success",
          "warning",
          "destructive",
        ] as const
      ).map((tone) => (
        <Col key={tone} span={4}>
          <Flex align="center" gap={6}>
            <Spinner tone={tone} aria-label={tone} />
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {tone}
            </span>
          </Flex>
        </Col>
      ))}
    </Row>
  ),
};

export const InlineHelp: Story = {
  name: "Composition — inline with help text",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="help info">
      <Spinner size="sm" /> 重複を確認中…
    </div>
  ),
};

export const InsideInput: Story = {
  name: "Composition — inside input suffix slot",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 280 }}>
      <Input
        defaultValue="shibuya-honten"
        suffix={<Spinner aria-label="Validating" />}
      />
    </div>
  ),
};

export const InsideButton: Story = {
  name: "Composition — inside button copy",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle">
      <Button size="sm" disabled>
        <Spinner size="sm" tone="primary" /> Saving…
      </Button>
      <Button disabled>
        <Spinner size="md" tone="primary" /> Saving…
      </Button>
      <Button size="lg" disabled>
        <Spinner size="lg" tone="primary" /> Saving…
      </Button>
    </Space>
  ),
};
