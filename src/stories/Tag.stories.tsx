import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Hash, GitBranch, Bug, Sparkles, Lock, ShieldAlert } from "lucide-react";
import { Tag } from "../components/primitives/Tag";
import { Row, Col, Flex, Space } from "../components/primitives/layout";

/**
 * Tag — Ant-Design label chip.
 *
 * Props:
 * - **color** — preset (`default` / `success` / `warning` / `error` /
 *   `info` / `attention` / `primary`) OR any CSS color string.
 * - **bordered** — outline (default `true`). `false` = solid-tinted bg only.
 * - **closable** + **onClose** — render an × button.
 * - **icon** — leading icon slot.
 *
 * Use vs Badge: Tag is a label chip — typically appears multiple per row
 * (filter bars, table cells, metadata strips), often closable.
 */
const meta: Meta<typeof Tag> = {
  title: "Primitives/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Label chip with preset semantic colors + custom CSS color " +
          "fallback. Pairs naturally with Flex (filter bars), Table cells " +
          "(status), and Card.extra slots.",
      },
    },
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: [
        "default", "success", "warning", "error", "info", "attention", "primary",
        "oklch(58% 0.16 250)", "oklch(60% 0.15 150)", "#0ea5e9",
      ],
    },
    bordered: { control: { type: "boolean" } },
    closable: { control: { type: "boolean" } },
    children: { control: { type: "text" } },
  },
};
export default meta;
type Story = StoryObj<typeof Tag>;

/** Live Controls playground. */
export const Playground: Story = {
  args: { color: "default", bordered: true, closable: false, children: "label" },
};

// ---------------------------------------------------------------------------
// Preset colors
// ---------------------------------------------------------------------------

export const PresetDefault: Story = { args: { children: "default" } };
export const PresetSuccess: Story = { args: { color: "success", children: "done" } };
export const PresetWarning: Story = { args: { color: "warning", children: "needs review" } };
export const PresetError: Story = { args: { color: "error", children: "blocked" } };
export const PresetInfo: Story = { args: { color: "info", children: "in progress" } };
export const PresetAttention: Story = { args: { color: "attention", children: "awaiting input" } };
export const PresetPrimary: Story = { args: { color: "primary", children: "featured" } };

export const PresetColors: Story = {
  name: "Showcase — preset colors",
  render: () => (
    <Space size="small" wrap>
      <Tag>default</Tag>
      <Tag color="success">success</Tag>
      <Tag color="warning">warning</Tag>
      <Tag color="error">error</Tag>
      <Tag color="info">info</Tag>
      <Tag color="attention">attention</Tag>
      <Tag color="primary">primary</Tag>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Custom CSS color string
// ---------------------------------------------------------------------------

export const CustomCssColor: Story = {
  name: "Color — custom CSS string",
  render: () => (
    <Space size="small" wrap>
      <Tag color="oklch(58% 0.16 250)">oklch blue</Tag>
      <Tag color="oklch(60% 0.15 150)">oklch green</Tag>
      <Tag color="oklch(58% 0.18 25)">oklch red</Tag>
      <Tag color="#0ea5e9">hex sky</Tag>
      <Tag color="rgb(168, 85, 247)">rgb violet</Tag>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Bordered vs borderless
// ---------------------------------------------------------------------------

export const Borderless: Story = {
  name: "Borderless — solid tint only",
  render: () => (
    <Flex vertical gap="small">
      <Space size="small">
        <Tag bordered={false}>default</Tag>
        <Tag color="success" bordered={false}>done</Tag>
        <Tag color="warning" bordered={false}>review</Tag>
        <Tag color="error" bordered={false}>blocked</Tag>
        <Tag color="info" bordered={false}>in progress</Tag>
        <Tag color="primary" bordered={false}>featured</Tag>
      </Space>
      <Space size="small">
        <Tag>default</Tag>
        <Tag color="success">done</Tag>
        <Tag color="warning">review</Tag>
        <Tag color="error">blocked</Tag>
        <Tag color="info">in progress</Tag>
        <Tag color="primary">featured</Tag>
      </Space>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// With icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="info" icon={<Hash size={12} />}>topic</Tag>
      <Tag color="primary" icon={<GitBranch size={12} />}>feat/forge-shell</Tag>
      <Tag color="error" icon={<Bug size={12} />}>bug</Tag>
      <Tag color="success" icon={<Sparkles size={12} />}>new</Tag>
      <Tag color="warning" icon={<ShieldAlert size={12} />}>security</Tag>
      <Tag color="default" icon={<Lock size={12} />}>private</Tag>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Closable — interactive with onClose
// ---------------------------------------------------------------------------

function ClosableDemo() {
  const [tags, setTags] = useState<string[]>([
    "platform", "engineering", "プラットフォーム", "frontend", "go-sdk",
  ]);
  return (
    <Space size="small" wrap>
      {tags.map((t) => (
        <Tag
          key={t}
          color="info"
          closable
          onClose={() => setTags((cur) => cur.filter((x) => x !== t))}
        >
          {t}
        </Tag>
      ))}
      {tags.length === 0 && <span style={{ color: "var(--muted-foreground)" }}>(all removed)</span>}
    </Space>
  );
}

export const Closable: Story = {
  name: "Closable — interactive onClose",
  render: () => <ClosableDemo />,
};

// ---------------------------------------------------------------------------
// Realistic compositions
// ---------------------------------------------------------------------------

function FilterBar() {
  const [active, setActive] = useState<string[]>(["全プロジェクト", "進行中"]);
  const all = ["全プロジェクト", "進行中", "完了", "アーカイブ", "godxjp-ui", "forge-service"];
  return (
    <Flex gap="small" wrap>
      {all.map((f) => {
        const on = active.includes(f);
        return (
          <Tag
            key={f}
            color={on ? "primary" : "default"}
            bordered={!on}
            onClick={() =>
              setActive((cur) =>
                cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]
              )
            }
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {f}
          </Tag>
        );
      })}
    </Flex>
  );
}

export const FilterBarComposition: Story = {
  name: "Composition — Project filter bar",
  render: () => <FilterBar />,
};

export const TableRowStatus: Story = {
  name: "Composition — Status in table cell",
  render: () => {
    const rows: { id: string; title: string; status: "info" | "success" | "warning" | "error" | "attention"; status_label: string; tags: string[] }[] = [
      { id: "#1481", title: "Align shell to rule 12",         status: "info",      status_label: "in progress",  tags: ["frontend", "forge"] },
      { id: "#1478", title: "me-service overview profile",    status: "success",   status_label: "done",         tags: ["frontend", "me"] },
      { id: "#1462", title: "Diátaxis v3 docs",               status: "success",   status_label: "shipped",      tags: ["docs"] },
      { id: "#1411", title: "Vault sealed → 503 new creates", status: "warning",   status_label: "needs review", tags: ["plan-38", "vault"] },
      { id: "#1390", title: "Plan #33 OpenAPI lint",          status: "error",     status_label: "blocked",      tags: ["intersvc"] },
      { id: "#1377", title: "Captcha bypass for ai_agent",    status: "attention", status_label: "awaiting Q&A", tags: ["plan-20", "auth"] },
    ];
    return (
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--muted-foreground)" }}>
            <th style={{ padding: "8px 12px" }}>Issue</th>
            <th style={{ padding: "8px 12px" }}>Title</th>
            <th style={{ padding: "8px 12px" }}>Status</th>
            <th style={{ padding: "8px 12px" }}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)" }}>{r.id}</td>
              <td style={{ padding: "10px 12px" }}>{r.title}</td>
              <td style={{ padding: "10px 12px" }}>
                <Tag color={r.status} bordered={false}>{r.status_label}</Tag>
              </td>
              <td style={{ padding: "10px 12px" }}>
                <Space size={4} wrap>
                  {r.tags.map((t) => (
                    <Tag key={t} color="default" bordered>
                      {t}
                    </Tag>
                  ))}
                </Space>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

// ---------------------------------------------------------------------------
// Full showcase matrix
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — full matrix",
  render: () => (
    <Flex vertical gap="large">
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>bordered</strong></Col>
        <Col span={20}>
          <Space size="small" wrap>
            <Tag>default</Tag>
            <Tag color="success">success</Tag>
            <Tag color="warning">warning</Tag>
            <Tag color="error">error</Tag>
            <Tag color="info">info</Tag>
            <Tag color="attention">attention</Tag>
            <Tag color="primary">primary</Tag>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>borderless</strong></Col>
        <Col span={20}>
          <Space size="small" wrap>
            <Tag bordered={false}>default</Tag>
            <Tag color="success" bordered={false}>success</Tag>
            <Tag color="warning" bordered={false}>warning</Tag>
            <Tag color="error" bordered={false}>error</Tag>
            <Tag color="info" bordered={false}>info</Tag>
            <Tag color="attention" bordered={false}>attention</Tag>
            <Tag color="primary" bordered={false}>primary</Tag>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>with icon</strong></Col>
        <Col span={20}>
          <Space size="small" wrap>
            <Tag icon={<Hash size={12} />}>topic</Tag>
            <Tag color="success" icon={<Sparkles size={12} />}>new</Tag>
            <Tag color="warning" icon={<ShieldAlert size={12} />}>security</Tag>
            <Tag color="error" icon={<Bug size={12} />}>bug</Tag>
            <Tag color="info" icon={<GitBranch size={12} />}>branch</Tag>
            <Tag color="primary" icon={<Lock size={12} />}>private</Tag>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>closable</strong></Col>
        <Col span={20}>
          <Space size="small" wrap>
            <Tag closable onClose={() => {}}>default</Tag>
            <Tag color="success" closable onClose={() => {}}>success</Tag>
            <Tag color="warning" closable onClose={() => {}}>warning</Tag>
            <Tag color="error" closable onClose={() => {}}>error</Tag>
            <Tag color="info" closable onClose={() => {}}>info</Tag>
            <Tag color="primary" closable onClose={() => {}}>primary</Tag>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>custom CSS</strong></Col>
        <Col span={20}>
          <Space size="small" wrap>
            <Tag color="oklch(58% 0.16 250)">oklch blue</Tag>
            <Tag color="oklch(60% 0.15 150)">oklch green</Tag>
            <Tag color="#0ea5e9">hex sky</Tag>
            <Tag color="rgb(168,85,247)">rgb violet</Tag>
          </Space>
        </Col>
      </Row>
    </Flex>
  ),
};
