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
  it("variant=line reaches BOTH the root and the list, which is what selects the line chrome", () => {
    const { container } = render(<Tabs items={ITEMS} variant="line" />);
    // The root records what the consumer asked for…
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-variant", "line");
    // …and the list carries it too, because every line rule (the ruled strip, the token-owned
    // active bar, the triggers' `group-data-[variant=line]/tabs-list:` chrome) keys off it.
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line");
  });

  it("variant=card is recorded on the root while the list keeps the DEFAULT strip chrome", () => {
    const { container } = render(<Tabs items={ITEMS} variant="card" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-variant", "card");
    // Deliberate (gh#248): card's chrome IS the default strip, so the list is forwarded as
    // `default` and the active lift comes from the base trigger's default-list rules.
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "default");
  });

  it("default variant is recorded as such on the root", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-variant",
      "default",
    );
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
