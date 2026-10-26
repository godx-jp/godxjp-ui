import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Button } from "../../general/button";
import { PageContainer } from "../page-container";

/**
 * gh#1494 — the page's Help control had no fixed place: one consumer's screens put it in the
 * header's actions, in the body, or at the body's start, so it moved from screen to screen. The
 * header now has a `help` slot that is always the last item of the action box.
 */
describe("PageContainer help slot (gh#1494)", () => {
  it("renders help AFTER the extra actions, as the last item of the action box", () => {
    renderWithUi(
      <PageContainer
        title="Shifts"
        extra={{ start: <Button>Export</Button>, end: <Button>New shift</Button> }}
        help={<Button variant="ghost">Help</Button>}
      />,
    );
    const help = screen.getByRole("button", { name: "Help" });
    const slot = help.closest('[data-slot="page-header-help"]');
    expect(slot).not.toBeNull();
    const box = slot!.parentElement!;
    expect(box).toHaveClass("ui-page-header-extra");
    expect(box.lastElementChild).toBe(slot);
    expect(box.firstElementChild).toBe(screen.getByRole("button", { name: "Export" }));
  });

  it("a page with only help still renders a header holding it", () => {
    renderWithUi(<PageContainer help={<Button variant="ghost">Help</Button>} />);
    expect(screen.getByRole("button", { name: "Help" }).closest("header")).toHaveClass(
      "ui-page-header",
    );
  });

  it("without help nothing is rendered for it (negative case)", () => {
    const { container } = renderWithUi(
      <PageContainer title="Shifts" extra={<Button>New</Button>} />,
    );
    expect(container.querySelector('[data-slot="page-header-help"]')).toBeNull();
  });
});
