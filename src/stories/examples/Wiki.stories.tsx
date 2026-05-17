import type { Meta, StoryObj } from "@storybook/react";
import { WikiScreen } from "./screens/WikiScreen";

/**
 * Usage Cases / Wiki — three-column wiki layout (TOC · prose · meta).
 *
 * The `.prose` body renders raw HTML standing in for
 * markdown-rendered output; consumers swap in their markdown
 * renderer via `children`. Composed from `PageHeader` + `Button`
 * plus the `.wiki-layout` / `.wiki-toc` / `.prose` design atoms.
 */

const meta: Meta<typeof WikiScreen> = {
  title: "Usage Cases/Wiki",
  component: WikiScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof WikiScreen>;

export const Default: Story = {
  render: () => <WikiScreen />,
};
