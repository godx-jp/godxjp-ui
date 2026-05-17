import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "../../components/feedback/Skeleton";
import { Card, CardBody, CardHeader } from "../../components/data-display/Card";
import { Space } from "../../components/layout";

/**
 * Feedback/Skeleton — loading placeholder atom.
 *
 * Reuses the `.sk-line` / `.sk-title` / `.sk-block` / `.sk-circle`
 * atoms from `75-card-atoms.css`; combine them inside a Card or a
 * Table row to communicate which surface is loading without
 * shifting layout when real content arrives.
 */

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Loading placeholder. Compose `.sk-*` atoms into card / list / " +
          "table shapes so the loading state has the same footprint as " +
          "the real content.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Card_Shape: Story = {
  name: "Card shape — header + body + footer",
  render: () => (
    <Card style={{ width: 360 }}>
      <CardHeader>
        <Skeleton className="sk-title" />
        <Skeleton className="sk-line short" />
      </CardHeader>
      <CardBody>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Skeleton className="sk-line" />
          <Skeleton className="sk-line med" />
          <Skeleton className="sk-line short" />
        </Space>
      </CardBody>
    </Card>
  ),
};

export const List_Shape: Story = {
  name: "List shape — avatar + 2 lines × 4",
  render: () => (
    <Card style={{ width: 420 }}>
      <CardBody>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {[0, 1, 2, 3].map((i) => (
            <Space key={i} size="middle" align="center" style={{ width: "100%" }}>
              <Skeleton className="sk-circle" />
              <Space direction="vertical" size="small" style={{ flex: 1 }}>
                <Skeleton className="sk-title" />
                <Skeleton className="sk-line med" />
              </Space>
            </Space>
          ))}
        </Space>
      </CardBody>
    </Card>
  ),
};

export const Table_Shape: Story = {
  name: "Table shape — header row + 5 body rows",
  render: () => (
    <Card style={{ width: 540 }}>
      <CardBody>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space size="middle" style={{ width: "100%" }}>
            <Skeleton className="sk-line short" style={{ flex: 1 }} />
            <Skeleton className="sk-line short" style={{ flex: 1 }} />
            <Skeleton className="sk-line short" style={{ flex: 1 }} />
            <Skeleton className="sk-line short" style={{ flex: 1 }} />
          </Space>
          {[0, 1, 2, 3, 4].map((i) => (
            <Space key={i} size="middle" style={{ width: "100%" }}>
              <Skeleton className="sk-line" style={{ flex: 1 }} />
              <Skeleton className="sk-line" style={{ flex: 1 }} />
              <Skeleton className="sk-line" style={{ flex: 1 }} />
              <Skeleton className="sk-line" style={{ flex: 1 }} />
            </Space>
          ))}
        </Space>
      </CardBody>
    </Card>
  ),
};

export const Block_Media: Story = {
  name: "Block — media placeholder",
  render: () => (
    <Card style={{ width: 360 }}>
      <CardBody>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Skeleton className="sk-block" style={{ width: "100%" }} />
          <Skeleton className="sk-title" />
          <Skeleton className="sk-line med" />
        </Space>
      </CardBody>
    </Card>
  ),
};
