import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Conversations } from "../conversations";

/*
 * Ant Design X's `Conversation` carries six fields — `key`, `label`, `timestamp`, `group`, `icon`,
 * `disabled` — and the first port of this component landed five. `timestamp` was the one missing,
 * and nothing said so: the type simply did not have it, so a caller passing it got a TypeScript
 * error about an unknown property rather than a rendered date.
 *
 * The assertion that matters is not "a date appears". It is that the date goes through
 * `formatDate`, so it reads in the tenant's OWN locale. `docs/DATETIME.md` rule 1 bans
 * `toLocaleString`, `date-fns/format` and sliced ISO strings for exactly this: the same epoch has
 * to read 2026/03/15 for a Japanese tenant and 15/03/2026 for a Vietnamese one, and a component
 * that formats its own dates cannot do that.
 */

const MARCH_15 = new Date(2026, 2, 15, 9, 30).getTime();

const items = [
  { key: "a", label: "Hỏi về hợp đồng", timestamp: MARCH_15 },
  { key: "b", label: "Không có mốc thời gian" },
];

describe("Conversations timestamp (Ant Design X parity)", () => {
  it("renders the timestamp for a row that has one", () => {
    const { container } = renderWithUi(<Conversations items={items} />);
    expect(container.querySelectorAll(".ui-conversations-timestamp")).toHaveLength(1);
  });

  it("renders NOTHING for a row without one — not an empty line, not a dash", () => {
    // An always-present element would give every row a second line height, which is the layout
    // the two-line rule was written to avoid on a narrow rail.
    const { container } = renderWithUi(<Conversations items={[items[1]!]} />);
    expect(container.querySelector(".ui-conversations-timestamp")).toBeNull();
  });

  it("formats through the app's locale, not the component's own idea of a date", () => {
    // The test locale is vi, whose date order is day-first. If the component reached for
    // `toLocaleString()` or sliced an ISO string, this would read year-first and the whole point
    // of routing through AppProvider would be gone.
    const { container } = renderWithUi(<Conversations items={items} />);
    const text = container.querySelector(".ui-conversations-timestamp")!.textContent ?? "";

    expect(text).toContain("15");
    expect(text).toContain("2026");
    expect(text.indexOf("15")).toBeLessThan(text.indexOf("2026"));
  });

  it("the label still elides — the second line must not cost the first its truncation", () => {
    // `Text truncate` publishes `data-truncate`, not a Tailwind class; `check:no-tailwind-class-
    // assertions` is a gate here precisely so a test cannot bind to the class instead.
    renderWithUi(<Conversations items={items} />);
    const label = screen.getByText("Hỏi về hợp đồng");
    expect(label.getAttribute("data-truncate")).toBe("");
  });
});
