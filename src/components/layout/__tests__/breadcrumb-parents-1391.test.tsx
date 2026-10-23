import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Breadcrumb } from "../breadcrumb";
import { PageContainer } from "../page-container";

const items = [
  { label: "Home", to: "/" },
  { label: "Records", to: "/records" },
];

for (const kind of ["breadcrumb", "page"] as const) {
  describe(`${kind}: ancestor-only trail (#1391)`, () => {
    it("links every ancestor and marks none current", () => {
      const { container } = renderWithUi(
        kind === "breadcrumb" ? (
          <Breadcrumb items={items} currentItem="none" />
        ) : (
          <PageContainer title="Record" breadcrumb={items} breadcrumbCurrentItem="none" />
        ),
      );
      expect(screen.getAllByRole("link")).toHaveLength(2);
      expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute("href", "/records");
      expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
    });
    it("keeps the default last segment current even when it has a path", () => {
      const { container } = renderWithUi(
        kind === "breadcrumb" ? (
          <Breadcrumb items={items} />
        ) : (
          <PageContainer title="Record" breadcrumb={items} />
        ),
      );
      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(container.querySelector('[aria-current="page"]')).toHaveTextContent("Records");
    });
    it("gives clipped labels their full name and title without a duplicate description (#1393)", () => {
      const trail = [
        { label: "Full record collection name", to: "/records", ellipsis: true },
        { label: "Record", ellipsis: { tooltip: false } },
      ];
      renderWithUi(
        kind === "breadcrumb" ? (
          <Breadcrumb items={trail} />
        ) : (
          <PageContainer title="Record" breadcrumb={trail} />
        ),
      );
      const link = screen.getByRole("link", { name: trail[0]!.label });
      expect(link).toHaveAttribute("aria-label", trail[0]!.label);
      expect(link).toHaveAttribute("title", trail[0]!.label);
      expect(link).not.toHaveAttribute("aria-describedby");
      const current = document.querySelector('[aria-current="page"]');
      expect(current).toHaveAttribute("title", "Record");
      expect(current).toHaveAttribute("aria-label", "Record");
    });
  });
}

describe("breadcrumb recovery edge cases", () => {
  it("recovers a label containing opaque components and decorative content", () => {
    const Name = () => <strong>Records</strong>;
    renderWithUi(
      <Breadcrumb
        items={[
          {
            label: (
              <>
                All <Name />
                <span aria-hidden="true">decorative</span>
              </>
            ),
            to: "/records",
            ellipsis: true,
          },
          { label: "Record" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "All Records" })).toHaveAttribute(
      "title",
      "All Records",
    );
  });
  it("keeps missing paths as text, handles an empty trail and updates the mode", () => {
    const { container, rerender } = renderWithUi(<Breadcrumb items={items} currentItem="none" />);
    rerender(<Breadcrumb items={items} currentItem="last" />);
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    rerender(<Breadcrumb items={[{ label: "No destination" }]} currentItem="none" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
    rerender(<Breadcrumb items={[]} currentItem="none" />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
