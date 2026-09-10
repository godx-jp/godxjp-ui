import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Form } from "../form";

const form = (c: HTMLElement) => c.querySelector('[data-slot="form"]') as HTMLElement;

describe("Form — columns + density", () => {
  it("wraps children in a responsive grid when columns is set", () => {
    const { container } = render(
      <Form columns={2}>
        <div>field</div>
      </Form>,
    );
    // ResponsiveGrid emits the --responsive-grid-* CSS vars
    expect(container.querySelector('[style*="--responsive-grid"]')).not.toBeNull();
  });

  it("renders children directly (no grid) when columns is omitted", () => {
    const { container } = render(
      <Form>
        <div>field</div>
      </Form>,
    );
    expect(container.querySelector('[style*="--responsive-grid"]')).toBeNull();
  });

  /*
   * `asChild` used to render `children` while the non-asChild branch rendered the grid, so a
   * two-column form borrowed onto an Inertia/RHF `<form>` collapsed to one column — no error, no
   * warning, no type complaint. The grid belongs INSIDE the borrowed element, around its fields.
   */
  it("still applies columns when the form element is the caller's own (asChild)", () => {
    const { container } = render(
      <Form asChild columns={2}>
        <form aria-label="申込">
          <div>field</div>
        </form>
      </Form>,
    );
    const el = form(container);
    expect(el.tagName).toBe("FORM");
    expect(el.getAttribute("aria-label")).toBe("申込");
    // The grid is a descendant of the caller's form, not a replacement for it.
    const grid = el.querySelector('[style*="--responsive-grid"]');
    expect(grid).not.toBeNull();
    expect(el.textContent).toContain("field");
  });

  it("renders the caller's element untouched under asChild without columns", () => {
    const { container } = render(
      <Form asChild>
        <form aria-label="申込">
          <div>field</div>
        </form>
      </Form>,
    );
    expect(container.querySelector('[style*="--responsive-grid"]')).toBeNull();
    expect(form(container).textContent).toContain("field");
  });

  it("applies a density class and reflects the layout", () => {
    const { container } = render(
      <Form density="compact" layout="horizontal">
        <div>field</div>
      </Form>,
    );
    expect(form(container)).toHaveClass("ui-density-compact");
    expect(form(container)).toHaveAttribute("data-layout", "horizontal");
  });
});
