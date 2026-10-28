import { render, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { CatalogDetail } from "../editorial-catalog";
it("owns Image loading, error/fallback and source-keyed identity without losing custom media", () => {
  const { container, rerender } = render(
    <CatalogDetail
      title="One"
      image={{
        src: "/one.png",
        alt: "One",
        width: 200,
        height: 300,
        priority: true,
        fallback: "/fallback.png",
      }}
    />,
  );
  const art = () => container.querySelector(".ui-catalog-detail-art")!;
  const first = container.querySelector("img")!;
  expect(first).not.toBeNull();
  expect(art().getAttribute("data-status")).toBe("loading");
  expect(first.getAttribute("fetchpriority")).toBe("high");
  expect(first.getAttribute("loading")).toBe("eager");
  expect(first.getAttribute("data-fit")).toBe("contain");
  fireEvent.load(first);
  expect(art().getAttribute("data-status")).toBe("loaded");
  rerender(
    <CatalogDetail
      title="Two"
      image={{ src: "/two.png", alt: "Two", fallback: "/fallback.png" }}
    />,
  );
  const second = container.querySelector("img")!;
  expect(second).not.toBe(first);
  expect(art().getAttribute("data-status")).toBe("loading");
  fireEvent.error(second);
  expect(art().getAttribute("data-status")).toBe("error");
  expect(second.getAttribute("src")).toBe("/fallback.png");
  fireEvent.load(second);
  expect(art().getAttribute("data-status")).toBe("error");
  rerender(<CatalogDetail title="Custom" media={<span>Custom media</span>} />);
  expect(art().hasAttribute("data-status")).toBe(false);
  expect(art().textContent).toBe("Custom media");
});

it("reuses Image's complete-before-mount check for cached success and failure", () => {
  const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  const width = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(600);
  try {
    const { container, rerender } = render(
      <CatalogDetail
        title="Cached"
        image={{ src: "/cached.svg", alt: "Cached" }}
        media={<span>Ignored</span>}
      />,
    );
    expect(container.querySelector(".ui-catalog-detail-art")!.getAttribute("data-status")).toBe(
      "loaded",
    );
    expect(container.textContent).not.toContain("Ignored");
    expect(container.querySelector("img")!.getAttribute("loading")).toBe("lazy");
    width.mockReturnValue(0);
    rerender(
      <CatalogDetail
        title="Broken"
        image={{ src: "/broken.svg", alt: "Broken", fallback: "/fallback.svg" }}
      />,
    );
    expect(container.querySelector(".ui-catalog-detail-art")!.getAttribute("data-status")).toBe(
      "error",
    );
    expect(container.querySelector("img")!.getAttribute("src")).toBe("/fallback.svg");
  } finally {
    complete.mockRestore();
    width.mockRestore();
  }
});
