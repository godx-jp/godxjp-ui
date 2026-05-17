import type { Meta, StoryObj } from "@storybook/react";
import { IdeasScreen } from "./screens/IdeasScreen";

/**
 * Usage Cases / Ideas Board — Shape Up-style idea pitch surface.
 *
 * Three-up card grid of pitched ideas with status, appetite, and
 * vote count. Composed from `PageHeader`, `Card`, `Badge`, `Tag`,
 * `Typography`, `Button`.
 */

const meta: Meta<typeof IdeasScreen> = {
  title: "Usage Cases/Ideas Board",
  component: IdeasScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof IdeasScreen>;

export const Default: Story = {
  render: () => <IdeasScreen />,
};
