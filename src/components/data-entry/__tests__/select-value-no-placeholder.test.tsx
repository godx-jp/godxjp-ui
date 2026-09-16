import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

/*
 * A `<SelectValue />` with no placeholder and no value must render nothing. React Aria fills a
 * null render result with its own English "Select an item", which leaked into ja/vi screens after
 * the move off Radix — Radix drew an empty trigger, and that is what consumers relied on.
 */
describe("SelectValue without a placeholder", () => {
  it("renders an empty value, never React Aria's English default", () => {
    const { container } = renderWithUi(
      <Select>
        <SelectTrigger aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>,
    );

    const value = container.querySelector('[data-slot="select-value"]');
    expect(value).not.toBeNull();
    expect(value?.textContent).toBe("");
    expect(container.textContent).not.toContain("Select an item");
  });

  it("still renders a placeholder that is given", () => {
    const { container } = renderWithUi(
      <Select>
        <SelectTrigger aria-label="Role">
          <SelectValue placeholder="Chọn vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(container.querySelector('[data-slot="select-value"]')?.textContent).toBe("Chọn vai trò");
  });
});
