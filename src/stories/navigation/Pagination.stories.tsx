import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Pagination } from "../../components/navigation/Pagination";

/**
 * Navigation/Pagination — page jumper.
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
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  name: "Default · 12 pages × 10/page",
  render: () => <Pagination total={120} pageSize={10} defaultValue={3} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("defaultValue selects page 3", async () => {
      const active = canvas.getByRole("button", { name: "3" });
      await expect(active).toHaveAttribute("aria-current", "page");
    });

    await step("clicking next page advances current to 4", async () => {
      const next = canvas.getByRole("button", { name: /Next page/i });
      await userEvent.click(next);
      await waitFor(() => {
        const newActive = canvas.getByRole("button", { name: "4" });
        expect(newActive).toHaveAttribute("aria-current", "page");
      });
    });
  },
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
  render: function Controlled() {
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
  },
};

export const Embedded: Story = {
  name: "Variant · embedded (table footer)",
  parameters: {
    docs: {
      description: {
        story:
          "Embedded variant mirrors the layout `<Table pagination={…}>` uses internally — info on the left, optional page-size changer, then the numeric pager (with first/last chevron buttons when `showFirstLast` is on). Reuse this anywhere you want the table-footer rhythm outside a `<Table>`.",
      },
    },
  },
  render: function Embedded() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    return (
      <Pagination
        variant="embedded"
        showFirstLast
        total={520}
        pageSize={pageSize}
        value={page}
        onValueChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        showTotal
      />
    );
  },
};

export const EmbeddedManyPages: Story = {
  name: "Variant · embedded · Laravel-style ellipsis",
  render: function EmbeddedManyPages() {
    const [page, setPage] = useState(25);
    return (
      <Pagination
        variant="embedded"
        showFirstLast
        total={520}
        pageSize={10}
        value={page}
        onValueChange={setPage}
        showSizeChanger={false}
        showTotal
      />
    );
  },
};

export const EmbeddedNoSizeChanger: Story = {
  name: "Variant · embedded · without size changer",
  render: () => (
    <Pagination
      variant="embedded"
      total={120}
      pageSize={10}
      defaultValue={1}
      showSizeChanger={false}
      showTotal
    />
  ),
};

export const HideOnSinglePage: Story = {
  name: "hideOnSinglePage · suppresses render",
  render: () => (
    <Pagination total={5} pageSize={10} defaultValue={1} hideOnSinglePage />
  ),
};

export const WiderWindow: Story = {
  name: "Wider window · siblings=2 boundary=2",
  render: function WiderWindow() {
    const [page, setPage] = useState(25);
    return (
      <Pagination
        variant="embedded"
        total={520}
        pageSize={10}
        value={page}
        onValueChange={setPage}
        siblings={2}
        boundary={2}
        showSizeChanger={false}
        showTotal
      />
    );
  },
};
