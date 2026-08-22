import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Form } from "../form";
import { FormField } from "../form-field";
import { Input } from "../input";

describe("Form — layout context flows to FormField", () => {
  it("applies the Form layout + labelWidth to each field", () => {
    renderWithUi(
      <Form layout="horizontal" labelWidth={120}>
        <FormField id="a" label="A">
          <Input id="a" />
        </FormField>
      </Form>,
    );
    const field = document.querySelector('[data-slot="form-field"]') as HTMLElement;
    expect(field).toHaveAttribute("data-layout", "horizontal");
    expect(field).toHaveAttribute("data-collapse-below", "md"); // mobile-first default
    expect(field.style.getPropertyValue("--form-label-width")).toBe("120px");
  });

  it("a per-field prop OVERRIDES the Form context (Form → FormField priority)", () => {
    renderWithUi(
      <Form layout="horizontal">
        <FormField id="a" label="A">
          <Input id="a" />
        </FormField>
        <FormField id="b" label="B" layout="vertical">
          <Input id="b" />
        </FormField>
      </Form>,
    );
    const fields = document.querySelectorAll('[data-slot="form-field"]');
    expect(fields[0]).toHaveAttribute("data-layout", "horizontal");
    expect(fields[1]).toHaveAttribute("data-layout", "vertical"); // overridden
  });

  it("collapseBelow={false} = always horizontal (no responsive collapse)", () => {
    renderWithUi(
      <Form layout="horizontal" collapseBelow={false}>
        <FormField id="a" label="A">
          <Input id="a" />
        </FormField>
      </Form>,
    );
    expect(document.querySelector('[data-slot="form-field"]')).toHaveAttribute(
      "data-collapse-below",
      "false",
    );
  });

  it("columns renders the responsive grid and colSpan sets grid-column", () => {
    renderWithUi(
      <Form columns={2}>
        <FormField id="a" label="A">
          <Input id="a" />
        </FormField>
        <FormField id="b" label="B" colSpan={2}>
          <Input id="b" />
        </FormField>
      </Form>,
    );
    expect(document.querySelector(".ui-responsive-grid")).toBeInTheDocument();
    const fields = document.querySelectorAll('[data-slot="form-field"]');
    expect((fields[1] as HTMLElement).style.gridColumn).toBe("span 2");
  });

  it("a standalone FormField (no Form) defaults to vertical and still wires a11y", () => {
    renderWithUi(
      <FormField id="x" label="氏名" required helper="ヒント" error="必須です">
        <Input id="x" />
      </FormField>,
    );
    const field = document.querySelector('[data-slot="form-field"]') as HTMLElement;
    expect(field).toHaveAttribute("data-layout", "vertical");
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.getAttribute("aria-describedby")).toContain("x-helper");
    expect(input.getAttribute("aria-errormessage")).toContain("x-error");
  });
});

describe("Form asChild — layout without owning the form element", () => {
  /**
   * Inertia and TanStack Form render their own `<form>`. Two form elements cannot nest, so
   * before `asChild` a consumer had to pick one and hand-roll the other; every such app ended
   * up with per-field label columns in raw CSS.
   */
  it("renders the caller's element, not a second form, and still supplies the layout", () => {
    renderWithUi(
      <Form asChild layout="horizontal" labelWidth={174}>
        <form data-testid="theirs" action="/issues">
          <FormField id="a" label="A">
            <Input id="a" />
          </FormField>
        </form>
      </Form>,
    );

    expect(document.querySelectorAll("form")).toHaveLength(1);

    const theirs = screen.getByTestId("theirs");
    expect(theirs).toHaveAttribute("action", "/issues");
    expect(theirs).toHaveAttribute("data-slot", "form");
    expect(theirs.className).toContain("ui-form");

    const field = document.querySelector('[data-slot="form-field"]') as HTMLElement;
    expect(field).toHaveAttribute("data-layout", "horizontal");
    expect(field.style.getPropertyValue("--form-label-width")).toBe("174px");
  });

  it("keeps the caller's own props rather than replacing them", () => {
    // Slot merges; a naive implementation spreads over the child and drops its handlers.
    renderWithUi(
      <Form asChild layout="horizontal" className="ds-added">
        <form data-testid="theirs" className="theirs-own" method="post" />
      </Form>,
    );
    const theirs = screen.getByTestId("theirs");
    expect(theirs).toHaveAttribute("method", "post");
    expect(theirs.className).toContain("theirs-own");
    expect(theirs.className).toContain("ds-added");
  });
});
