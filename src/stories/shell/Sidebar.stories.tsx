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

const FRAME_STYLE = {
  width: "var(--sidebar-width, 16rem)",
  height: "32rem",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid var(--border)",
  background: "var(--sidebar-bg)",
} as const;

const ACTIVE_PRODUCT = PRODUCTS[1];

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react"
import {
  Activity,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react"
import { Sidebar, type ForgeProduct, type SidebarSection } from "@godxjp/ui"

const sections: SidebarSection[] = [
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
]

const activeProduct: ForgeProduct = {
  id: "godx",
  name: "godx-admin",
  tenant: "godx",
  role: "Platform admin",
  desc: "GoDX Forge developer workspace",
  color: "oklch(60% 0.137 163)",
  owner: "Satoshi F",
  devs: 4,
  projects: [],
}

export function SidebarExample() {
  const [activeId, setActiveId] = useState("dashboard")

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
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        sections={sections}
        product={activeProduct}
      />
    </div>
  )
}`,
      },
    },
  },
  render: function Default() {
    const [activeId, setActiveId] = useState("dashboard");
    return (
      <div style={FRAME_STYLE}>
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          product={ACTIVE_PRODUCT}
        />
      </div>
    );
  },
};

export const Collapsed: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react"
import {
  Activity,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react"
import { Sidebar, type ForgeProduct, type SidebarSection } from "@godxjp/ui"

const sections: SidebarSection[] = [
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
]

const activeProduct: ForgeProduct = {
  id: "godx",
  name: "godx-admin",
  tenant: "godx",
  role: "Platform admin",
  desc: "GoDX Forge developer workspace",
  color: "oklch(60% 0.137 163)",
  owner: "Satoshi F",
  devs: 4,
  projects: [],
}

export function CollapsedSidebarExample() {
  const [activeId, setActiveId] = useState("dashboard")

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
        sections={sections}
        product={activeProduct}
        collapsed
      />
    </div>
  )
}`,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react"
import {
  Activity,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react"
import {
  ProductSwitcher,
  Sidebar,
  type ForgeProduct,
  type SidebarSection,
} from "@godxjp/ui"

const sections: SidebarSection[] = [
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
]

const products: ForgeProduct[] = [
  {
    id: "restaurant",
    name: "godx-restaurant",
    tenant: "restaurant",
    role: "レストラン管理",
    desc: "店舗向け統合管理プラットフォーム",
    color: "oklch(58% 0.18 25)",
    owner: "Satoshi F",
    devs: 6,
    projects: [],
  },
  {
    id: "godx",
    name: "godx-admin",
    tenant: "godx",
    role: "Platform admin",
    desc: "GoDX Forge developer workspace",
    color: "oklch(60% 0.137 163)",
    owner: "Satoshi F",
    devs: 4,
    projects: [],
  },
  {
    id: "kintai",
    name: "dxs-kintai",
    tenant: "kintai",
    role: "HR / Attendance",
    desc: "勤怠管理プラットフォーム",
    color: "oklch(56% 0.15 240)",
    owner: "Naoki N",
    devs: 3,
    projects: [],
  },
]

const activeProduct = products[1]

export function ProductSidebarExample() {
  const [activeId, setActiveId] = useState("dashboard")
  const [productOpen, setProductOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState(activeProduct.id)
  const product =
    products.find((item) => item.id === activeProductId) ?? activeProduct

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
      <ProductSwitcher
        trigger={<span />}
        activeId={activeProductId}
        products={products}
        onSelect={(nextProduct) => {
          setActiveProductId(nextProduct.id)
          setProductOpen(false)
        }}
        open={productOpen}
        onOpenChange={setProductOpen}
      />
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        sections={sections}
        product={product}
        onProductClick={() => setProductOpen(true)}
      />
    </div>
  )
}`,
      },
    },
  },
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    const [productOpen, setProductOpen] = useState(false);
    const [activeProductId, setActiveProductId] = useState(
      ACTIVE_PRODUCT.id,
    );
    const product =
      PRODUCTS.find((p) => p.id === activeProductId) ?? ACTIVE_PRODUCT;

    return (
      <div style={FRAME_STYLE}>
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
      </div>
    );
  },
};

export const Empty: Story = {
  name: "No product (brand slot)",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react"
import {
  Activity,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react"
import { Sidebar, Typography, type SidebarSection } from "@godxjp/ui"

const sections: SidebarSection[] = [
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
]

export function SidebarBrandExample() {
  const [activeId, setActiveId] = useState("dashboard")

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
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        sections={sections}
        brand={
          <Typography.Text strong>No tenant selected</Typography.Text>
        }
      />
    </div>
  )
}`,
      },
    },
  },
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    return (
      <div style={FRAME_STYLE}>
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          sections={SECTIONS}
          brand={
            <Typography.Text strong>No tenant selected</Typography.Text>
          }
        />
      </div>
    );
  },
};
