import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Save, Trash2 } from "lucide-react";
import { PageContent } from "../components/shell/PageContent";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/primitives/Tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSep,
} from "../components/primitives/Breadcrumb";

const meta: Meta<typeof PageContent> = {
  title: "Shell/PageContent",
  component: PageContent,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`PageContent\` is the canonical page container mounted inside
\`AppShell\`'s main slot. Inspired by Ant Design's PageContainer, it
encodes the **title block + content + footer** rhythm so every screen
in every service feels alike.

### Slots & props

- \`title\` — \`<h1>\` for the page.
- \`subtitle\` — short descriptor under the title.
- \`breadcrumb\` — rail above the title block.
- \`extra\` — right-aligned action slot (primary buttons).
- \`tabs\` — tabs row rendered between the title block and content.
- \`children\` — main content.
- \`footer\` — sticky-feeling band under content.
- \`padding\` — \`"compact" | "default" | "comfortable" | "none"\`.
- \`header\` — \`"default" | "none"\` to skip the title block entirely.

### Tokens

\`padding\` resolves to \`--density-page\` via a CSS attribute selector
(\`[data-padding="default"]\`). Density flips driven by \`useTweaks\` flow
through the same token, so compact/comfortable adjust without prop
changes.
        `,
      },
    },
  },
  argTypes: {
    padding: {
      control: { type: "inline-radio" },
      options: ["compact", "default", "comfortable", "none"],
    },
    header: {
      control: { type: "inline-radio" },
      options: ["default", "none"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageContent>;

export const TitleOnly: Story = {
  args: {
    title: "Profile",
  },
};

export const TitleSubtitle: Story = {
  name: "Title + subtitle",
  args: {
    title: "Profile",
    subtitle: "Display name, avatar, pronouns, locale, timezone",
  },
};

export const WithBreadcrumb: Story = {
  name: "Breadcrumb + title",
  args: {
    title: "frontend",
    subtitle: "React · Vite · @godxjp/ui",
    breadcrumb: (
      <Breadcrumb>
        <BreadcrumbItem href="#">godx-admin</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>frontend</BreadcrumbItem>
      </Breadcrumb>
    ),
  },
};

export const WithExtraActions: Story = {
  name: "extra · primary actions",
  args: {
    title: "Settings",
    subtitle: "Personal preferences and account security",
    extra: (
      <>
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
        <Button size="sm">
          <Save size={14} />
          Save
        </Button>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    title: "Compose issue",
    subtitle: "Describe what's wrong; attach screenshots if helpful.",
    children: (
      <Card>
        <p>Issue body editor goes here.</p>
      </Card>
    ),
    footer: (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="secondary" size="sm">
          Discard
        </Button>
        <Button size="sm">
          <Plus size={14} />
          Submit
        </Button>
      </div>
    ),
  },
};

export const WithTabs: Story = {
  name: "Tabs row",
  args: {
    title: "godx-admin-api",
    subtitle: "Go · Gin · master",
    tabs: (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="prs">Pull requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" />
      </Tabs>
    ),
  },
};

export const CardGrid: Story = {
  name: "Multiple cards in body",
  args: {
    title: "Dashboard",
    subtitle: "Restaurant operations · last 7 days",
    children: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Orders", value: "1,284" },
          { label: "Revenue", value: "¥3.6M" },
          { label: "Avg ticket", value: "¥2,820" },
          { label: "Refunds", value: "0.4%" },
        ].map((s) => (
          <Card key={s.label} title={s.label}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
          </Card>
        ))}
      </div>
    ),
  },
};

export const CompactPadding: Story = {
  args: {
    title: "Compact",
    subtitle: "padding=compact · 12 px @ default density",
    padding: "compact",
    children: <Card>Body in compact padding.</Card>,
  },
};

export const ComfortablePadding: Story = {
  args: {
    title: "Comfortable",
    subtitle: "padding=comfortable · 20 px @ default density",
    padding: "comfortable",
    children: <Card>Body in comfortable padding.</Card>,
  },
};

export const NoPadding: Story = {
  name: "padding=none (full-bleed)",
  args: {
    title: "Editor canvas",
    subtitle: "padding=none for full-bleed views.",
    padding: "none",
    children: (
      <div style={{ height: 240, background: "var(--surface-3)", display: "grid", placeItems: "center" }}>
        full-bleed canvas
      </div>
    ),
  },
};

export const NoHeader: Story = {
  name: "header=none (custom header in body)",
  args: {
    header: "none",
    children: (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: 0 }}>Custom hero (page renders its own)</h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          When <code>header=none</code> the canonical title block is skipped.
        </p>
      </div>
    ),
  },
};

export const Everything: Story = {
  name: "Every slot wired",
  args: {
    title: "frontend",
    subtitle: "React · Vite · @godxjp/ui · branch master",
    breadcrumb: (
      <Breadcrumb>
        <BreadcrumbItem href="#">godx-admin</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbSep />
        <BreadcrumbItem current>frontend</BreadcrumbItem>
      </Breadcrumb>
    ),
    extra: (
      <>
        <Button variant="secondary" size="sm">
          Share
        </Button>
        <Button size="sm">New issue</Button>
      </>
    ),
    tabs: (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" />
      </Tabs>
    ),
    children: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        <Card title="Issues">2 open · 4 closed this week</Card>
        <Card title="Pull requests">1 open · 0 merged</Card>
      </div>
    ),
    footer: (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="danger" size="sm">
          <Trash2 size={14} />
          Archive
        </Button>
        <Button size="sm">Save changes</Button>
      </div>
    ),
  },
};

export const MobileNarrow: Story = {
  name: "Mobile narrow viewport",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    title: "Mobile view",
    subtitle: "Title block stacks naturally; actions wrap.",
    extra: (
      <>
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </>
    ),
    children: <Card>Body content.</Card>,
  },
};

export const Playground: Story = {
  args: {
    title: "Playground",
    subtitle: "Edit args via the Controls panel.",
    padding: "default",
    header: "default",
    children: <Card>Drag the controls.</Card>,
  },
};
