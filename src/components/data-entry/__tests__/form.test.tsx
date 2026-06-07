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
