import type { Meta, StoryObj } from "@storybook/react";
import { Flex } from "../../../../components/primitives/layout";
import { Card } from "../../../../components/primitives/Card";

/**
 * new-primitives/components/layout/Flex — flexbox container.
 *
 * Per cardinal rule 23 §B:
 *   vertical?: boolean        direction (false = horizontal, true = vertical)
 *   wrap?: …                  wrap mode
 *   gap?: FlexGap             "small" | "middle" | "large" | number
 *   justify?: FlexJustify     start / end / center / space-between / -around / -evenly
 *   align?: FlexAlign         start / end / center / stretch / baseline
 *   flex?: string | number    container flex value
 *
 * No size/variant/color — Flex is purely structural.
 */

const meta: Meta<typeof Flex> = {
  title: "new-primitives/Components/Layout/Flex",
  component: Flex,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Flex** — Ant-Design-shaped flexbox primitive. Props mirror the
Flex API: \`vertical\`, \`gap\`, \`justify\`, \`align\`, \`wrap\`,
\`flex\`. Tokens resolve via the shared FlexGap enum
(\`small / middle / large\` → \`--spacing-2 / -3 / -4\`).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Flex>;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      padding: "var(--spacing-2) var(--spacing-3)",
      background: "var(--secondary)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      fontFamily: "var(--font-mono)",
    }}
  >
    {label}
  </div>
);

export const Horizontal: Story = {
  render: () => (
    <Flex gap="middle">
      <Box label="A" /><Box label="B" /><Box label="C" />
    </Flex>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Flex vertical gap="middle">
      <Box label="A" /><Box label="B" /><Box label="C" />
    </Flex>
  ),
};

export const Gaps: Story = {
  name: "Gap axis (small / middle / large)",
  render: () => (
    <Flex vertical gap="large">
      {(["small", "middle", "large"] as const).map((g) => (
        <Card key={g} padding="tight" title={`gap="${g}"`}>
          <Flex gap={g}>
            <Box label="A" /><Box label="B" /><Box label="C" />
          </Flex>
        </Card>
      ))}
    </Flex>
  ),
};

export const Justify: Story = {
  name: "Justify axis",
  render: () => (
    <Flex vertical gap="middle">
      {(["start", "center", "end", "space-between", "space-around", "space-evenly"] as const).map((j) => (
        <Card key={j} padding="tight" title={`justify="${j}"`}>
          <Flex gap="small" justify={j} style={{ width: 480 }}>
            <Box label="A" /><Box label="B" /><Box label="C" />
          </Flex>
        </Card>
      ))}
    </Flex>
  ),
};

export const Align: Story = {
  name: "Align axis",
  render: () => (
    <Flex vertical gap="middle">
      {(["start", "center", "end", "stretch", "baseline"] as const).map((a) => (
        <Card key={a} padding="tight" title={`align="${a}"`}>
          <Flex gap="small" align={a} style={{ height: 60 }}>
            <Box label="tall" />
            <div style={{ ...{}, padding: "var(--spacing-4) var(--spacing-3)", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>taller</div>
            <Box label="short" />
          </Flex>
        </Card>
      ))}
    </Flex>
  ),
};

export const Wrap: Story = {
  render: () => (
    <Flex wrap gap="small" style={{ width: 320 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Box key={i} label={`item-${i + 1}`} />
      ))}
    </Flex>
  ),
};
