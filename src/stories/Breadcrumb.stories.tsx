import type { Meta, StoryObj } from "@storybook/react";
import {
  ChevronRight,
  FolderGit2,
  Home,
  Layers,
  MoreHorizontal,
  Settings,
  Slash,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSep,
} from "../components/primitives/Breadcrumb";
import { Flex, Space } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Separator } from "../components/primitives/Separator";

const meta: Meta<typeof Breadcrumb> = {
  title: "Primitives/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Breadcrumb** — hierarchical wayfinding atom.

Three exports compose the breadcrumb:

| Export | Role |
|---|---|
| \`Breadcrumb\` | The outer \`<nav aria-label="Breadcrumb">\` container — owns the \`.breadcrumb\` token class. |
| \`BreadcrumbItem\` | A single crumb. Renders \`<a>\` when \`href\` is passed, otherwise a \`<span>\`. Set \`current\` on the final crumb to mark the active page. |
| \`BreadcrumbSep\` | The visual divider (default \`/\`) between siblings — \`aria-hidden="true"\` so screen readers skip it. |

Mirrors the Ant Design Breadcrumb shape but stays explicit: each crumb
is its own JSX child, so a router \`<Link>\` slots in trivially by
omitting \`href\` and nesting the link inside the item.

**Accessibility (WCAG 2.1 AA)**

- The outer element is a \`<nav>\` with \`aria-label="Breadcrumb"\` so assistive tech announces the landmark.
- The current crumb sets \`aria-current="page"\` (whether rendered as \`<a>\` or \`<span>\`).
- The separator is decorative — \`aria-hidden\` keeps it out of the accessible name.

**When NOT to use a breadcrumb.** Breadcrumbs help when the page sits
inside a hierarchical structure (\`Org → Project → Sandbox →
Settings\`). For flat top-level navigation (Inbox, Sent, Drafts), use
the sidebar / topbar — not breadcrumbs.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// ─────────────────────────────────────────────────────────────────────────
// Basic chains
// ─────────────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default — 3-level chain",
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>godx-admin</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const TwoLevels: Story = {
  name: "Default — 2-level (shallow)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">GoDX</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>Profile</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const Deep: Story = {
  name: "Deep — 5-level chain",
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs">Orgs</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/famgia">famgia</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/famgia/projects/godx-admin">godx-admin</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/famgia/projects/godx-admin/sandboxes">Sandboxes</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>sb-yuki-feat-forge-shell-align</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Variants — icons, current state, plain spans
// ─────────────────────────────────────────────────────────────────────────

export const WithLeadingIcons: Story = {
  name: "Variants — leading icons per crumb",
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">
        <Home size={13} /> Home
      </BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/projects">
        <FolderGit2 size={13} /> Projects
      </BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/projects/godx-admin">
        <Layers size={13} /> godx-admin
      </BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>
        <Settings size={13} /> Settings
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const CurrentOnly: Story = {
  name: "Variants — only the final crumb is current",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem href="/billing">Billing</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>Invoice 2026-05-15</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem>Plain spans</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>(no href → renders &lt;span&gt;)</BreadcrumbItem>
      </Breadcrumb>
    </Flex>
  ),
};

export const LongCrumbNames: Story = {
  name: "Variants — long names (no truncation by default)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb style={{ maxWidth: 720 }}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/famgia/projects">
        プロジェクト一覧（Projects）
      </BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>feat/forge-shell-align — refactor shell to rule 12 Clause 1 + 5</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Custom separators
// ─────────────────────────────────────────────────────────────────────────

const ChevronSep = () => (
  <span aria-hidden="true" className="breadcrumb-sep">
    <ChevronRight size={13} />
  </span>
);

const SlashSep = () => (
  <span aria-hidden="true" className="breadcrumb-sep">
    <Slash size={11} />
  </span>
);

export const CustomSeparators: Story = {
  name: "Variants — custom separator icons",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>
          Default <code>BreadcrumbSep</code> — "/"
        </p>
        <Breadcrumb>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem current>godx-admin</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>
          Custom — <code>ChevronRight</code>
        </p>
        <Breadcrumb>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <ChevronSep />
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <ChevronSep />
          <BreadcrumbItem current>godx-admin</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>
          Custom — <code>Slash</code> icon
        </p>
        <Breadcrumb>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <SlashSep />
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <SlashSep />
          <BreadcrumbItem current>godx-admin</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Truncation (ellipsis pattern — composed manually since BreadcrumbEllipsis isn't an export)
// ─────────────────────────────────────────────────────────────────────────

export const Truncated: Story = {
  name: "Variants — ellipsis for long chains",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "When a chain is 5+ deep, replace the middle crumbs with an ellipsis marker. The pattern is composed from a non-href `BreadcrumbItem` whose label is `…` (and ideally a popover lists the elided crumbs).",
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="#">Home</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem aria-label="More breadcrumbs">
        <MoreHorizontal size={14} />
      </BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="#">Sandboxes</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>sb-yuki-feat-forge-shell-align</BreadcrumbItem>
    </Breadcrumb>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>Profile</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>godx-admin</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="/"><Home size={13} /> Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem href="/projects"><FolderGit2 size={13} /> Projects</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current><Settings size={13} /> Settings</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <ChevronSep />
        <BreadcrumbItem href="#">Sandboxes</BreadcrumbItem>
        <ChevronSep />
        <BreadcrumbItem current>sb-yuki</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem aria-label="More"><MoreHorizontal size={14} /></BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>worktree</BreadcrumbItem>
      </Breadcrumb>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic composition — project detail page header
// ─────────────────────────────────────────────────────────────────────────

export const ProjectDetailHeader: Story = {
  name: "Composition — project detail page header",
  parameters: { controls: { disable: true } },
  render: () => (
    <Card variant="filled" size="default">
      <Flex vertical gap="middle">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            <Home size={13} /> Home
          </BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem href="#">
            <FolderGit2 size={13} /> famgia
          </BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem href="#">
            <Layers size={13} /> godx-admin
          </BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem current>feat/forge-shell-align</BreadcrumbItem>
        </Breadcrumb>
        <Flex align="center" justify="space-between">
          <Flex vertical gap={4}>
            <h2 style={{ margin: 0, fontSize: "var(--text-xl)" }}>
              feat/forge-shell-align
            </h2>
            <Space size="small" split={<Separator orientation="vertical" />} align="center">
              <Tag color="success">active</Tag>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                last sync 2026-05-15
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                12 commits ahead
              </span>
            </Space>
          </Flex>
          <Space size="small">
            <Button size="sm" variant="secondary">Open in VSCode</Button>
            <Button size="sm" variant="primary">Open PR</Button>
          </Space>
        </Flex>
      </Flex>
    </Card>
  ),
};
