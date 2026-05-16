import type { Meta, StoryObj } from "@storybook/react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Users, Activity, DollarSign } from "lucide-react";
import { Statistic } from "../components/primitives/Statistic";
import { Card } from "../components/primitives/Card";
import { Skeleton } from "../components/primitives/Skeleton";
import { Row, Col, Flex } from "../components/primitives/layout";

/**
 * Statistic — Ant-Design KPI tile.
 *
 * Props:
 * - **title** — small label above the value.
 * - **value** — number or string.
 * - **precision** — decimal places when value is a number.
 * - **prefix** / **suffix** — slot nodes (currency, percent, icon, "/mo").
 * - **groupSeparator** — locale grouping via `Intl.NumberFormat` (default `true`).
 * - **formatter** — custom (value) → ReactNode, overrides precision + grouping.
 * - **align** — `left` (default) / `right` / `center`.
 * - **valueSize** — pixel font size for the number.
 *
 * Where it fits: dashboard hero rows, Card bodies, the org-tile grid on
 * the platform overview.
 */
const meta: Meta<typeof Statistic> = {
  title: "Primitives/Statistic",
  component: Statistic,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "KPI tile primitive. Pairs naturally with Card (one Statistic " +
          "per card, KPI grid on dashboard hero rows) and Skeleton " +
          "(loading state). Composes the value from prefix + number + suffix.",
      },
    },
  },
  argTypes: {
    title: { control: { type: "text" } },
    value: { control: { type: "text" } },
    precision: { control: { type: "number", min: 0, max: 6 } },
    prefix: { control: { type: "text" } },
    suffix: { control: { type: "text" } },
    groupSeparator: { control: { type: "boolean" } },
    align: { control: { type: "inline-radio" }, options: ["left", "center", "right"] },
    valueSize: { control: { type: "number", min: 12, max: 64 } },
  },
};
export default meta;
type Story = StoryObj<typeof Statistic>;

/** Live Controls playground. */
export const Playground: Story = {
  args: {
    title: "Active users",
    value: 1024,
    precision: 0,
    align: "left",
  },
};

// ---------------------------------------------------------------------------
// Title + value
// ---------------------------------------------------------------------------

export const Basic: Story = {
  args: { title: "Active users", value: 1024 },
};

export const StringValue: Story = {
  args: { title: "Build status", value: "passing" },
};

// ---------------------------------------------------------------------------
// Precision
// ---------------------------------------------------------------------------

export const Precision: Story = {
  render: () => (
    <Flex gap="large">
      <Statistic title="Uptime" value={99.95} precision={0} suffix="%" />
      <Statistic title="Uptime" value={99.95} precision={1} suffix="%" />
      <Statistic title="Uptime" value={99.95} precision={2} suffix="%" />
      <Statistic title="Uptime" value={99.9573} precision={4} suffix="%" />
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Prefix / suffix
// ---------------------------------------------------------------------------

export const PrefixCurrency: Story = {
  args: { title: "Take-home pay", value: 417_600, prefix: "¥", suffix: "/mo" },
};

export const PrefixIcon: Story = {
  args: {
    title: "Growth",
    value: 12.5,
    precision: 1,
    suffix: "%",
    prefix: <TrendingUp size={16} style={{ color: "var(--success)" }} />,
  },
};

export const SuffixPercent: Story = {
  args: { title: "Conversion", value: 4.83, precision: 2, suffix: "%" },
};

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

export const Formatter: Story = {
  name: "Formatter — custom callback",
  render: () => (
    <Flex gap="large">
      <Statistic
        title="Big number (compact)"
        value={1_234_567}
        formatter={(v) => Intl.NumberFormat("en", { notation: "compact" }).format(Number(v))}
      />
      <Statistic
        title="Money (USD)"
        value={1234.56}
        formatter={(v) =>
          Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v))
        }
      />
      <Statistic
        title="Money (JPY)"
        value={417_600}
        formatter={(v) =>
          Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Number(v))
        }
      />
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Group separator on/off
// ---------------------------------------------------------------------------

export const GroupSeparator: Story = {
  render: () => (
    <Flex gap="large">
      <Statistic title="Grouped (default)" value={1_234_567} />
      <Statistic title="Ungrouped" value={1_234_567} groupSeparator={false} />
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Alignment
// ---------------------------------------------------------------------------

export const Align: Story = {
  name: "Alignment — left / center / right",
  render: () => (
    <Flex vertical gap="middle" style={{ width: 400 }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
        <Statistic title="Active users" value={1024} align="left" />
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
        <Statistic title="Active users" value={1024} align="center" />
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
        <Statistic title="Active users" value={1024} align="right" />
      </div>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Value size
// ---------------------------------------------------------------------------

export const ValueSize: Story = {
  name: "Value size — sm / md / lg",
  render: () => (
    <Flex gap="large" align="end">
      <Statistic title="sm" value={1024} valueSize={18} />
      <Statistic title="md (default)" value={1024} />
      <Statistic title="lg" value={1024} valueSize={32} />
      <Statistic title="xl" value={1024} valueSize={48} />
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Positive vs negative delta
// ---------------------------------------------------------------------------

export const Delta: Story = {
  name: "Delta — positive vs negative",
  render: () => (
    <Flex gap="large">
      <Statistic
        title="MoM growth"
        value={12.5}
        precision={1}
        suffix="%"
        prefix={<TrendingUp size={16} style={{ color: "var(--success)" }} />}
        style={{ color: "var(--success)" }}
      />
      <Statistic
        title="Bug count"
        value={-3.2}
        precision={1}
        suffix="%"
        prefix={<TrendingDown size={16} style={{ color: "var(--success)" }} />}
        style={{ color: "var(--success)" }}
      />
      <Statistic
        title="Churn"
        value={2.1}
        precision={1}
        suffix="%"
        prefix={<ArrowUpRight size={16} style={{ color: "var(--destructive)" }} />}
        style={{ color: "var(--destructive)" }}
      />
      <Statistic
        title="Revenue"
        value={-417_600}
        prefix={<><ArrowDownRight size={16} style={{ color: "var(--destructive)" }} />¥</>}
        suffix="/mo"
        style={{ color: "var(--destructive)" }}
      />
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Loading composition (with Skeleton)
// ---------------------------------------------------------------------------

export const LoadingComposition: Story = {
  name: "Composition — Skeleton loading state",
  render: () => (
    <Flex gap="large">
      <Card style={{ width: 200 }}>
        <Flex vertical gap="small">
          <Skeleton style={{ height: 12, width: 80 }} />
          <Skeleton style={{ height: 28, width: 120 }} />
        </Flex>
      </Card>
      <Card style={{ width: 200 }}>
        <Statistic title="Active users" value={1024} />
      </Card>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Realistic — KPI dashboard row (mirrors me-service overview hero)
// ---------------------------------------------------------------------------

export const KPIDashboardRow: Story = {
  name: "Composition — KPI dashboard row",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="所属組織"
            value={2}
            prefix={<Users size={16} style={{ color: "var(--muted-foreground)" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="アクティブセッション"
            value={14}
            prefix={<Activity size={16} style={{ color: "var(--info)" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Monthly revenue"
            value={417_600}
            prefix={<DollarSign size={16} style={{ color: "var(--success)" }} />}
            formatter={(v) =>
              Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Number(v))
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="MoM growth"
            value={12.5}
            precision={1}
            suffix="%"
            prefix={<TrendingUp size={16} style={{ color: "var(--success)" }} />}
            style={{ color: "var(--success)" }}
          />
        </Card>
      </Col>
    </Row>
  ),
};

// ---------------------------------------------------------------------------
// All variants showcase
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — full matrix",
  render: () => (
    <Flex vertical gap="large">
      <Row gutter={[16, 16]}>
        <Col span={6}><Statistic title="Plain number" value={1024} /></Col>
        <Col span={6}><Statistic title="With precision" value={99.95} precision={2} suffix="%" /></Col>
        <Col span={6}><Statistic title="Currency prefix" value={417600} prefix="¥" /></Col>
        <Col span={6}><Statistic title="Suffix" value={42} suffix="/min" /></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={6}><Statistic title="Centered" value={1024} align="center" /></Col>
        <Col span={6}><Statistic title="Right aligned" value={1024} align="right" /></Col>
        <Col span={6}><Statistic title="Big value" value={1024} valueSize={36} /></Col>
        <Col span={6}><Statistic title="String value" value="passing" /></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="Positive delta"
            value={12.5}
            precision={1}
            suffix="%"
            prefix={<TrendingUp size={16} style={{ color: "var(--success)" }} />}
            style={{ color: "var(--success)" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Negative delta"
            value={-3.2}
            precision={1}
            suffix="%"
            prefix={<TrendingDown size={16} style={{ color: "var(--destructive)" }} />}
            style={{ color: "var(--destructive)" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Formatter (compact)"
            value={1_234_567}
            formatter={(v) => Intl.NumberFormat("en", { notation: "compact" }).format(Number(v))}
          />
        </Col>
        <Col span={6}>
          <Statistic title="No grouping" value={1234567} groupSeparator={false} />
        </Col>
      </Row>
    </Flex>
  ),
};
