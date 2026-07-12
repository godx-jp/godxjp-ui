import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Pagination } from "../pagination";

describe("Pagination — simple mode total", () => {
  it("renders the total summary in simple mode when showTotal is set", () => {
    const { container } = renderWithUi(
      <Pagination simple value={2} total={50} pageSize={10} showTotal />,
    );
    expect(container.querySelector('[data-simple="true"]')).not.toBeNull();
    // the total label branch inside the simple-mode nav
    expect(container.querySelector(".ui-pagination-total")?.textContent).toMatch(/50/);
  });

  it("reports a 0–0 range to custom totals when the collection is empty", () => {
    let range: [number, number] | undefined;
    renderWithUi(
      <Pagination
        total={0}
        pageSize={10}
        showTotal={(_total, nextRange) => {
          range = nextRange;
          return `${nextRange[0]}–${nextRange[1]}`;
        }}
      />,
    );
    expect(range).toEqual([0, 0]);
  });
});
