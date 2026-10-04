import * as React from "react";
import { describe, expect, it } from "vitest";

import { PageContainer } from "../page-container";
import { renderWithUi, screen } from "@/test/render";

/* gh#1135 — a router moves focus to the new page's <h1> after a client-side navigation. */
describe("PageContainer titleRef (gh#1135)", () => {
  it("points the ref at the <h1> and makes it focusable outside the tab order", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    renderWithUi(
      <PageContainer title="Guides" titleRef={ref}>
        x
      </PageContainer>,
    );
    const heading = screen.getByRole("heading", { level: 1, name: "Guides" });
    expect(ref.current).toBe(heading);
    expect(heading).toHaveAttribute("tabindex", "-1");
    ref.current!.focus();
    expect(document.activeElement).toBe(heading);
  });

  it("leaves the heading unfocusable when no ref is passed", () => {
    renderWithUi(<PageContainer title="Guides">x</PageContainer>);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute("tabindex");
  });

  it("follows the heading from the loading placeholder to the loaded title, and with a status", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    const { rerender } = renderWithUi(
      <PageContainer title="Guides" titleRef={ref} headerLoading>
        x
      </PageContainer>,
    );
    expect(ref.current?.tagName).toBe("H1");
    expect(ref.current).toHaveAttribute("tabindex", "-1");

    rerender(
      <PageContainer title="Guides" titleRef={ref} status={<span>Draft</span>}>
        x
      </PageContainer>,
    );
    expect(ref.current).toBe(screen.getByRole("heading", { level: 1, name: "Guides" }));
    expect(ref.current).toHaveAttribute("tabindex", "-1");
  });
});
