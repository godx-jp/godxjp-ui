import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../resizable";
import { expectNoA11yViolations } from "@/test/a11y";

function Demo(props: { direction?: "horizontal" | "vertical" }) {
  return (
    <ResizablePanelGroup direction={props.direction ?? "horizontal"}>
      <ResizablePanel defaultSize={50}>左</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>右</ResizablePanel>
    </ResizablePanelGroup>
  );
}

describe("Resizable", () => {
  it("renders the group, panels and handle with their data-slots", () => {
    const { container, getByText } = render(<Demo />);
    expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument();
    expect(getByText("左")).toBeInTheDocument();
    expect(getByText("右")).toBeInTheDocument();
  });

  it("the handle is a focusable separator (keyboard-resizable)", () => {
    const { getByRole } = render(<Demo />);
    const handle = getByRole("separator");
    expect(handle).toHaveAttribute("data-slot", "resizable-handle");
    expect(handle).toHaveAttribute("tabindex", "0");
  });

  it("renders in a vertical direction without crashing", () => {
    const { container, getByText } = render(<Demo direction="vertical" />);
    expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeInTheDocument();
    expect(getByText("左")).toBeInTheDocument();
    expect(getByText("右")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Demo />);
  });
});
