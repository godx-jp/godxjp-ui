import * as React from "react";
import { describe, expect, it } from "vitest";

import { Sidebar } from "../sidebar";
import { renderWithUi, screen } from "@/test/render";

/* gh#1136 — persist and restore the navigation's scroll position across navigations. */
describe("Sidebar scrollRef (gh#1136)", () => {
  it("points at the navigation's scroll container", () => {
    const ref = React.createRef<HTMLElement>();
    renderWithUi(
      <Sidebar
        aria-label="Docs"
        activeId="a"
        scrollRef={ref}
        sections={[{ items: [{ id: "a", label: "A" }] }]}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("navigation", { name: "Docs" }));
    expect(ref.current).toHaveClass("sb-nav-scroll");
    ref.current!.scrollTop = 120;
    expect(ref.current!.scrollTop).toBe(120);
  });
});
