import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Toolbar, ToolbarGroup } from "../filter-bar";
import { PageContainer } from "../../layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

describe("FilterBar", () => {
  it("shows clear button when filters active", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithUi(
      <Toolbar onClear={onClear} hasActiveFilters>
        <ToolbarGroup label="Status">
          <span>Active</span>
        </ToolbarGroup>
      </Toolbar>,
    );
    await user.click(screen.getByRole("button", { name: /xóa bộ lọc/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("hides clear when hasActiveFilters=false", () => {
    renderWithUi(
      <Toolbar onClear={() => undefined} hasActiveFilters={false}>
        <span>f</span>
      </Toolbar>,
    );
    expect(screen.queryByRole("button", { name: /xóa bộ lọc/i })).not.toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title and description (legacy)", () => {
    renderWithUi(
      <PageContainer title="Legacy" subtitle="Sub" extra={<button type="button">Go</button>} />,
    );
    expect(screen.getByRole("heading", { name: "Legacy" })).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("switches tab panels", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toHaveAttribute("data-slot", "tabs-list");
    await user.click(screen.getByRole("tab", { name: "Tab B" }));
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("data-slot", "tabs-trigger");
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });
});
