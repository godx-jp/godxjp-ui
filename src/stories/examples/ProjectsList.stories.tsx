import type { Meta, StoryObj } from "@storybook/react";
import { ProjectsListScreen } from "./screens/ProjectsListScreen";
import { PRODUCTS } from "./products";

/**
 * Usage Cases / Projects List — every project owning the active
 * product, in the design-system `.table` shape.
 *
 * Row click drills into the project detail surface. Composed from
 * `PageHeader`, `Card` (flush `padding="none"`), `Button`, `Tag`.
 */

const meta: Meta<typeof ProjectsListScreen> = {
  title: "Usage Cases/Projects List",
  component: ProjectsListScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ProjectsListScreen>;

export const Default: Story = {
  render: () => (
    <ProjectsListScreen
      product={PRODUCTS[0]}
      onSelect={(p) => {
        // eslint-disable-next-line no-console
        console.log("select project", p.id);
      }}
    />
  ),
};
