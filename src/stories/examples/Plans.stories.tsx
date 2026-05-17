import type { Meta, StoryObj } from "@storybook/react";
import { PlansScreen } from "./screens/PlansScreen";

/**
 * Usage Cases / Plans — PDCA plan listing.
 *
 * Two-column card grid of in-flight PDCA plans with phase, health,
 * owner, due date, and progress bar. Composed from `PageHeader`,
 * `Badge`, `Typography`, `Button`. The clickable `.card` is a
 * documented design atom for button-shaped cards.
 */

const meta: Meta<typeof PlansScreen> = {
  title: "Usage Cases/Plans",
  component: PlansScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PlansScreen>;

export const Default: Story = {
  render: () => (
    <PlansScreen
      onOpenPlan={(id) => {
        // eslint-disable-next-line no-console
        console.log("open plan", id);
      }}
    />
  ),
};
