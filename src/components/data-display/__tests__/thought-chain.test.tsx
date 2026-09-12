import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { ThoughtChain } from "../thought-chain";

describe("ThoughtChain", () => {
  it("renders each node title in order", () => {
    renderWithUi(
      <ThoughtChain
        items={[
          { key: "a", title: "Query knowledge" },
          { key: "b", title: "Invoke model" },
        ]}
      />,
    );

    expect(screen.getByText("Query knowledge")).toBeInTheDocument();
    expect(screen.getByText("Invoke model")).toBeInTheDocument();
  });

  it("toggles collapsible content and reports expanded keys", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    renderWithUi(
      <ThoughtChain
        defaultExpandedKeys={[]}
        onExpand={onExpand}
        items={[
          {
            key: "step",
            title: "Planning",
            collapsible: true,
            content: "Hidden detail",
          },
        ]}
      />,
    );

    expect(screen.queryByText("Hidden detail")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /planning/i }));
    expect(screen.getByText("Hidden detail")).toBeInTheDocument();
    expect(onExpand).toHaveBeenCalledWith(["step"]);
  });

  it("renders ThoughtChain.Item as a standalone chip", () => {
    renderWithUi(<ThoughtChain.Item title="Task complete" status="success" />);
    expect(screen.getByText("Task complete")).toBeInTheDocument();
  });
});
