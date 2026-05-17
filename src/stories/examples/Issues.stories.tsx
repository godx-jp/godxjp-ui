import type { Meta, StoryObj } from "@storybook/react";
import { IssuesScreen } from "./screens/IssuesScreen";

/**
 * Usage Cases / Issues — Kanban-style issue board.
 *
 * Four-column Kanban (Backlog / In progress / Review / Done) with
 * priority dots, type tags, and assignee chips. Demonstrates the
 * `.kanban` / `.kanban-col` / `.issue-card` design atoms alongside
 * `PageHeader`, `Button`, `Tag` primitives.
 */

const meta: Meta<typeof IssuesScreen> = {
  title: "Usage Cases/Issues",
  component: IssuesScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof IssuesScreen>;

export const Default: Story = {
  render: () => (
    <IssuesScreen
      onOpenIssue={(id) => {
        // eslint-disable-next-line no-console
        console.log("open issue", id);
      }}
    />
  ),
};
