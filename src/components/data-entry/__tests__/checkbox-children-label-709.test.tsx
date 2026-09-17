import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "../checkbox-group";

/*
 * gh#709 — antd `<Checkbox>label</Checkbox>`: `children` is the inline label. Box first, label
 * after it on the same line, the label text toggles the box and names it.
 */
describe("Checkbox children as the inline label (gh#709)", () => {
  it("names the checkbox from its children", () => {
    renderWithUi(<Checkbox>Share with the project</Checkbox>);
    expect(screen.getByRole("checkbox", { name: "Share with the project" })).toBeInTheDocument();
  });

  it("toggles when the label text is clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Checkbox onCheckedChange={onCheckedChange}>Share with the project</Checkbox>);
    const box = screen.getByRole("checkbox", { name: "Share with the project" });

    await user.click(screen.getByText("Share with the project"));
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByText("Share with the project"));
    expect(box).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("renders the same box → label markup as a Checkbox.Group option", () => {
    const { container } = renderWithUi(
      <>
        <Checkbox id="single" className="extra">
          Alpha
        </Checkbox>
        <CheckboxGroup id="group" options={[{ value: "a", label: "Alpha" }]} />
      </>,
    );
    const [single, option] = Array.from(container.querySelectorAll(".ui-choice-field"));
    const shape = (el: Element) =>
      Array.from(el.children).map((child) => [
        child.className,
        Array.from(child.children).map((c) => c.getAttribute("data-slot")),
      ]);
    expect(shape(single!)).toEqual(shape(option!));
    // box first, label second — the inline-end position is the DOM order in a flex row
    expect(single!.firstElementChild!.querySelector('[data-slot="checkbox"]')).not.toBeNull();
    expect(single!.lastElementChild!.textContent).toBe("Alpha");
    // `className` styles the labelled row; the `id` stays on the input a `<label for>` targets
    expect(single).toHaveClass("extra");
    expect(screen.getAllByRole("checkbox", { name: "Alpha" })[0]).toHaveAttribute("id", "single");
  });

  it("keeps the bare box (no children) unchanged — no label row", () => {
    const { container } = renderWithUi(<Checkbox aria-label="accept" className="extra" />);
    expect(container.querySelector(".ui-choice-field")).toBeNull();
    expect(container.querySelector('[data-slot="checkbox"]')).toHaveClass("extra");
  });

  it("does not stamp a generated id as data-field", () => {
    const { container } = renderWithUi(<Checkbox>Share</Checkbox>);
    expect(container.querySelector("[data-field]")).toBeNull();
  });
});
