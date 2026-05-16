import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock,
  ExternalLink,
  Info,
  MoreHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Statistic } from "../components/primitives/Statistic";
import { Flex, Row, Col, Space } from "../components/primitives/layout";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Card** — surface container. Mirrors the dxs-kintai design canon
([\`comp-card.html\`](https://github.com/godx-jp/godxjp-ui/blob/main/design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-card.html)):
one atom (\`.card\`, 1px border, 6px radius, \`var(--card)\` bg,
no shadow at rest) plus four orthogonal modifiers.

Four prop axes:

| Prop | Values | Effect |
|---|---|---|
| \`padding\` | \`tight\` / \`default\` / \`cozy\` / \`none\` | 12 / 16 / 20 / 0 px |
| \`tone\` | \`default\` / \`muted\` / \`outline-only\` | bg = card / secondary / transparent |
| \`accent\` | \`primary\` / \`success\` / \`warning\` / \`attention\` / \`info\` / \`destructive\` / \`featured\` | 3px left edge in semantic color (or full ring for \`featured\`) |
| \`hoverable\` | boolean | border + shadow lift |

Per cardinal rule 21 every modifier reads from semantic tokens —
theme / accent / density / font-size axes flow through unchanged.
Switch the Storybook toolbar to confirm.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

// ─── Slot-prop API (the common case) ──────────────────────────────

export const Default: Story = {
  render: () => (
    <Card title="Pull requests" subtitle="Open this week" extra={<a href="#">More</a>}>
      <p>Body content goes here.</p>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card
      title="Quarterly revenue"
      extra={<Button size="small">Export</Button>}
      footer={<><Clock size={12} aria-hidden /> Updated 5 min ago</>}
    >
      <Statistic value={1234567} prefix="¥" precision={0} />
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card
      title="Leave request"
      subtitle="2026-05-20 — 5 days, paid"
      actions={
        <>
          <Button variant="ghost">Reject</Button>
          <Button>Approve</Button>
        </>
      }
    >
      <p>Annual leave for a planned overseas trip. Coverage arranged with team-lead Mai.</p>
    </Card>
  ),
};

// ─── Padding axis ──────────────────────────────────────────────────

export const Padding: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card padding="tight" title="tight (12)">tight body</Card>
      </Col>
      <Col span={6}>
        <Card padding="default" title="default (16)">default body</Card>
      </Col>
      <Col span={6}>
        <Card padding="cozy" title="cozy (20)">cozy body</Card>
      </Col>
      <Col span={6}>
        <Card padding="none">
          <CardHeader title="none — explicit regions" />
          <CardBody>Body pads itself via CardBody.</CardBody>
          <CardFooter actions>
            <Button size="small">OK</Button>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  ),
};

// ─── Tone axis ─────────────────────────────────────────────────────

export const Tone: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card title="default">bg: --card</Card>
      </Col>
      <Col span={8}>
        <Card tone="muted" title="muted">bg: --secondary</Card>
      </Col>
      <Col span={8}>
        <Card tone="outline-only" title="outline-only">bg: transparent</Card>
      </Col>
    </Row>
  ),
};

// ─── Accent axis ───────────────────────────────────────────────────

export const AccentEdges: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      {(["primary", "success", "warning", "attention", "info", "destructive"] as const).map(
        (accent) => (
          <Col span={8} key={accent}>
            <Card accent={accent} title={accent}>
              Edge accent in semantic color.
            </Card>
          </Col>
        ),
      )}
      <Col span={8}>
        <Card accent="featured" title="featured">
          Full --primary ring around the card.
        </Card>
      </Col>
    </Row>
  ),
};

// ─── Hoverable + featured (comparison row) ─────────────────────────

export const ComparisonRow: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card title="Starter" subtitle="Up to 5 users" hoverable>
          <Statistic value={0} prefix="¥" precision={0} />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          accent="featured"
          title="Team"
          subtitle="Recommended"
          hoverable
          extra={<Tag color="primary">Popular</Tag>}
        >
          <Statistic value={2900} prefix="¥" precision={0} />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Enterprise" subtitle="Custom" hoverable>
          <p>Contact sales.</p>
        </Card>
      </Col>
    </Row>
  ),
};

// ─── Mapped to design-canon usage patterns ─────────────────────────

export const StatCardPattern: Story = {
  name: "Pattern: Stat / KPI",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              Active users
            </span>
            <Statistic value={1234} />
            <Tag color="success">
              <TrendingUp size={12} aria-hidden /> +12.4%
            </Tag>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              Pending approvals
            </span>
            <Statistic value={42} />
            <Tag color="attention">
              <AlertTriangle size={12} aria-hidden /> Needs attention
            </Tag>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex vertical gap="small">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              MTD revenue
            </span>
            <Statistic value={1234567} prefix="¥" precision={0} />
            <Tag>—</Tag>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const StaffCardPattern: Story = {
  name: "Pattern: Staff / person",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="start">
            <Avatar name="Mai Nguyen" />
            <Flex vertical gap="small" style={{ minWidth: 0 }}>
              <strong>Mai Nguyen</strong>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                Team lead · Engineering
              </span>
              <Space size="small">
                <Badge variant="success">On shift</Badge>
                <Tag>Tokyo</Tag>
              </Space>
            </Flex>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="start">
            <Avatar name="Hoang Le" />
            <Flex vertical gap="small" style={{ minWidth: 0 }}>
              <strong>Hoang Le</strong>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                Designer
              </span>
              <Space size="small">
                <Badge variant="warning">PTO</Badge>
                <Tag>Hanoi</Tag>
              </Space>
            </Flex>
          </Flex>
        </Card>
      </Col>
      <Col span={8}>
        <Card padding="tight">
          <Flex gap="middle" align="start">
            <Avatar name="Akira Tanaka" />
            <Flex vertical gap="small" style={{ minWidth: 0 }}>
              <strong>Akira Tanaka</strong>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                Operations
              </span>
              <Space size="small">
                <Badge variant="info">Remote</Badge>
                <Tag>Osaka</Tag>
              </Space>
            </Flex>
          </Flex>
        </Card>
      </Col>
    </Row>
  ),
};

export const NoticeCardPattern: Story = {
  name: "Pattern: Notice / alert",
  render: () => (
    <Flex vertical gap="middle">
      <Card accent="info" padding="tight">
        <Flex gap="middle" align="start">
          <Info size={16} aria-hidden style={{ color: "var(--info)" }} />
          <Flex vertical gap="small">
            <strong>System maintenance scheduled</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              2026-05-25 02:00–04:00 UTC · expected downtime ~10 min
            </span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="attention" padding="tight">
        <Flex gap="middle" align="start">
          <CircleAlert size={16} aria-hidden style={{ color: "var(--attention)" }} />
          <Flex vertical gap="small">
            <strong>3 pending leave requests</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              Review before end of week.
            </span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="success" padding="tight">
        <Flex gap="middle" align="start">
          <CheckCircle2 size={16} aria-hidden style={{ color: "var(--success)" }} />
          <Flex vertical gap="small">
            <strong>Payroll for May closed</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              All 42 employees processed.
            </span>
          </Flex>
        </Flex>
      </Card>
      <Card accent="destructive" padding="tight">
        <Flex gap="middle" align="start">
          <AlertTriangle size={16} aria-hidden style={{ color: "var(--destructive)" }} />
          <Flex vertical gap="small">
            <strong>Failed import</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              shift-2026-05.csv · row 18 invalid date format
            </span>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  ),
};

export const ApprovalCardPattern: Story = {
  name: "Pattern: Approval / workflow",
  render: () => (
    <Card padding="none" style={{ width: 480 }}>
      <CardHeader
        title="Overtime request"
        extra={<Tag color="primary">Pending</Tag>}
      />
      <CardBody>
        <Flex vertical gap="middle">
          <Flex gap="middle">
            <Avatar name="Mai Nguyen" />
            <Flex vertical gap="small" style={{ minWidth: 0 }}>
              <strong>Mai Nguyen</strong>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                Engineering · submitted 2 hours ago
              </span>
            </Flex>
          </Flex>
          <p style={{ margin: 0 }}>
            Requesting 4 hours overtime on 2026-05-22 to support the platform
            release window. Time-zone coverage handover with team-lead Akira.
          </p>
        </Flex>
      </CardBody>
      <CardFooter actions>
        <Button variant="ghost">Reject</Button>
        <Button>Approve</Button>
      </CardFooter>
    </Card>
  ),
};

export const ListCardPattern: Story = {
  name: "Pattern: List / feed",
  render: () => (
    <Card padding="none" style={{ width: 480 }}>
      <CardHeader title="Recent activity" extra={<a href="#">See all</a>} />
      <CardBody>
        {[
          { icon: <Bell size={14} aria-hidden />, label: "New leave request from Hoang", time: "2 min" },
          { icon: <CheckCircle2 size={14} aria-hidden />, label: "Payroll approved by Akira", time: "1 hr" },
          { icon: <Users size={14} aria-hidden />, label: "Mai joined Engineering", time: "Yesterday" },
          { icon: <ExternalLink size={14} aria-hidden />, label: "Linked to Slack #ops", time: "2 days" },
        ].map((row, i) => (
          <Flex
            key={i}
            gap="middle"
            align="center"
            style={{ padding: "var(--spacing-2) 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>{row.icon}</span>
            <span style={{ flex: 1 }}>{row.label}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              {row.time}
            </span>
          </Flex>
        ))}
      </CardBody>
      <CardFooter>
        <Clock size={12} aria-hidden /> Updated continuously
      </CardFooter>
    </Card>
  ),
};

export const EmptyStatePattern: Story = {
  name: "Pattern: Empty state",
  render: () => (
    <Card tone="muted">
      <Flex vertical align="center" gap="middle" style={{ padding: "var(--spacing-6) 0", textAlign: "center" }}>
        <strong>No approvals waiting</strong>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          You're all caught up. New requests will appear here.
        </span>
      </Flex>
    </Card>
  ),
};

// ─── Hoverable demo ────────────────────────────────────────────────

export const Hoverable: Story = {
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Static" subtitle="No hover affordance">
          Static card.
        </Card>
      </Col>
      <Col span={12}>
        <Card hoverable title="Hoverable" subtitle="Hover me">
          Border lifts + shadow on hover.
        </Card>
      </Col>
    </Row>
  ),
};

// ─── Pattern grid — quick visual sanity matrix ─────────────────────

export const Grid: Story = {
  name: "Pattern matrix",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card padding="tight" title="tight" subtitle="12px pad">
          short
        </Card>
      </Col>
      <Col span={6}>
        <Card padding="cozy" title="cozy" subtitle="20px pad">
          wide
        </Card>
      </Col>
      <Col span={6}>
        <Card tone="muted" title="muted" subtitle="secondary bg">
          muted
        </Card>
      </Col>
      <Col span={6}>
        <Card tone="outline-only" title="outline" subtitle="transparent bg">
          outline
        </Card>
      </Col>
      <Col span={6}>
        <Card accent="primary" title="accent primary">
          edge
        </Card>
      </Col>
      <Col span={6}>
        <Card accent="success" title="accent success">
          edge
        </Card>
      </Col>
      <Col span={6}>
        <Card accent="featured" title="featured">
          full ring
        </Card>
      </Col>
      <Col span={6}>
        <Card hoverable title="hoverable">
          hover me
        </Card>
      </Col>
    </Row>
  ),
};
