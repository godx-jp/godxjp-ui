import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { SkeletonCard, SkeletonDetail, SkeletonRows, SkeletonTable } from "../skeleton";

describe("Skeleton", () => {
  it("SkeletonRows marks busy state", () => {
    const { container } = renderWithUi(<SkeletonRows rows={2} columns={3} />);
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("SkeletonTable renders header and body placeholders", () => {
    const { container } = renderWithUi(<SkeletonTable rows={3} columns={4} />);
    expect(container.querySelector(".ui-skeleton-table")).toBeInTheDocument();
  });

  it("SkeletonDetail renders title blocks", () => {
    const { container } = renderWithUi(<SkeletonDetail />);
    expect(container.querySelectorAll(".ui-skeleton-block").length).toBeGreaterThan(0);
  });

  it("SkeletonCard renders stat tile shape", () => {
    const { container } = renderWithUi(<SkeletonCard />);
    expect(container.querySelector(".ui-skeleton-stat")).toBeInTheDocument();
  });
});
