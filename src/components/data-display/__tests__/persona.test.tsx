import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Persona } from "../persona";
import { DataTable } from "../data-table";

const name = "ليلى عبد الرحمن الحسن";
const description = "layla.research@example.com";
describe("Persona", () => {
  it.each(["sm", "md"] as const)(
    "retains both full labels with independent bidi direction at %s",
    (size) => {
      const ref = React.createRef<HTMLSpanElement>();
      const { container } = render(
        <Persona
          ref={ref}
          id="identity"
          size={size}
          name={name}
          description={description}
          trailing={<span>(you)</span>}
        />,
      );
      expect(ref.current).toHaveAttribute("id", "identity");
      expect(ref.current).toHaveAttribute("data-size", size);
      for (const text of [name, description]) {
        expect(screen.getByText(text)).toHaveAttribute("title", text);
        expect(screen.getByText(text)).toHaveAttribute("dir", "auto");
      }
      expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(container.querySelector('[data-slot="persona-name"]')).not.toContainElement(
        screen.getByText("(you)"),
      );
    },
  );
  it("omits optional content and handles Unicode fallback", () => {
    const { container } = render(<Persona name="𠮷田" />);
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toHaveTextContent("𠮷");
    expect(container.querySelector('[data-slot="persona-description"]')).toBeNull();
    expect(container.querySelector('[data-slot="persona-trailing"]')).toBeNull();
  });
  it("does not duplicate Persona titles at the cell level", () => {
    const { container } = render(
      <DataTable
        data={[{ id: "1", name }]}
        columns={[
          {
            key: "name",
            header: "Member",
            ellipsis: true,
            render: (row) => <Persona name={row.name} description={description} />,
          },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).not.toHaveAttribute("title");
    expect(container.querySelectorAll("[title]")).toHaveLength(2);
  });
});
