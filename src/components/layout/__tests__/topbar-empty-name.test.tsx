import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Topbar } from "../topbar";

describe("Topbar — empty product name", () => {
  it("falls back to '?' for an empty product name initial", () => {
    render(<Topbar product={{ name: "" }} />);
    // name[0]?.toUpperCase() ?? "?" → "?"
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
