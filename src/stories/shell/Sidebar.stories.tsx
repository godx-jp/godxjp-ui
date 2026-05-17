import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import {
  Activity,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Typography } from "../../components/primitives";
import { ProductSwitcher, Sidebar } from "../../components/shell";
import type { SidebarSection } from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/Sidebar — left navigation rail. Sections + nested items +
 * optional product chip at the top + optional footer slot.
 *
 * Per cardinal rule 29 stories compose ONLY framework primitives,
 * shell composites and lucide icons.
 */

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Left nav rail with product chip + grouped section items. " +
          "Width is `--sidebar-width` and respects the collapsed axis.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const SECTIONS: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", icon: FolderGit2, badge: 8 },
      { id: "branches", label: "Branches", icon: GitBranch },
      { id: "issues", label: "Issues", icon: ListChecks, badge: 12 },
      { id: "activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "members", label: "Members", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarFrame({ children }: { children: React.ReactNode }) {
  // Layout-only style — width + height + bg/border to give the
  // story a realistic frame. No visual overrides on the primitive.
  return (
    <div
      style={{
        width: "var(--sidebar-width, 16rem)",
        height: "32rem",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
      }}
    >
      {children}
    </div>
  );
}

const ACTIVE_PRODUCT = PRODUCTS[1];

export const Default: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    return (
      <SidebarFrame>
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          product={ACTIVE_PRODUCT}
        />
      </SidebarFrame>
    );
  },
};

export const Collapsed: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    return (
      <div
        style={{
          width: "var(--sidebar-width-collapsed, 4rem)",
          height: "32rem",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
        }}
      >
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          product={ACTIVE_PRODUCT}
          collapsed
        />
      </div>
    );
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(canvas.queryByText("Dashboard")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Projects")).not.toBeInTheDocument();
    await expect(canvas.queryByText("8")).not.toBeInTheDocument();
  },
};

export const MultipleProducts: Story = {
  name: "With ProductSwitcher",
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    const [productOpen, setProductOpen] = useState(false);
    const [activeProductId, setActiveProductId] = useState(
      ACTIVE_PRODUCT.id,
    );
    const product =
      PRODUCTS.find((p) => p.id === activeProductId) ?? ACTIVE_PRODUCT;

    return (
      <SidebarFrame>
        <ProductSwitcher
          trigger={<span />}
          activeId={activeProductId}
          products={PRODUCTS}
          onSelect={(p) => {
            setActiveProductId(p.id);
            setProductOpen(false);
          }}
          open={productOpen}
          onOpenChange={setProductOpen}
        />
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          product={product}
          onProductClick={() => setProductOpen(true)}
        />
      </SidebarFrame>
    );
  },
};

export const Empty: Story = {
  name: "No product (brand slot)",
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    return (
      <SidebarFrame>
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          brand={
            <Typography.Text strong>No tenant selected</Typography.Text>
          }
        />
      </SidebarFrame>
    );
  },
};
