import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { FormField } from "../../data-entry/form-field";
import { Input } from "../../data-entry/input";
import { SearchForm } from "../search-form";

const fields = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <FormField key={i} label={`Field ${i + 1}`} id={`f${i + 1}`}>
      <Input id={`f${i + 1}`} />
    </FormField>
  ));

/** The test wrapper renders in `vi` (src/test/render.tsx), so the chrome is asserted in Vietnamese. */
describe("SearchForm", () => {
  it("is a named search landmark with Search and, when onReset is set, Clear", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const onReset = vi.fn();
    renderWithUi(
      <SearchForm onSubmit={onSubmit} onReset={onReset}>
        {fields(2)}
      </SearchForm>,
    );
    expect(screen.getByRole("search", { name: "Điều kiện tìm kiếm" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Xoá điều kiện" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders no Clear button without onReset, and no toggle when every field fits the first row", () => {
    renderWithUi(<SearchForm>{fields(3)}</SearchForm>);
    expect(screen.queryByRole("button", { name: "Xoá điều kiện" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Mở thêm điều kiện/ })).toBeNull();
  });

  it("collapses to the first row, names the hidden count, and expands on the toggle", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<SearchForm onOpenChange={onOpenChange}>{fields(5)}</SearchForm>);
    // Default columns' widest step is 3: fields 4 and 5 start hidden.
    expect(screen.getByLabelText("Field 3")).toBeVisible();
    expect(screen.getByLabelText("Field 4")).not.toBeVisible();
    const toggle = screen.getByRole("button", { name: /Mở thêm điều kiện/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAccessibleName(/2 điều kiện đang ẩn/);
    expect(toggle.getAttribute("aria-controls")?.split(" ")).toHaveLength(2);
    await user.click(toggle);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText("Field 5")).toBeVisible();
    expect(screen.getByRole("button", { name: /Thu gọn điều kiện/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("keeps a value typed into a hidden condition when the section collapses again", async () => {
    const user = userEvent.setup();
    renderWithUi(<SearchForm defaultOpen>{fields(4)}</SearchForm>);
    await user.type(screen.getByLabelText("Field 4"), "Hà Nội");
    await user.click(screen.getByRole("button", { name: /Thu gọn điều kiện/ }));
    await user.click(screen.getByRole("button", { name: /Mở thêm điều kiện/ }));
    expect(screen.getByLabelText("Field 4")).toHaveValue("Hà Nội");
  });

  it("honours visibleFields and a controlled open", () => {
    const { rerender } = renderWithUi(
      <SearchForm visibleFields={1} open={false}>
        {fields(3)}
      </SearchForm>,
    );
    expect(screen.getByLabelText("Field 2")).not.toBeVisible();
    rerender(
      <SearchForm visibleFields={1} open>
        {fields(3)}
      </SearchForm>,
    );
    expect(screen.getByLabelText("Field 2")).toBeVisible();
  });

  it("announces the searched conditions and the result count in one status line", () => {
    renderWithUi(
      <SearchForm summary="Country: Vietnam / Status: Active" resultCount={42}>
        {fields(1)}
      </SearchForm>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Điều kiện tìm kiếm: Country: Vietnam / Status: Active");
    expect(status).toHaveTextContent("42 kết quả");
  });

  it("lets the consumer rename the buttons and the landmark", () => {
    renderWithUi(
      <SearchForm label="Trainee search" searchLabel="Find" resetLabel="Reset" onReset={vi.fn()}>
        {fields(1)}
      </SearchForm>,
    );
    expect(screen.getByRole("search", { name: "Trainee search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: "Reset" })).toHaveAttribute("type", "button");
  });
});
