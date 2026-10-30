import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flex } from "../flex";

describe("Flex material surfaces", () => {
  it("composes a named material region with independently named etched zones", () => {
    render(
      <Flex surface="felt" aria-label="Workspace">
        <Flex surface="etched" aria-label="Field">
          Public artwork
        </Flex>
      </Flex>,
    );
    expect(screen.getByRole("group", { name: "Workspace" })).toHaveAttribute(
      "data-surface",
      "felt",
    );
    expect(screen.getByRole("group", { name: "Field" })).toHaveAttribute("data-surface", "etched");
    expect(screen.getByText("Public artwork")).toBeVisible();
  });
  it("keeps surfaces opt-in and does not introduce controls or domain semantics", () => {
    const { rerender } = render(<Flex data-testid="region">Content</Flex>);
    expect(screen.getByTestId("region")).not.toHaveAttribute("data-surface");
    rerender(
      <Flex data-testid="region" surface="felt">
        <button>Inspect</button>
      </Flex>,
    );
    expect(screen.getByRole("button", { name: "Inspect" })).toBeEnabled();
    expect(screen.getByTestId("region")).not.toHaveAttribute("role");
  });
});
