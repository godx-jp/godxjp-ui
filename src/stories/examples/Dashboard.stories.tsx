import type { Meta, StoryObj } from "@storybook/react";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PRODUCTS } from "./products";

/**
 * Usage Cases / Dashboard — product-level dashboard surface.
 *
 * KPI strip + recent activity feed + quick actions, composed from
 * framework primitives (`PageHeader`, `Card`, `Button`) plus
 * documented atom CSS classes (`.kpi`, `.log-line`).
 *
 * Per cardinal rule 29: every visual atom in this story consumes
 * a framework primitive or a documented atom CSS class. The screen
 * file is the canonical reference for consumers building their
 * own product dashboards.
 */

const meta: Meta<typeof DashboardScreen> = {
  title: "Usage Cases/Dashboard",
  component: DashboardScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DashboardScreen>;

export const Default: Story = {
  render: () => <DashboardScreen product={PRODUCTS[0]} />,
};
