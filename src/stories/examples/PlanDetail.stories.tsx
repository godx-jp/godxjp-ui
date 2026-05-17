import type { Meta, StoryObj } from "@storybook/react";
import { PlanDetailScreen } from "./screens/PlanDetailScreen";

/**
 * Usage Cases / Plan Detail — PDCA cycle visualizer.
 *
 * Phase-pill navigator (Plan / Do / Check / Act) drives the body
 * view: hypothesis + metrics + risks on Plan, linked tasks table
 * on Do, KPI tiles + sparkline on Check, ADOPT/TRY/DROP/PARK
 * grid on Act. Composed from `PageHeader`, `Card`, `Badge`,
 * `IconButton`, `Typography`.
 */

const meta: Meta<typeof PlanDetailScreen> = {
  title: "Usage Cases/Plan Detail",
  component: PlanDetailScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PlanDetailScreen>;

export const Default: Story = {
  render: () => (
    <PlanDetailScreen
      planId="PDCA-Q2-001"
      onBack={() => {
        // eslint-disable-next-line no-console
        console.log("back");
      }}
      onOpenIssue={(id) => {
        // eslint-disable-next-line no-console
        console.log("open issue", id);
      }}
    />
  ),
};
