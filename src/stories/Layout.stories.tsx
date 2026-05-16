import type { Meta, StoryObj } from "@storybook/react";
import {
  CalendarDays,
  CheckCircle2,
  GitBranch,
  GitPullRequest,
  Layers,
  Plus,
  Rocket,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Row, Col, Flex, Space } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Avatar } from "../components/primitives/Avatar";
import { Separator } from "../components/primitives/Separator";
import { Statistic } from "../components/primitives/Statistic";

const meta: Meta = {
  title: "Primitives/Layout",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Layout primitives** — \`Row\`, \`Col\`, \`Flex\`, \`Space\`.

These four primitives are the ONLY way to lay things out inside an
\`@godxjp/ui\` consumer. Service code never writes raw \`display: grid\`
or \`grid-cols-[280px_1fr]\` — the framework owns the layout vocabulary
so density tweaks (gap tokens, breakpoint widths) propagate from one
edit in \`tokens.css\` to every screen on every product.

The API mirrors **Ant Design** verbatim so anyone who knows AntD can
read godx layout source on day one.

| Primitive | Use when… | Mental model |
|---|---|---|
| \`Row\` + \`Col\` | You need the 24-column responsive grid (page layouts, dashboard hero, responsive side-by-side panels). | AntD Grid — children \`Col\` spans sum to ≤24 per breakpoint and wrap when full. |
| \`Flex\` | You need a flex container with explicit \`gap\` / \`justify\` / \`align\` / \`vertical\` / \`wrap\`. | AntD Flex — a clean prop-driven replacement for \`<div className="flex …">\`. |
| \`Space\` | You need an *inline group* of small items (action buttons, tags, breadcrumb pieces) with a uniform gap and optional \`split\` separator between siblings. | AntD Space — \`inline-flex\` semantics, not a layout container. |

**Row / Col grid math.** The grid is 12 / 24-friendly. A \`Col span={8}\`
takes \`(8 / 24) * 100% = 33.33%\` of its row. Per-breakpoint props
(\`xs\` / \`sm\` / \`md\` / \`lg\` / \`xl\` / \`xxl\`) override \`span\` at the
matching min-width — resolved at runtime via \`window.matchMedia\`.

**Gutters propagate via React context.** \`<Row gutter={16}>\` sets a
\`[16, 0]\` tuple on \`useRowGutter()\`; each child \`Col\` reads it and
adds matching \`paddingLeft\` / \`paddingRight\` so the leftmost +
rightmost cells align with the container edge. Tuple form \`[h, v]\`
adds vertical \`rowGap\`; per-breakpoint form \`{ xs: 8, md: 16 }\`
resolves the widest matching breakpoint.

**Accessibility.** Pure visual primitives — no ARIA semantics of their
own. They render a \`<div>\` per call. Don't reach for \`role="grid"\`
unless the data is tabular (use \`<Table>\` for that).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────
// Reusable visual block — labels a grid cell so layout boundaries are clear.
// ─────────────────────────────────────────────────────────────────────────

const Block = ({ label, tone = "surface" }: { label: string; tone?: "surface" | "primary" | "accent" }) => (
  <div
    style={{
      padding: "12px 16px",
      background:
        tone === "primary"
          ? "color-mix(in oklch, var(--primary) 12%, transparent)"
          : tone === "accent"
            ? "color-mix(in oklch, var(--info) 14%, transparent)"
            : "var(--surface-3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      textAlign: "center",
      fontSize: "var(--text-sm)",
      color: "var(--foreground)",
      minHeight: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {label}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: "0 0 8px", fontWeight: 500 }}>
    {children}
  </h3>
);

// ─────────────────────────────────────────────────────────────────────────
// Row — 24-col grid
// ─────────────────────────────────────────────────────────────────────────

export const RowBasics: Story = {
  name: "Row — gutters + alignment",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      <div>
        <SectionLabel>gutter={"{0}"} — no padding between cols</SectionLabel>
        <Row gutter={0}>
          <Col span={8}><Block label="span 8" /></Col>
          <Col span={8}><Block label="span 8" /></Col>
          <Col span={8}><Block label="span 8" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>gutter={"{16}"} — horizontal only</SectionLabel>
        <Row gutter={16}>
          <Col span={8}><Block label="span 8" /></Col>
          <Col span={8}><Block label="span 8" /></Col>
          <Col span={8}><Block label="span 8" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>gutter={"{[16, 16]}"} — h + v tuple (wraps with vertical gap)</SectionLabel>
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} span={8}><Block label={`#${i + 1}`} /></Col>
          ))}
        </Row>
      </div>
      <div>
        <SectionLabel>gutter={"{{ xs: 8, md: 16, xl: 24 }}"} — per-breakpoint</SectionLabel>
        <Row gutter={{ xs: 8, md: 16, xl: 24 }}>
          <Col xs={24} md={12}><Block label="xs=24, md=12" /></Col>
          <Col xs={24} md={12}><Block label="xs=24, md=12" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>justify="space-between" + align="middle"</SectionLabel>
        <Row gutter={8} justify="space-between" align="middle" style={{ minHeight: 96, background: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: 12 }}>
          <Col span={4}><Block label="small" /></Col>
          <Col span={4}><div style={{ height: 64 }}><Block label="tall" /></div></Col>
          <Col span={4}><Block label="small" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>wrap={"{false}"} — overflow horizontally instead of wrapping</SectionLabel>
        <Row gutter={8} wrap={false} style={{ overflowX: "auto" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i} span={6}><Block label={`#${i + 1}`} /></Col>
          ))}
        </Row>
      </div>
    </Flex>
  ),
};

export const RowJustifyMatrix: Story = {
  name: "Row — justify variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      {(["start", "end", "center", "space-around", "space-between", "space-evenly"] as const).map((j) => (
        <div key={j}>
          <SectionLabel>justify="{j}"</SectionLabel>
          <Row gutter={8} justify={j} style={{ background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}>
            <Col span={4}><Block label="A" /></Col>
            <Col span={4}><Block label="B" /></Col>
            <Col span={4}><Block label="C" /></Col>
          </Row>
        </div>
      ))}
    </Flex>
  ),
};

export const RowAlignMatrix: Story = {
  name: "Row — align variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      {(["top", "middle", "bottom", "stretch"] as const).map((a) => (
        <div key={a}>
          <SectionLabel>align="{a}"</SectionLabel>
          <Row gutter={8} align={a} style={{ minHeight: 96, background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}>
            <Col span={6}><Block label="short" /></Col>
            <Col span={6}><div style={{ height: 72 }}><Block label="tall" /></div></Col>
            <Col span={6}><div style={{ height: 48 }}><Block label="medium" /></div></Col>
          </Row>
        </div>
      ))}
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Col — span / offset / order / responsive
// ─────────────────────────────────────────────────────────────────────────

export const ColSpan: Story = {
  name: "Col — span 1..24",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <SectionLabel>Every span from 24 → 1 (mix to see the grid math)</SectionLabel>
      <Row gutter={[8, 8]}>
        <Col span={24}><Block label="span 24" tone="primary" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={12}><Block label="span 12" /></Col>
        <Col span={12}><Block label="span 12" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={8}><Block label="span 8" /></Col>
        <Col span={8}><Block label="span 8" /></Col>
        <Col span={8}><Block label="span 8" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={6}><Block label="span 6" /></Col>
        <Col span={6}><Block label="span 6" /></Col>
        <Col span={6}><Block label="span 6" /></Col>
        <Col span={6}><Block label="span 6" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={4}><Block label="4" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={4}><Block label="4" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={16}><Block label="span 16" tone="primary" /></Col>
        <Col span={8}><Block label="span 8" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={18}><Block label="span 18 (main)" tone="primary" /></Col>
        <Col span={6}><Block label="span 6 (rail)" /></Col>
      </Row>
    </Flex>
  ),
};

export const ColOffset: Story = {
  name: "Col — offset",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <div>
        <SectionLabel>offset={"{8}"} — push a span-8 cell to column 9</SectionLabel>
        <Row gutter={8}>
          <Col span={8} offset={8}><Block label="span 8, offset 8" tone="primary" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>Centred span-12 via offset 6</SectionLabel>
        <Row gutter={8}>
          <Col span={12} offset={6}><Block label="span 12, offset 6" tone="primary" /></Col>
        </Row>
      </div>
      <div>
        <SectionLabel>Two offsets stacked</SectionLabel>
        <Row gutter={8}>
          <Col span={6} offset={2}><Block label="6 / off 2" /></Col>
          <Col span={6} offset={2}><Block label="6 / off 2" /></Col>
          <Col span={6}><Block label="span 6" /></Col>
        </Row>
      </div>
    </Flex>
  ),
};

export const ColOrder: Story = {
  name: "Col — order (visual reordering)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <SectionLabel>Source order: A, B, C. Visual order: C, A, B via `order` prop.</SectionLabel>
      <Row gutter={8}>
        <Col span={8} order={2}><Block label="A — order 2" /></Col>
        <Col span={8} order={3}><Block label="B — order 3" /></Col>
        <Col span={8} order={1}><Block label="C — order 1" tone="primary" /></Col>
      </Row>
    </Flex>
  ),
};

export const ColResponsive: Story = {
  name: "Col — responsive xs/sm/md/lg/xl/xxl",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <SectionLabel>
        Resize the canvas — each Col responds to the matching breakpoint
        (xs=24, sm=12, md=8, lg=6, xl=4, xxl=3).
      </SectionLabel>
      <Row gutter={[8, 8]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={6} xl={4} xxl={3}>
            <Block label={`#${i + 1}`} />
          </Col>
        ))}
      </Row>
      <SectionLabel>Classic 2-pane layout: full-width on mobile, 8/16 on desktop</SectionLabel>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Block label="xs=24, md=8 (side)" tone="accent" /></Col>
        <Col xs={24} md={16}><Block label="xs=24, md=16 (main)" tone="primary" /></Col>
      </Row>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Flex
// ─────────────────────────────────────────────────────────────────────────

export const FlexGap: Story = {
  name: "Flex — gap tokens + custom",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      <div>
        <SectionLabel>gap="small" (spacing-2)</SectionLabel>
        <Flex gap="small">
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} label={`#${i + 1}`} />)}
        </Flex>
      </div>
      <div>
        <SectionLabel>gap="middle" (spacing-3)</SectionLabel>
        <Flex gap="middle">
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} label={`#${i + 1}`} />)}
        </Flex>
      </div>
      <div>
        <SectionLabel>gap="large" (spacing-4)</SectionLabel>
        <Flex gap="large">
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} label={`#${i + 1}`} />)}
        </Flex>
      </div>
      <div>
        <SectionLabel>gap={"{32}"} — custom pixel gap</SectionLabel>
        <Flex gap={32}>
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} label={`#${i + 1}`} />)}
        </Flex>
      </div>
    </Flex>
  ),
};

export const FlexDirection: Story = {
  name: "Flex — vertical + wrap",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={16}>
      <Col span={12}>
        <SectionLabel>horizontal (default) — wrap=false</SectionLabel>
        <Flex gap="middle">
          <Block label="A" />
          <Block label="B" />
          <Block label="C" />
        </Flex>
      </Col>
      <Col span={12}>
        <SectionLabel>vertical</SectionLabel>
        <Flex vertical gap="middle">
          <Block label="A" />
          <Block label="B" />
          <Block label="C" />
        </Flex>
      </Col>
      <Col span={24} style={{ marginTop: 16 }}>
        <SectionLabel>wrap=true — overflows onto new lines</SectionLabel>
        <Flex gap="middle" wrap style={{ background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ width: 96 }}><Block label={`#${i + 1}`} /></div>
          ))}
        </Flex>
      </Col>
    </Row>
  ),
};

export const FlexJustifyAlign: Story = {
  name: "Flex — justify × align",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      {(["start", "end", "center", "space-between", "space-around", "space-evenly"] as const).map((j) => (
        <div key={j}>
          <SectionLabel>justify="{j}", align="center"</SectionLabel>
          <Flex
            justify={j}
            align="center"
            style={{ minHeight: 72, background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}
          >
            <Block label="A" />
            <Block label="B" />
            <Block label="C" />
          </Flex>
        </div>
      ))}
      <div>
        <SectionLabel>vertical + align="end" (right-aligned column)</SectionLabel>
        <Flex
          vertical
          align="end"
          gap="small"
          style={{ minHeight: 160, background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}
        >
          <Block label="A" />
          <Block label="B (wider)" />
          <Block label="C" />
        </Flex>
      </div>
    </Flex>
  ),
};

export const FlexShorthand: Story = {
  name: "Flex — flex prop on the container",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", height: 96, gap: 8, background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}>
      <Flex flex={1} align="center" justify="center" style={{ background: "var(--surface-3)", borderRadius: "var(--radius-md)" }}>
        flex={"{1}"}
      </Flex>
      <Flex flex={2} align="center" justify="center" style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)", borderRadius: "var(--radius-md)" }}>
        flex={"{2}"} (twice as wide)
      </Flex>
      <Flex flex={1} align="center" justify="center" style={{ background: "var(--surface-3)", borderRadius: "var(--radius-md)" }}>
        flex={"{1}"}
      </Flex>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Space
// ─────────────────────────────────────────────────────────────────────────

export const SpaceSizes: Story = {
  name: "Space — size tokens",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      <div>
        <SectionLabel>size="small" (spacing-1)</SectionLabel>
        <Space size="small">
          <Button size="sm" variant="secondary">Save</Button>
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" variant="ghost">More</Button>
        </Space>
      </div>
      <div>
        <SectionLabel>size="middle" (default)</SectionLabel>
        <Space size="middle">
          <Tag color="success">active</Tag>
          <Tag color="info">staging</Tag>
          <Tag color="warning">degraded</Tag>
        </Space>
      </div>
      <div>
        <SectionLabel>size="large" (spacing-3)</SectionLabel>
        <Space size="large">
          <Avatar size="sm" color="oklch(56% 0.15 240)">Y</Avatar>
          <Avatar size="sm" color="oklch(58% 0.14 25)">A</Avatar>
          <Avatar size="sm" color="oklch(60% 0.14 145)">S</Avatar>
        </Space>
      </div>
      <div>
        <SectionLabel>size={"{[24, 8]}"} — column × row gap tuple (wrapping row)</SectionLabel>
        <Space size={[24, 8]} wrap>
          {["forge-service", "admin-platform", "me-service", "console-service", "chat-service", "media-service"].map((t) => (
            <Tag key={t} color="primary">{t}</Tag>
          ))}
        </Space>
      </div>
    </Flex>
  ),
};

export const SpaceVertical: Story = {
  name: "Space — vertical direction",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space direction="vertical" size="middle" align="start" style={{ width: 280 }}>
      <Button variant="primary">Create sandbox</Button>
      <Button variant="secondary">Open recent worktree</Button>
      <Button variant="ghost">View team activity</Button>
    </Space>
  ),
};

export const SpaceWithSplit: Story = {
  name: "Space — with split slot",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <div>
        <SectionLabel>split = "·" (text bullet)</SectionLabel>
        <Space size="middle" split="·">
          <span>Tokyo</span>
          <span>Asia/Tokyo</span>
          <span>JPY</span>
          <span>ja-JP</span>
        </Space>
      </div>
      <div>
        <SectionLabel>split = vertical Separator (proper divider)</SectionLabel>
        <Space size="middle" split={<Separator orientation="vertical" />} align="center">
          <span>created 2026-05-15</span>
          <span>4 sandboxes</span>
          <span>12 PRs</span>
          <span>2 plans</span>
        </Space>
      </div>
    </Flex>
  ),
};

export const SpaceAlign: Story = {
  name: "Space — cross-axis align",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      {(["start", "center", "end", "baseline"] as const).map((a) => (
        <div key={a}>
          <SectionLabel>align="{a}"</SectionLabel>
          <Space size="middle" align={a} style={{ background: "var(--surface-2)", padding: 8, borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: 12 }}>small</span>
            <span style={{ fontSize: 18 }}>medium</span>
            <span style={{ fontSize: 28 }}>LARGE</span>
          </Space>
        </div>
      ))}
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// AntD-style 24-col grid showcase
// ─────────────────────────────────────────────────────────────────────────

export const GridShowcase: Story = {
  name: "Showcase — 24-col grid",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <SectionLabel>Cell-by-cell breakdown of how the 24-col grid composes</SectionLabel>
      <Row gutter={[8, 8]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <Col key={i} span={1}><Block label={`${i + 1}`} /></Col>
        ))}
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={2}><Block label="2" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={6}><Block label="6" tone="primary" /></Col>
        <Col span={4}><Block label="4" /></Col>
        <Col span={6}><Block label="6" tone="accent" /></Col>
        <Col span={2}><Block label="2" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={3}><Block label="3" /></Col>
        <Col span={3}><Block label="3" /></Col>
        <Col span={3}><Block label="3" /></Col>
        <Col span={15}><Block label="15 (3+3+3+15 = 24)" tone="primary" /></Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={20}><Block label="20" tone="primary" /></Col>
        <Col span={4}><Block label="4" /></Col>
      </Row>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic dashboard composition
// ─────────────────────────────────────────────────────────────────────────

export const RealWorldDashboard: Story = {
  name: "Composition — dashboard layout",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large">
      {/* Hero — Row of 3 KPI cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="Active sandboxes">
            <Statistic value={12} suffix={<span style={{ fontSize: 12 }}>/ 20</span>} />
            <Tag color="success" style={{ marginTop: 8 }}>+2 since 2026-05-14</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="Open PRs">
            <Statistic value={7} prefix={<GitPullRequest size={14} />} />
            <Tag color="info" style={{ marginTop: 8 }}>3 awaiting review</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card size="small" title="Failed runs">
            <Statistic value={2} />
            <Tag color="error" style={{ marginTop: 8 }}>investigate forge-service-ci</Tag>
          </Card>
        </Col>
      </Row>

      {/* Main — two-col layout: project list + activity rail */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent projects"
            extra={<Button size="sm" variant="ghost"><Plus size={14} /> New project</Button>}
          >
            <Flex vertical gap="middle">
              {[
                { name: "godx-admin", branch: "feat/forge-shell-align", tag: "active" },
                { name: "forge-service", branch: "main", tag: "active" },
                { name: "me-service", branch: "phase-z/overview", tag: "review" },
                { name: "chat-service", branch: "dev", tag: "completion" },
              ].map((p) => (
                <Flex key={p.name} align="center" justify="space-between">
                  <Space size="middle" align="center">
                    <Avatar size="sm" color="oklch(56% 0.15 240)" shape="square">
                      <Layers size={14} />
                    </Avatar>
                    <Flex vertical gap={2}>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                      <Space size="small" split="·" align="center">
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                          <GitBranch size={11} style={{ display: "inline" }} /> {p.branch}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>2026-05-15</span>
                      </Space>
                    </Flex>
                  </Space>
                  <Tag color={p.tag === "active" ? "success" : p.tag === "review" ? "warning" : "info"}>
                    {p.tag}
                  </Tag>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Activity" size="small">
            <Flex vertical gap="middle">
              {[
                { icon: <Rocket size={14} />, text: "Deployed forge-service @ 09:12" },
                { icon: <GitPullRequest size={14} />, text: "PR #1475 merged into dev" },
                { icon: <CheckCircle2 size={14} />, text: "All CI green on master" },
                { icon: <Users size={14} />, text: "anh@betoya.com joined godx-admin" },
                { icon: <ShieldCheck size={14} />, text: "Audit log archived 2026-05-14" },
              ].map((e, i) => (
                <Space key={i} size="small" align="center">
                  <span style={{ color: "var(--muted-foreground)" }}>{e.icon}</span>
                  <span style={{ fontSize: 13 }}>{e.text}</span>
                </Space>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Footer-ish bar — Space + split for status meta */}
      <Card variant="filled" size="small">
        <Flex align="center" justify="space-between">
          <Space size="middle" split={<Separator orientation="vertical" />} align="center">
            <Space size="small" align="center"><Settings size={13} /> region: tokyo</Space>
            <Space size="small" align="center"><CalendarDays size={13} /> 2026-05-15</Space>
            <Space size="small" align="center"><ShieldCheck size={13} /> WCAG AA</Space>
          </Space>
          <Button size="sm" variant="secondary">View status</Button>
        </Flex>
      </Card>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Combined "all primitives at once" showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllPrimitives: Story = {
  name: "Showcase — Row + Col + Flex + Space together",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Row + Col (24-col grid)" size="small">
          <Row gutter={[8, 8]}>
            <Col span={12}><Block label="12" /></Col>
            <Col span={12}><Block label="12" /></Col>
            <Col span={8}><Block label="8" /></Col>
            <Col span={8}><Block label="8" /></Col>
            <Col span={8}><Block label="8" /></Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Flex (gap + justify)" size="small">
          <Flex vertical gap="small">
            <Flex gap="small" justify="space-between">
              <Block label="A" />
              <Block label="B" />
              <Block label="C" />
            </Flex>
            <Flex gap="small" align="center">
              <Button size="sm" variant="secondary">Save</Button>
              <Button size="sm" variant="ghost">Cancel</Button>
            </Flex>
          </Flex>
        </Card>
      </Col>
      <Col xs={24}>
        <Card title="Space (inline + split)" size="small">
          <Space size="middle" split={<Separator orientation="vertical" />} align="center">
            <Tag color="success">active</Tag>
            <span>region: tokyo</span>
            <span>plan #38</span>
            <span>2026-05-15</span>
            <Button size="sm" variant="ghost">Manage</Button>
          </Space>
        </Card>
      </Col>
    </Row>
  ),
};
