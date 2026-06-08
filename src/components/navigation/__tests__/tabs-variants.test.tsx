import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

const ITEMS = [
  { value: "a", label: "概要", content: "パネルA" },
  { value: "b", label: "詳細", content: "パネルB" },
  { value: "c", label: "無効", content: "パネルC", disabled: true },
];

describe("Tabs — items API", () => {
  it("defaults to the first item when no defaultValue/value is given", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.getByText("パネルA")).toBeInTheDocument();
  });

  it("a disabled item cannot be activated", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} />);
    const disabledTab = screen.getByRole("tab", { name: "無効" });
    expect(disabledTab).toBeDisabled();
    await user.click(disabledTab);
    expect(screen.queryByText("パネルC")).toBeNull(); // stayed on A
  });

  it("controlled value pins the active panel", () => {
    render(<Tabs items={ITEMS} value="b" />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルA")).toBeNull();
  });
});

describe("Tabs — variants + orientation", () => {
  it("variant=line gives the list a bottom border", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    expect(screen.getByRole("tablist").className).toContain("border-b");
  });

  it("variant=card stretches the list full width", () => {
    render(<Tabs items={ITEMS} variant="card" />);
    expect(screen.getByRole("tablist").className).toContain("w-full");
  });

  it("vertical orientation is reflected on the root", () => {
    const { container } = render(<Tabs items={ITEMS} orientation="vertical" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});

describe("Tabs — children (composition) mode", () => {
  it("renders manually-composed list/trigger/content when no items are passed", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("First panel")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });
});
