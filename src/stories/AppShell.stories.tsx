import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Bell,
  Folder,
  Home,
  Inbox,
  LayoutGrid,
  Search as SearchIcon,
  Settings,
  Users,
} from "lucide-react";
import { AppShell } from "../components/shell/AppShell";
import { Sidebar } from "../components/shell/Sidebar";
import { Topbar } from "../components/shell/Topbar";
import { PageContent } from "../components/shell/PageContent";
import { CommandPalette } from "../components/shell/CommandPalette";
import { ProductSwitcher } from "../components/shell/ProductSwitcher";
import { ProjectSwitcher } from "../components/shell/ProjectSwitcher";
import { TweaksPanel } from "../components/shell/TweaksPanel";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSep } from "../components/primitives/Breadcrumb";
import { PRODUCTS } from "../data/products";

const meta: Meta<typeof AppShell> = {
  title: "Shell/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`AppShell\` is the canonical chrome layout every GoDX service mounts at
its router root. It owns the **grid** — sidebar (collapsible) + topbar +
main scroll area + optional breadcrumb rail + optional footer band —
and nothing else. Per CLAUDE.md hard rule #15 + rule 12 Clause 1 no
service hand-rolls this layout.

### Slots

| Slot | Purpose |
|---|---|
| \`sidebar\` | Usually \`<Sidebar … />\` from this package. |
| \`topbar\` | Single composed header (e.g. \`<Topbar … />\`). Wins over the split slots when present. |
| \`topbarLeft\` / \`topbarRight\` | Two-slot fallback when no composed \`topbar\` is supplied. |
| \`logo\` | Brand mark in the topbar's top-left (split-slot mode only). |
| \`breadcrumb\` | Optional rail just above main content. |
| \`children\` | Main content — typically \`<PageContent>\` or a router \`<Outlet />\`. |
| \`footer\` | Optional footer band under main. |

### State

\`sidebarCollapsed\` mirrors onto \`<html data-collapsed>\` via the
\`useTweaks\` hook so density / chrome CSS reacts in pure CSS.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "inbox", label: "Inbox", icon: Inbox, badge: 12 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "projects", label: "Projects", icon: Folder, badge: 4 },
      { id: "people", label: "People", icon: Users },
      { id: "apps", label: "Apps", icon: LayoutGrid },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export const SkeletonShell: Story = {
  name: "Skeleton · minimal slots",
  render: () => (
    <AppShell
      sidebar={<div style={{ padding: 16, fontSize: 12 }}>sidebar slot</div>}
    >
      <PageContent title="Skeleton" subtitle="Sidebar + main only.">
        Main content goes here.
      </PageContent>
    </AppShell>
  ),
};

export const SplitTopbarSlots: Story = {
  name: "Topbar · split slots (logo + left + right)",
  render: () => (
    <AppShell
      sidebar={<div style={{ padding: 16, fontSize: 12 }}>sidebar</div>}
      logo={<strong style={{ fontSize: 13 }}>GoDX</strong>}
      topbarLeft={<Button size="sm" variant="ghost"><SearchIcon size={14} />Search</Button>}
      topbarRight={
        <>
          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell size={14} />
            <Badge>3</Badge>
          </Button>
          <Avatar>SF</Avatar>
        </>
      }
    >
      <PageContent title="Split topbar" subtitle="logo + topbarLeft + topbarRight slots." />
    </AppShell>
  ),
};

export const WithBreadcrumb: Story = {
  name: "With breadcrumb rail",
  render: () => (
    <AppShell
      sidebar={<div style={{ padding: 16, fontSize: 12 }}>sidebar</div>}
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem href="#">godx-admin</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem current>frontend</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PageContent>Main content with a breadcrumb rail above it.</PageContent>
    </AppShell>
  ),
};

export const WithFooter: Story = {
  name: "With footer band",
  render: () => (
    <AppShell
      sidebar={<div style={{ padding: 16, fontSize: 12 }}>sidebar</div>}
      footer={
        <div style={{ fontSize: 11, padding: "8px 16px", color: "var(--muted-foreground)" }}>
          © 2026 GoDX · v3.0.0 · ja-JP
        </div>
      }
    >
      <PageContent title="Footer demo" />
    </AppShell>
  ),
};

export const CollapsedSidebar: Story = {
  name: "Sidebar · collapsed",
  render: () => (
    <AppShell
      sidebarCollapsed
      sidebar={
        <Sidebar
          collapsed
          activeId="home"
          onSelect={() => {}}
          sections={SECTIONS}
          product={PRODUCTS[0]}
        />
      }
    >
      <PageContent title="Collapsed sidebar" subtitle="data-collapsed=true on .app-root." />
    </AppShell>
  ),
};

export const ComposedTopbar: Story = {
  name: "Topbar · composed (<Topbar … />)",
  render: () => (
    <AppShell
      sidebar={
        <Sidebar
          activeId="home"
          onSelect={() => {}}
          sections={SECTIONS}
          product={PRODUCTS[0]}
        />
      }
      topbar={
        <Topbar
          product={PRODUCTS[0]}
          project={PRODUCTS[0].projects[0]}
          onProductOpen={() => {}}
          onProjectOpen={() => {}}
          onSearchOpen={() => {}}
          onTweaksOpen={() => {}}
        />
      }
    >
      <PageContent title="Composed topbar" />
    </AppShell>
  ),
};

export const MobileNarrow: Story = {
  name: "Mobile narrow viewport",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <AppShell
      sidebar={
        <Sidebar
          activeId="home"
          onSelect={() => {}}
          sections={SECTIONS}
          product={PRODUCTS[0]}
        />
      }
      topbar={
        <Topbar
          product={PRODUCTS[0]}
          project={PRODUCTS[0].projects[0]}
          onProductOpen={() => {}}
          onProjectOpen={() => {}}
          onSearchOpen={() => {}}
        />
      }
    >
      <PageContent title="Narrow" subtitle="Test the collapsed layout at small widths." />
    </AppShell>
  ),
};

// The showpiece: every shell piece wired together with working state.
export const FullShellComposition: Story = {
  name: "Full shell · everything wired",
  render: () => {
    function Demo() {
      const [activeProductId, setActiveProductId] = useState("restaurant");
      const [activeProjectId, setActiveProjectId] = useState("api");
      const [activeNavId, setActiveNavId] = useState("home");
      const [paletteOpen, setPaletteOpen] = useState(false);
      const [tweaksOpen, setTweaksOpen] = useState(false);
      const [productOpen, setProductOpen] = useState(false);
      const [projectOpen, setProjectOpen] = useState(false);
      const [collapsed, setCollapsed] = useState(false);

      const product = PRODUCTS.find((p) => p.id === activeProductId) ?? PRODUCTS[0];
      const project =
        product.projects.find((p) => p.id === activeProjectId) ?? product.projects[0];

      return (
        <>
          <AppShell
            sidebarCollapsed={collapsed}
            sidebar={
              <Sidebar
                collapsed={collapsed}
                activeId={activeNavId}
                onSelect={setActiveNavId}
                sections={SECTIONS}
                product={product}
                onProductClick={() => setProductOpen(true)}
              />
            }
            topbar={
              <Topbar
                product={product}
                project={project}
                collapsed={collapsed}
                onToggleCollapsed={() => setCollapsed((c) => !c)}
                onProductOpen={() => setProductOpen(true)}
                onProjectOpen={() => setProjectOpen(true)}
                onSearchOpen={() => setPaletteOpen(true)}
                onTweaksOpen={() => setTweaksOpen(true)}
                rightSlot={
                  <Button variant="ghost" size="sm" aria-label="Notifications">
                    <Bell size={14} />
                    <Badge>3</Badge>
                  </Button>
                }
              />
            }
          >
            <PageContent
              title={project.name}
              subtitle={`${project.stack} · ${project.devs} devs · ${project.openIssues} open`}
              extra={
                <>
                  <Button variant="secondary" size="sm">Share</Button>
                  <Button size="sm">New issue</Button>
                </>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                {[
                  { label: "Open issues", value: project.openIssues },
                  { label: "Open PRs", value: project.prs },
                  { label: "Devs", value: project.devs },
                  { label: "Branch", value: project.branch },
                ].map((s) => (
                  <Card key={s.label} title={s.label}>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
                  </Card>
                ))}
              </div>
            </PageContent>
          </AppShell>

          {/* Switchers + palette + tweaks panel — all overlay portals. */}
          <ProductSwitcher
            trigger={<span style={{ display: "none" }} />}
            open={productOpen}
            onOpenChange={setProductOpen}
            activeId={activeProductId}
            onSelect={(p) => {
              setActiveProductId(p.id);
              setProductOpen(false);
            }}
          />
          <ProjectSwitcher
            trigger={<span style={{ display: "none" }} />}
            open={projectOpen}
            onOpenChange={setProjectOpen}
            activeProductId={activeProductId}
            activeProjectId={activeProjectId}
            onSelect={(proj, prod) => {
              setActiveProductId(prod.id);
              setActiveProjectId(proj.id);
              setProjectOpen(false);
            }}
          />
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            commands={[
              { id: "new-issue", label: "New issue", group: "Actions", onSelect: () => {} },
              { id: "open-pr", label: "Open pull request", group: "Actions", onSelect: () => {} },
              { id: "go-projects", label: "Go to Projects", group: "Navigation", onSelect: () => setActiveNavId("projects") },
              { id: "go-people", label: "Go to People", group: "Navigation", hint: "g p", onSelect: () => setActiveNavId("people") },
            ]}
          />
          <TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
        </>
      );
    }
    return <Demo />;
  },
};
