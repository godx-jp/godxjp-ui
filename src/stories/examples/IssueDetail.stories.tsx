import type { Meta, StoryObj } from "@storybook/react";
import { IssueDetailScreen } from "./screens/IssueDetailScreen";

/**
 * Usage Cases / Issue Detail — Linear/GitLab-style issue detail page.
 *
 * Two-column layout (conversation/checklist/code/history tabs +
 * sidebar fields) plus a sticky QuickComposer pinned to the page
 * bottom. Composer collapses to 52px and expands on focus with
 * inline status/assignee/priority pill pickers. Composed from
 * `PageHeader`, `Card`, `Avatar`, `Badge`, `Tag`, `IconButton`,
 * `Button`, `Typography`.
 */

const meta: Meta<typeof IssueDetailScreen> = {
  title: "Usage Cases/Issue Detail",
  component: IssueDetailScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof IssueDetailScreen>;

export const Default: Story = {
  render: () => (
    <IssueDetailScreen
      issueId="GK-310"
      onBack={() => {
        // eslint-disable-next-line no-console
        console.log("back");
      }}
      onOpenPlan={(id) => {
        // eslint-disable-next-line no-console
        console.log("open plan", id);
      }}
    />
  ),
};
