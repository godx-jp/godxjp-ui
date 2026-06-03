import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { PageContainer } from "../page-container";

describe("PageInset", () => {
  it("renders children with inset class", () => {
    renderWithUi(
      <PageContainer.Inset>
        <p>Filter zone</p>
      </PageContainer.Inset>,
    );
    expect(screen.getByText("Filter zone").parentElement).toHaveClass("ui-page-container-inset");
  });
});
