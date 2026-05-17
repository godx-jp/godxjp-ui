import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "../../components/primitives";
import {
  ProductSwitcher,
  ProjectSwitcher,
  Topbar,
} from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/Topbar — top app bar with product/project chips, search
 * shortcut, notifications bell, tweaks button + user slot.
 *
 * Per cardinal rule 29 only framework primitives + shell composites
 * appear in stories.
 */

const meta: Meta<typeof Topbar> = {
  title: "Shell/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Top bar rail. Hosts product/project chips, ⌘K search, " +
          "notifications, tweaks drawer, and a user slot.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Topbar>;

const ACTIVE_PRODUCT = PRODUCTS[1];
const ACTIVE_PROJECT = ACTIVE_PRODUCT.projects[0];

function TopbarFrame({ children }: { children: React.ReactNode }) {
  // Layout-only frame: full-width rail, fixed height, border.
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        height: "var(--header-height, 3rem)",
        padding: "0 var(--spacing-3)",
        borderBottom: "1px solid var(--border)",
        background: "var(--background)",
        width: "100%",
      }}
    >
      {children}
    </header>
  );
}

export const Default: Story = {
  render: () => (
    <TopbarFrame>
      <Topbar
        product={ACTIVE_PRODUCT}
        project={ACTIVE_PROJECT}
        onSearchOpen={() => undefined}
        onTweaksOpen={() => undefined}
      />
    </TopbarFrame>
  ),
};

export const WithProductSwitcher: Story = {
  render: () => {
    const [productOpen, setProductOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    const [productId, setProductId] = useState(ACTIVE_PRODUCT.id);
    const [projectId, setProjectId] = useState(ACTIVE_PROJECT.id);

    const product =
      PRODUCTS.find((p) => p.id === productId) ?? ACTIVE_PRODUCT;
    const project =
      product.projects.find((p) => p.id === projectId) ?? product.projects[0];

    return (
      <TopbarFrame>
        <ProductSwitcher
          trigger={<span />}
          activeId={productId}
          products={PRODUCTS}
          onSelect={(p) => {
            setProductId(p.id);
            setProjectId(p.projects[0]?.id ?? "");
            setProductOpen(false);
          }}
          open={productOpen}
          onOpenChange={setProductOpen}
        />
        <ProjectSwitcher
          trigger={<span />}
          activeProductId={productId}
          activeProjectId={projectId}
          products={PRODUCTS}
          onSelect={(pr, p) => {
            setProductId(p.id);
            setProjectId(pr.id);
            setProjectOpen(false);
          }}
          open={projectOpen}
          onOpenChange={setProjectOpen}
        />
        <Topbar
          product={product}
          project={project}
          onProductOpen={() => setProductOpen(true)}
          onProjectOpen={() => setProjectOpen(true)}
          onSearchOpen={() => undefined}
          onTweaksOpen={() => undefined}
        />
      </TopbarFrame>
    );
  },
};

export const WithSearch: Story = {
  name: "With search (⌘K)",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={ACTIVE_PRODUCT}
        project={ACTIVE_PROJECT}
        onSearchOpen={() => undefined}
      />
    </TopbarFrame>
  ),
};

export const WithNotifications: Story = {
  name: "With notifications (unread)",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={ACTIVE_PRODUCT}
        project={ACTIVE_PROJECT}
        onSearchOpen={() => undefined}
        onTweaksOpen={() => undefined}
        onNotificationsOpen={() => undefined}
        unread
        user={<Avatar size="sm" alt="Satoshi" />}
      />
    </TopbarFrame>
  ),
};
