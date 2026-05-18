import type { Meta, StoryObj } from "@storybook/react";
import {
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Avatar, Button, Typography } from "../../components/primitives";
import {
  AppShell,
  PageContent,
  ProductSwitcher,
  ProjectSwitcher,
  Sidebar,
  Topbar,
} from "../../components/shell";
import type { SidebarSection } from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/AppShell — canonical chrome layout (grid: sidebar / topbar /
 * main / footer).
 *
 * Per cardinal rule 29 every example below composes ONLY framework
 * primitives + shell composites + lucide icons — no raw HTML buttons /
 * inline-styled chrome / one-off divs.
 */

const meta: Meta<typeof AppShell> = {
  title: "Shell/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Root shell wrapper. Slot-based composition — sidebar, " +
          "topbar, breadcrumb, footer all swap independently. Every " +
          "GoDX service composes this; no service hand-rolls the grid.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const SECTIONS: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", icon: FolderGit2, badge: 8 },
      { id: "branches", label: "Branches", icon: GitBranch },
      { id: "issues", label: "Issues", icon: ListChecks, badge: 12 },
    ],
  },
  {
    label: "Admin",
    items: [{ id: "settings", label: "Settings", icon: Settings }],
  },
];

const ACTIVE_PRODUCT = PRODUCTS[1]; // godx
const ACTIVE_PROJECT = ACTIVE_PRODUCT.projects[0];

export const Default: Story = {
  render: function Default() {
    const [activeId, setActiveId] = useState("dashboard");
    const [productOpen, setProductOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    return (
      <AppShell
        sidebar={
          <Sidebar
            activeId={activeId}
            onSelect={setActiveId}
            sections={SECTIONS}
            product={ACTIVE_PRODUCT}
            onProductClick={() => setProductOpen(true)}
          />
        }
        topbar={
          <>
            <ProductSwitcher
              trigger={<span />}
              activeId={ACTIVE_PRODUCT.id}
              products={PRODUCTS}
              onSelect={() => setProductOpen(false)}
              open={productOpen}
              onOpenChange={setProductOpen}
            />
            <ProjectSwitcher
              trigger={<span />}
              activeProductId={ACTIVE_PRODUCT.id}
              activeProjectId={ACTIVE_PROJECT.id}
              products={PRODUCTS}
              onSelect={() => setProjectOpen(false)}
              open={projectOpen}
              onOpenChange={setProjectOpen}
            />
            <Topbar
              product={ACTIVE_PRODUCT}
              project={ACTIVE_PROJECT}
              onProductOpen={() => setProductOpen(true)}
              onProjectOpen={() => setProjectOpen(true)}
              onSearchOpen={() => undefined}
              onTweaksOpen={() => undefined}
              user={<Avatar size="sm" alt="Satoshi" />}
            />
          </>
        }
      >
        <PageContent
          title="Dashboard"
          subtitle="Workspace activity, KPIs, and recent commits"
          extra={<Button variant="primary">New issue</Button>}
        >
          <Typography.Paragraph>
            Main content area. Pages drop their content here — KPI tiles,
            tables, kanban boards. The shell handles every chrome region.
          </Typography.Paragraph>
        </PageContent>
      </AppShell>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("sidebar + topbar landmarks render", async () => {
      const navs = canvas.getAllByRole("navigation");
      await expect(navs.length).toBeGreaterThan(0);
      const banners = canvas.getAllByRole("banner");
      await expect(banners.length).toBeGreaterThan(0);
    });
  },
};

export const WithFooter: Story = {
  name: "With footer band",
  render: function WithFooter() {
    const [activeId, setActiveId] = useState("dashboard");
    const [productOpen, setProductOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    return (
      <AppShell
        sidebar={
          <Sidebar
            activeId={activeId}
            onSelect={setActiveId}
            sections={SECTIONS}
            product={ACTIVE_PRODUCT}
            onProductClick={() => setProductOpen(true)}
          />
        }
        topbar={
          <>
            <ProductSwitcher
              trigger={<span />}
              activeId={ACTIVE_PRODUCT.id}
              products={PRODUCTS}
              onSelect={() => setProductOpen(false)}
              open={productOpen}
              onOpenChange={setProductOpen}
            />
            <ProjectSwitcher
              trigger={<span />}
              activeProductId={ACTIVE_PRODUCT.id}
              activeProjectId={ACTIVE_PROJECT.id}
              products={PRODUCTS}
              onSelect={() => setProjectOpen(false)}
              open={projectOpen}
              onOpenChange={setProjectOpen}
            />
            <Topbar
              product={ACTIVE_PRODUCT}
              project={ACTIVE_PROJECT}
              onProductOpen={() => setProductOpen(true)}
              onProjectOpen={() => setProjectOpen(true)}
              onSearchOpen={() => undefined}
              onTweaksOpen={() => undefined}
              user={<Avatar size="sm" alt="Satoshi" />}
            />
          </>
        }
        footer={
          <Typography.Text color="secondary">
            © 2026 GoDX Forge · build {ACTIVE_PROJECT.lastCommit}
          </Typography.Text>
        }
      >
        <PageContent
          title="Dashboard"
          subtitle="Workspace activity, KPIs, and recent commits"
          extra={<Button variant="primary">New issue</Button>}
        >
          <Typography.Paragraph>
            Main content area. Pages drop their content here — KPI tiles,
            tables, kanban boards. The shell handles every chrome region.
          </Typography.Paragraph>
        </PageContent>
      </AppShell>
    );
  },
};

export const Collapsed: Story = {
  name: "Sidebar collapsed",
  render: function Collapsed() {
    const [activeId, setActiveId] = useState("dashboard");
    const [productOpen, setProductOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    return (
      <AppShell
        sidebarCollapsed
        sidebar={
          <Sidebar
            activeId={activeId}
            onSelect={setActiveId}
            sections={SECTIONS}
            product={ACTIVE_PRODUCT}
            onProductClick={() => setProductOpen(true)}
            collapsed
          />
        }
        topbar={
          <>
            <ProductSwitcher
              trigger={<span />}
              activeId={ACTIVE_PRODUCT.id}
              products={PRODUCTS}
              onSelect={() => setProductOpen(false)}
              open={productOpen}
              onOpenChange={setProductOpen}
            />
            <ProjectSwitcher
              trigger={<span />}
              activeProductId={ACTIVE_PRODUCT.id}
              activeProjectId={ACTIVE_PROJECT.id}
              products={PRODUCTS}
              onSelect={() => setProjectOpen(false)}
              open={projectOpen}
              onOpenChange={setProjectOpen}
            />
            <Topbar
              product={ACTIVE_PRODUCT}
              project={ACTIVE_PROJECT}
              onProductOpen={() => setProductOpen(true)}
              onProjectOpen={() => setProjectOpen(true)}
              onSearchOpen={() => undefined}
              onTweaksOpen={() => undefined}
              user={<Avatar size="sm" alt="Satoshi" />}
            />
          </>
        }
      >
        <PageContent
          title="Dashboard"
          subtitle="Workspace activity, KPIs, and recent commits"
          extra={<Button variant="primary">New issue</Button>}
        >
          <Typography.Paragraph>
            Main content area. Pages drop their content here — KPI tiles,
            tables, kanban boards. The shell handles every chrome region.
          </Typography.Paragraph>
        </PageContent>
      </AppShell>
    );
  },
};
