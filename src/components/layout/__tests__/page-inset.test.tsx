import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { PageInset } from "../page-inset";

describe("PageInset", () => {
  it("renders children with inset class", () => {
    renderWithUi(
      <PageInset>
        <p>Filter zone</p>
      </PageInset>,
    );
    expect(screen.getByText("Filter zone").parentElement).toHaveClass("ui-page-inset");
  });
});
