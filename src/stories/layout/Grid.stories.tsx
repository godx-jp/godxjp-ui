import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "../../components/layout";
import { Card } from "../../components/data-display/Card";
import { Flex } from "../../components/layout";

/**
 * layout/Grid — CSS Grid wrapper.
 *
 * Concept: fixed-column or template grid. Different from Row/Col
 * (12-col responsive flex) — use Grid for fixed N-col layouts or
 * template strings.
 *
 * Per cardinal rule 23 §B:
 *   cols?: number | string    N equal columns OR grid-template-columns string
 *   rows?: number | string    same shape for rows (optional)
 *   gap?: GridGap             "small" | "middle" | "large" | number
 *   columnGap / rowGap        axis-specific gap overrides
 */

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Grid** — thin wrapper around CSS Grid. Use for fixed N-col or
template-driven layouts. Use \`<Row>/<Col>\` instead when you
want Ant-Design 24-col responsive breakpoints.

\`gap\` vocabulary matches Flex (\`GridGap = FlexGap\` shape per
cardinal rule 23 §B prop reuse).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ label }: { label: string }) => (
  <div
    style={{
      padding: "var(--spacing-3)",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      fontFamily: "var(--font-mono)",
      textAlign: "center",
    }}
  >
    {label}
  </div>
);

export const EqualCols: Story = {
  name: "Equal columns (cols={3})",
  render: () => (
    <Grid cols={3} gap="middle">
      <Cell label="1" />
      <Cell label="2" />
      <Cell label="3" />
      <Cell label="4" />
      <Cell label="5" />
      <Cell label="6" />
    </Grid>
  ),
};

export const Template: Story = {
  name: "Template (cols=\"200px 1fr 80px\")",
  render: () => (
    <Grid cols="200px 1fr 80px" gap="middle">
      <Cell label="200px" />
      <Cell label="1fr" />
      <Cell label="80px" />
      <Cell label="200px" />
      <Cell label="1fr" />
      <Cell label="80px" />
    </Grid>
  ),
};

export const GapVariants: Story = {
  name: "Gap axis (small / middle / large)",
  render: () => (
    <Flex vertical gap="middle">
      {(["small", "middle", "large"] as const).map((g) => (
        <Card key={g} padding="tight" title={`gap="${g}"`}>
          <Grid cols={4} gap={g}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Cell key={i} label={`${i + 1}`} />
            ))}
          </Grid>
        </Card>
      ))}
    </Flex>
  ),
};

export const AxisSpecificGap: Story = {
  name: "Axis-specific gap (columnGap + rowGap)",
  render: () => (
    <Grid cols={4} columnGap="large" rowGap="small">
      {Array.from({ length: 12 }).map((_, i) => (
        <Cell key={i} label={`${i + 1}`} />
      ))}
    </Grid>
  ),
};

export const ColsAndRows: Story = {
  name: "2-D template (cols + rows)",
  render: () => (
    <Grid cols={3} rows={2} gap="middle" style={{ minHeight: 200 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Cell key={i} label={`r${Math.floor(i / 3) + 1} c${(i % 3) + 1}`} />
      ))}
    </Grid>
  ),
};

export const DashboardLayout: Story = {
  name: "Pattern · dashboard tiles",
  render: () => (
    <Grid cols={4} gap="middle">
      <Card padding="tight" title="出勤率" meta="本日">
        <span className="stat">96.8<span className="unit">%</span></span>
      </Card>
      <Card padding="tight" title="遅刻" meta="本日">
        <span className="stat">3</span>
      </Card>
      <Card padding="tight" title="超勤" meta="今月">
        <span className="stat">42.5<span className="unit">h</span></span>
      </Card>
      <Card padding="tight" title="承認待ち">
        <span className="stat">12</span>
      </Card>
    </Grid>
  ),
};
