import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Topbar } from "../topbar";

describe("Topbar", () => {
  it("renders a neutral project placeholder without hardcoded English", () => {
    render(
      <Topbar
        product={{ name: "CoreBooks" }}
        projectMenu={<div data-testid="project-menu">menu</div>}
        projectPlaceholder="—"
      />,
    );

    expect(screen.getByRole("button", { name: "—" })).toHaveTextContent("—");
    expect(screen.queryByText("Pick project")).not.toBeInTheDocument();
  });

  it("uses projectPlaceholder prop when provided", () => {
    render(
      <Topbar
        product={{ name: "CoreBooks" }}
        projectMenu={<div data-testid="project-menu">menu</div>}
        projectPlaceholder="Select a project"
        onProductOpen={undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Select a project" })).toBeInTheDocument();
  });
});
