import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Card, CardBar, CardContent } from "../card";

describe("CardBar", () => {
  it("renders the main content and the extra slot", () => {
    renderWithUi(
      <Card>
        <CardBar extra={<button type="button">設定</button>}>
          <span>すべて</span>
        </CardBar>
        <CardContent>body</CardContent>
      </Card>,
    );
    expect(screen.getByText("すべて")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "設定" })).toBeInTheDocument();
    // extra is a dedicated slot pinned at the end
    expect(document.querySelector('[data-slot="card-bar-extra"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="card-bar-main"]')).toBeInTheDocument();
  });

  it("omits the extra slot when no extra is passed", () => {
    renderWithUi(
      <Card>
        <CardBar>
          <span>tabs</span>
        </CardBar>
      </Card>,
    );
    expect(document.querySelector('[data-slot="card-bar-extra"]')).toBeNull();
  });

  it("forwards className and arbitrary props to the bar root", () => {
    renderWithUi(
      <Card>
        <CardBar className="custom-bar" data-testid="bar">
          x
        </CardBar>
      </Card>,
    );
    const bar = screen.getByTestId("bar");
    expect(bar).toHaveClass("ui-card-bar", "custom-bar");
    expect(bar).toHaveAttribute("data-slot", "card-bar");
  });
});
