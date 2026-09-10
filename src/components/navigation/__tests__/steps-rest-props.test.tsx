import { describe, expect, it } from "vitest";

import { Steps } from "../steps";
import { renderWithUi, screen } from "@/test/render";

const ITEMS = [
  { title: "申込" },
  { title: "審査" },
  { title: "完了" },
];

/**
 * `Steps` destructured a fixed prop list and forwarded nothing, so a consumer had no supported
 * handle on the rendered list at all — its browser suite ended up binding to
 * `.ui-steps-list > li[data-status]`, an internal class and an internal data attribute this
 * package is free to rename under it. Every sibling primitive already forwards a `data-testid`
 * and an `id`; this one simply never did.
 */
describe("Steps forwards the rest of its DOM props", () => {
  it("carries a data-testid and an id onto the list", () => {
    renderWithUi(<Steps items={ITEMS} value={1} data-testid="application-steps" id="app-steps" />);
    const list = screen.getByTestId("application-steps");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("id", "app-steps");
  });

  it("lets a caller-supplied aria-label win over the localized default", () => {
    renderWithUi(<Steps items={ITEMS} value={1} aria-label="申込の進捗" />);
    expect(screen.getByRole("list", { name: "申込の進捗" })).toBeInTheDocument();
  });

  it("still names itself from the locale when the caller says nothing", () => {
    renderWithUi(<Steps items={ITEMS} value={1} />);
    const list = screen.getByRole("list");
    expect(list.getAttribute("aria-label")).toBeTruthy();
  });

  it("keeps its own marker appearance prop rather than the <ol> numbering attribute", () => {
    renderWithUi(<Steps items={ITEMS} value={1} type="inline" data-testid="inline-steps" />);
    const list = screen.getByTestId("inline-steps");
    expect(list).toHaveAttribute("data-type", "inline");
    // `type` on an <ol> is the numbering style; Steps owns the name, so nothing leaks through.
    expect(list).not.toHaveAttribute("type");
  });
});
