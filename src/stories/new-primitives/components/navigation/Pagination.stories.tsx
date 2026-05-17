import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "../../../../components/primitives/Pagination";

/**
 * Components/Navigation/Pagination — page jumper.
 *
 * Vocabulary (§23.B):
 *   - `size` (small | default)
 *   - `variant` (default | simple)
 *   - `value` / `defaultValue` / `onValueChange` (1-based page index)
 *   - `justify` (start | center | end | between) — reused from Flex
 *   - `disabled`
 *   - `showTotal`
 */

const meta: Meta<typeof Pagination> = {
  title: "new-primitives/Components/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  name: "Default · 12 pages × 10/page",
  render: () => <Pagination total={120} pageSize={10} defaultValue={3} />,
};

export const WithShowTotal: Story = {
  name: "With showTotal",
  render: () => (
    <Pagination total={2481} pageSize={50} defaultValue={5} showTotal />
  ),
};

export const Small: Story = {
  name: "Size · small",
  render: () => (
    <Pagination total={100} pageSize={10} defaultValue={2} size="small" />
  ),
};

export const Simple: Story = {
  name: "Variant · simple",
  render: () => (
    <Pagination total={120} pageSize={10} defaultValue={4} variant="simple" />
  ),
};

export const Centered: Story = {
  name: "Justify · center",
  render: () => (
    <div style={{ minWidth: 600 }}>
      <Pagination total={120} pageSize={10} defaultValue={3} justify="center" />
    </div>
  ),
};

export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <Pagination total={120} pageSize={10} defaultValue={3} disabled />
  ),
};

export const Controlled: Story = {
  name: "Controlled · state",
  render: () => {
    const Controlled = () => {
      const [page, setPage] = useState(1);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Pagination
            total={500}
            pageSize={20}
            value={page}
            onValueChange={setPage}
            showTotal
          />
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            controlled current page = <strong>{page}</strong>
          </div>
        </div>
      );
    };
    return <Controlled />;
  },
};
