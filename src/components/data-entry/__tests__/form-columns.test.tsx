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
