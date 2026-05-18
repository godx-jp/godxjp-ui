import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import {
  Button,
  Card,
  Tabs,
  Typography,
} from "../../components/primitives";
import { Breadcrumb } from "../../components/navigation/Breadcrumb";
import { PageContent } from "../../components/shell";

/**
 * Shell/PageContent — canonical page container (title + subtitle +
 * breadcrumb + extra + tabs + body + footer).
 *
 * Per cardinal rule 29 every story uses framework primitives —
 * Typography, Card, Button, Tabs, Breadcrumb — no raw HTML chrome.
 */

const meta: Meta<typeof PageContent> = {
  title: "Shell/PageContent",
  component: PageContent,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Canonical page container inside <AppShell>. Title, subtitle, " +
          "breadcrumb, extra actions, tabs subnav, body, footer — every " +
          "slot is optional. Padding step is system-wide via " +
          "`--density-page`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageContent>;

const BREADCRUMB = (
  <Breadcrumb
    items={[
      { href: "/", label: "Workspace" },
      { href: "/projects", label: "Projects" },
      { current: true, label: "godx-admin-frontend" },
    ]}
  />
);

export const Default: Story = {
  render: () => (
    <PageContent
      title="Project overview"
      subtitle="Repository activity, branches, open issues"
      breadcrumb={BREADCRUMB}
    >
      <Card title="Recent activity">
        <Typography.Paragraph>
          14 commits today across 3 branches. Last build passed at
          12:42.
        </Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const WithExtra: Story = {
  name: "With extra actions",
  render: () => (
    <PageContent
      title="Project overview"
      subtitle="Repository activity, branches, open issues"
      breadcrumb={BREADCRUMB}
      extra={
        <>
          <Button variant="outline">Export</Button>
          <Button variant="primary" startContent={<Plus size={14} />}>
            New issue
          </Button>
        </>
      }
    >
      <Card title="Recent activity">
        <Typography.Paragraph>
          Action buttons are right-aligned in the header titlebar.
        </Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const WithTabs: Story = {
  name: "With tabs subnav",
  render: () => (
    <PageContent
      title="Project overview"
      subtitle="Repository activity, branches, open issues"
      breadcrumb={BREADCRUMB}
      tabs={
        <Tabs
          defaultValue="overview"
          items={[
            { value: "overview", label: "Overview" },
            { value: "branches", label: "Branches" },
            { value: "issues", label: "Issues" },
            { value: "settings", label: "Settings" },
          ]}
        />
      }
    >
      <Card title="Overview">
        <Typography.Paragraph>
          Tab content renders below the subnav.
        </Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const Tight: Story = {
  name: "Padding · tight",
  render: () => (
    <PageContent
      title="Tight padding"
      subtitle={'padding="tight" — minimal gutter for dashboards'}
      padding="tight"
    >
      <Card title="Body">
        <Typography.Paragraph>12px page padding.</Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const Cozy: Story = {
  name: "Padding · cozy",
  render: () => (
    <PageContent
      title="Cozy padding"
      subtitle={'padding="cozy" — relaxed gutter for forms'}
      padding="cozy"
    >
      <Card title="Body">
        <Typography.Paragraph>20px page padding.</Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const NoPadding: Story = {
  name: "Padding · none (full-bleed)",
  render: () => (
    <PageContent
      title="Full-bleed canvas"
      subtitle={'padding="none" — editors, kanban boards'}
      padding="none"
    >
      <Card title="Body">
        <Typography.Paragraph>
          Page chrome rendered, but the body has no padding so children
          touch the edges.
        </Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};

export const WithFooter: Story = {
  name: "With page footer",
  render: () => (
    <PageContent
      title="Edit profile"
      subtitle="Display name, avatar, pronouns"
      breadcrumb={BREADCRUMB}
      footer={
        <>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </>
      }
    >
      <Card title="Profile">
        <Typography.Paragraph>
          Footer band hosts page-level form actions.
        </Typography.Paragraph>
      </Card>
    </PageContent>
  ),
};
