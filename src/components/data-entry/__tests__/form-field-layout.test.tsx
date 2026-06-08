import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { FormField } from "../form-field";

const root = (c: HTMLElement) => c.querySelector('[data-slot="form-field"]') as HTMLElement;

afterEach(() => vi.restoreAllMocks());

describe("FormField — layout props", () => {
  it("reflects the horizontal layout on the wrapper", () => {
    const { container } = render(
      <FormField id="a" label="名前" layout="horizontal">
        <input id="a" />
      </FormField>,
    );
    expect(root(container)).toHaveAttribute("data-layout", "horizontal");
  });

  it("emits label/control width CSS vars and a colSpan grid-column", () => {
    const { container } = render(
      <FormField id="b" label="住所" labelWidth={120} controlWidth="20rem" colSpan={2}>
        <input id="b" />
      </FormField>,
    );
    const el = root(container);
    expect(el.style.getPropertyValue("--form-label-width")).toBe("120px"); // number → px
    expect(el.style.getPropertyValue("--form-control-width")).toBe("20rem"); // string passthrough
    expect(el.style.gridColumn).toBe("span 2");
  });

  it("sets no inline style when no width/span props are given", () => {
    const { container } = render(
      <FormField id="c" label="x">
        <input id="c" />
      </FormField>,
    );
    expect(root(container).getAttribute("style")).toBeNull();
  });
});

describe("FormField — invalid children", () => {
  it("warns in dev when the child is not a single element", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <FormField id="d" label="label" helper="help">
        plain text child
      </FormField>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("single React element"));
    // the text child still renders even though aria can't be wired onto it
    expect(screen.getByText("plain text child")).toBeInTheDocument();
  });
});
